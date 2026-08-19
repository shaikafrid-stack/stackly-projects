const datasetService = require('../services/datasetService');

async function upload(req, res, next) {
  try {
    const { name, description, category, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Dataset name is required' });

    const dataset = await datasetService.createDataset({
      name,
      description,
      category,
      tags,
      file: req.file,
      userId: req.user.id
    });
    res.status(201).json(dataset);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, search, page, limit } = req.query;
    const result = await datasetService.listDatasets({
      userId: req.user.id,
      role: req.user.role,
      status,
      search,
      page,
      limit
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const dataset = await datasetService.getDatasetById(req.params.id);
    res.json(dataset);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await datasetService.deleteDataset(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function preview(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await datasetService.previewDataset(req.params.id, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function schema(req, res, next) {
  try {
    const result = await datasetService.getSchema(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function validate(req, res, next) {
  try {
    const result = await datasetService.validateDataset(req.params.id);
    res.json({
      dataset_id: result.dataset.id,
      status: result.dataset.status,
      summary: result.validationResult,
      error_count: result.errors.length
    });
  } catch (err) {
    next(err);
  }
}

async function validationResults(req, res, next) {
  try {
    const result = await datasetService.getValidationResults(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function process(req, res, next) {
  try {
    const dataset = await datasetService.processDataset(req.params.id);
    res.json(dataset);
  } catch (err) {
    next(err);
  }
}

async function processingStatus(req, res, next) {
  try {
    const dataset = await datasetService.getProcessingStatus(req.params.id);
    res.json(dataset);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  upload,
  list,
  getOne,
  remove,
  preview,
  schema,
  validate,
  validationResults,
  process,
  processingStatus
};
