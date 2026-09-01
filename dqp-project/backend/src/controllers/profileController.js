const fs = require('fs');
const { Op } = require('sequelize');
const {
  Dataset,
  DatasetProfile,
  ColumnProfile,
  QualityIssue,
} = require('../models');
const { profileDataset } = require('../services/profilingService');

async function runProfiling(req, res, next) {
  try {
    const dataset = await Dataset.findByPk(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    if (dataset.status !== 'PROCESSED') {
      return res.status(400).json({
        success: false,
        message: `Dataset must be in PROCESSED status to run profiling (current: ${dataset.status})`,
      });
    }
    if (!fs.existsSync(dataset.filePath)) {
      return res.status(404).json({ success: false, message: 'Underlying dataset file is missing' });
    }

    dataset.profileStatus = 'IN_PROGRESS';
    await dataset.save();

    let result;
    try {
      result = profileDataset(dataset.filePath);
    } catch (e) {
      dataset.profileStatus = 'FAILED';
      await dataset.save();
      return res.status(422).json({ success: false, message: `Profiling failed: ${e.message}` });
    }

    if (result.datasetLevel.totalRows === 0) {
      dataset.profileStatus = 'FAILED';
      await dataset.save();
      return res.status(422).json({ success: false, message: 'Cannot profile an empty dataset' });
    }

    const profile = await DatasetProfile.create({
      datasetId: dataset.id,
      ...result.datasetLevel,
      profiledAt: new Date(),
    });

    const columnRecords = result.columns.map((c) => ({
      profileId: profile.id,
      datasetId: dataset.id,
      ...c,
    }));
    await ColumnProfile.bulkCreate(columnRecords);

    // Replace old issues with fresh ones for this dataset
    await QualityIssue.destroy({ where: { datasetId: dataset.id } });
    if (result.issues.length) {
      await QualityIssue.bulkCreate(
        result.issues.map((i) => ({ datasetId: dataset.id, ...i }))
      );
    }

    dataset.profileStatus = 'COMPLETED';
    dataset.qualityScore = result.datasetLevel.qualityScore;
    dataset.lastProfiledAt = new Date();
    dataset.rowCount = result.datasetLevel.totalRows;
    dataset.columnCount = result.datasetLevel.totalColumns;
    await dataset.save();

    res.status(201).json({ success: true, data: { profile, columns: columnRecords, issuesCount: result.issues.length } });
  } catch (err) {
    next(err);
  }
}

async function getLatestProfile(req, res, next) {
  try {
    const profile = await DatasetProfile.findOne({
      where: { datasetId: req.params.id },
      order: [['profiledAt', 'DESC']],
    });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'No profiling results found. Please run profiling first.' });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

async function getColumnProfiles(req, res, next) {
  try {
    const profile = await DatasetProfile.findOne({
      where: { datasetId: req.params.id },
      order: [['profiledAt', 'DESC']],
    });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'No profiling results found. Please run profiling first.' });
    }

    const { sortBy = 'columnName', order = 'ASC', dataType, qualityStatus, search } = req.query;
    const where = { profileId: profile.id };
    if (dataType) where.dataType = dataType;
    if (qualityStatus) where.qualityStatus = qualityStatus;
    if (search) where.columnName = { [Op.like]: `%${search}%` };

    const validSort = ['columnName', 'qualityScore', 'nullPercentage', 'uniquePercentage', 'dataType'];
    const sortField = validSort.includes(sortBy) ? sortBy : 'columnName';

    const columns = await ColumnProfile.findAll({
      where,
      order: [[sortField, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
    });

    res.json({ success: true, data: columns });
  } catch (err) {
    next(err);
  }
}

async function getColumnProfileById(req, res, next) {
  try {
    const column = await ColumnProfile.findOne({
      where: { id: req.params.columnId, datasetId: req.params.id },
    });
    if (!column) {
      return res.status(404).json({ success: false, message: 'Column profile not found' });
    }
    res.json({ success: true, data: column });
  } catch (err) {
    next(err);
  }
}

module.exports = { runProfiling, getLatestProfile, getColumnProfiles, getColumnProfileById };
