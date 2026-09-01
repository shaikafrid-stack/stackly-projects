const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Dataset } = require('../models');
const { readDatasetRows } = require('../services/profilingService');

async function listDatasets(req, res, next) {
  try {
    const { search = '', status, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = req.query;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Dataset.findAndCountAll({
      where,
      order: [[sortBy, order]],
      offset,
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getDataset(req, res, next) {
  try {
    const dataset = await Dataset.findByPk(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    res.json({ success: true, data: dataset });
  } catch (err) {
    next(err);
  }
}

async function uploadDataset(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    let rowCount = 0;
    let columnCount = 0;
    let status = 'PROCESSED';

    try {
      const rows = readDatasetRows(filePath);
      rowCount = rows.length;
      columnCount = rows.length ? Object.keys(rows[0]).length : 0;
      if (rowCount === 0) {
        status = 'FAILED';
      }
    } catch (e) {
      status = 'FAILED';
    }

    const dataset = await Dataset.create({
      name: req.body.name || req.file.originalname.replace(/\.[^/.]+$/, ''),
      fileName: req.file.originalname,
      filePath,
      fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'CSV',
      rowCount,
      columnCount,
      status,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: dataset });
  } catch (err) {
    next(err);
  }
}

async function deleteDataset(req, res, next) {
  try {
    const dataset = await Dataset.findByPk(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    if (dataset.filePath && fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }
    await dataset.destroy();
    res.json({ success: true, message: 'Dataset deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDatasets, getDataset, uploadDataset, deleteDataset };
