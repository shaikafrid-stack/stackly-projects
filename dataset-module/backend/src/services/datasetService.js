const fs = require('fs');
const path = require('path');
const { Dataset, DatasetColumn, ValidationResult, ValidationError, User } = require('../models');
const { parseDatasetFile } = require('../utils/fileParser');
const { detectSchema } = require('./schemaService');
const { runValidation } = require('./validationService');

class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function createDataset({ name, description, category, tags, file, userId }) {
  if (!file) throw new AppError('No file uploaded', 400);
  if (file.size === 0) throw new AppError('Uploaded file is empty', 400);

  const existing = await Dataset.findOne({ where: { name, uploaded_by: userId } });
  if (existing) {
    fs.unlinkSync(file.path);
    throw new AppError('A dataset with this name already exists', 409);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const fileType = ext === '.csv' ? 'CSV' : 'XLSX';

  const dataset = await Dataset.create({
    name,
    description,
    category,
    tags,
    file_name: file.filename,
    original_file_name: file.originalname,
    file_type: fileType,
    file_size: file.size,
    storage_path: file.path,
    uploaded_by: userId,
    status: 'UPLOADED'
  });

  return dataset;
}

async function listDatasets({ userId, role, status, search, page = 1, limit = 10 }) {
  const where = {};
  if (role !== 'ADMIN') where.uploaded_by = userId;
  if (status) where.status = status;
  if (search) {
    const { Op } = require('sequelize');
    where.name = { [Op.like]: `%${search}%` };
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Dataset.findAndCountAll({
    where,
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    order: [['uploaded_at', 'DESC']],
    offset,
    limit: parseInt(limit, 10)
  });

  return { datasets: rows, total: count, page: parseInt(page, 10), limit: parseInt(limit, 10) };
}

async function getDatasetById(id) {
  const dataset = await Dataset.findByPk(id, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
      { model: DatasetColumn, as: 'columns' }
    ]
  });
  if (!dataset) throw new AppError('Dataset not found', 404);
  return dataset;
}

async function deleteDataset(id) {
  const dataset = await Dataset.findByPk(id);
  if (!dataset) throw new AppError('Dataset not found', 404);
  if (fs.existsSync(dataset.storage_path)) fs.unlinkSync(dataset.storage_path);
  await dataset.destroy();
}

async function previewDataset(id, limit = 20) {
  const dataset = await getDatasetById(id);
  const { headers, rows } = parseDatasetFile(dataset.storage_path, dataset.file_type);
  return {
    columns: headers,
    total_rows: rows.length,
    total_columns: headers.length,
    preview_rows: rows.slice(0, limit)
  };
}

async function detectAndPersistSchema(dataset) {
  const { headers, rows } = parseDatasetFile(dataset.storage_path, dataset.file_type);
  const schema = detectSchema(headers, rows);

  await DatasetColumn.destroy({ where: { dataset_id: dataset.id } });
  await DatasetColumn.bulkCreate(schema.map((c) => ({ ...c, dataset_id: dataset.id })));

  await dataset.update({ row_count: rows.length, column_count: headers.length });
  return { headers, rows, schema };
}

async function getSchema(id) {
  const dataset = await getDatasetById(id);
  const columns = await DatasetColumn.findAll({ where: { dataset_id: id }, order: [['column_order', 'ASC']] });
  return columns;
}

async function validateDataset(id) {
  const dataset = await Dataset.findByPk(id);
  if (!dataset) throw new AppError('Dataset not found', 404);

  await dataset.update({ status: 'VALIDATING' });

  try {
    const { headers, rows, schema } = await detectAndPersistSchema(dataset);
    const { summary, errors } = runValidation(headers, rows, schema);

    // Remove previous validation results for a clean re-validation
    const previous = await ValidationResult.findAll({ where: { dataset_id: id } });
    for (const p of previous) await p.destroy();

    const validationResult = await ValidationResult.create({ dataset_id: id, ...summary });
    if (errors.length > 0) {
      await ValidationError.bulkCreate(
        errors.map((e) => ({ ...e, validation_id: validationResult.id }))
      );
    }

    const newStatus = summary.validation_status === 'PASSED' ? 'VALIDATED' : 'VALIDATION_FAILED';
    await dataset.update({ status: newStatus });

    return { dataset, validationResult, errors };
  } catch (err) {
    await dataset.update({ status: 'FAILED' });
    throw err;
  }
}

async function getValidationResults(id) {
  const validationResult = await ValidationResult.findOne({
    where: { dataset_id: id },
    order: [['created_at', 'DESC']],
    include: [{ model: ValidationError, as: 'errors' }]
  });
  if (!validationResult) throw new AppError('No validation results found for this dataset', 404);
  return validationResult;
}

async function processDataset(id) {
  const dataset = await Dataset.findByPk(id);
  if (!dataset) throw new AppError('Dataset not found', 404);

  if (!['VALIDATED', 'PROCESSING', 'FAILED'].includes(dataset.status)) {
    throw new AppError(`Dataset must be VALIDATED before processing (current status: ${dataset.status})`, 400);
  }

  await dataset.update({ status: 'PROCESSING' });

  try {
    // Simulated ingestion step: in a production system this is where validated
    // rows would be persisted into destination tables / a data warehouse,
    // ideally via an async job/queue (see README write-up).
    const { rows } = parseDatasetFile(dataset.storage_path, dataset.file_type);
    await new Promise((resolve) => setTimeout(resolve, 300)); // simulate work

    await dataset.update({
      status: 'PROCESSED',
      processed_at: new Date(),
      row_count: rows.length
    });
    return dataset;
  } catch (err) {
    await dataset.update({ status: 'FAILED' });
    throw new AppError('Processing failed: ' + err.message, 500);
  }
}

async function getProcessingStatus(id) {
  const dataset = await Dataset.findByPk(id, { attributes: ['id', 'status', 'processed_at', 'row_count', 'column_count'] });
  if (!dataset) throw new AppError('Dataset not found', 404);
  return dataset;
}

module.exports = {
  AppError,
  createDataset,
  listDatasets,
  getDatasetById,
  deleteDataset,
  previewDataset,
  getSchema,
  validateDataset,
  getValidationResults,
  processDataset,
  getProcessingStatus
};
