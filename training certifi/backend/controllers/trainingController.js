const { Op } = require('sequelize');
const { TrainingProgram, User, Enrollment } = require('../models');

// GET /api/trainings  (supports search, filter by status/trainer, sort, pagination)
exports.getTrainings = async (req, res, next) => {
  try {
    const {
      search,
      status,
      trainer_id,
      sortBy = 'start_date',
      order = 'ASC',
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (trainer_id) {
      where.trainer_id = trainer_id;
    }

    // Trainers only see their own programs unless admin
    if (req.user.role === 'trainer') {
      where.trainer_id = req.user.id;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await TrainingProgram.findAndCountAll({
      where,
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name', 'email'] }],
      order: [[sortBy, order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
      limit: Number(limit),
      offset,
    });

    res.json({
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
};

// GET /api/trainings/:id
exports.getTrainingById = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findByPk(req.params.id, {
      include: [{ model: User, as: 'trainer', attributes: ['id', 'name', 'email'] }],
    });
    if (!training) {
      return res.status(404).json({ message: 'Training program not found' });
    }
    res.json({ data: training });
  } catch (err) {
    next(err);
  }
};

// POST /api/trainings (trainer or admin)
exports.createTraining = async (req, res, next) => {
  try {
    const { title, description, duration, start_date, end_date, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const trainer_id = req.user.role === 'admin' && req.body.trainer_id
      ? req.body.trainer_id
      : req.user.id;

    const training = await TrainingProgram.create({
      title,
      description,
      duration,
      start_date,
      end_date,
      status: status || 'upcoming',
      trainer_id,
    });

    res.status(201).json({ data: training });
  } catch (err) {
    next(err);
  }
};

// PUT /api/trainings/:id (trainer who owns it, or admin)
exports.updateTraining = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findByPk(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training program not found' });
    }

    if (req.user.role === 'trainer' && training.trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own training programs' });
    }

    const fields = ['title', 'description', 'duration', 'start_date', 'end_date', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) training[f] = req.body[f];
    });

    await training.save();
    res.json({ data: training });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/trainings/:id (trainer who owns it, or admin)
exports.deleteTraining = async (req, res, next) => {
  try {
    const training = await TrainingProgram.findByPk(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training program not found' });
    }

    if (req.user.role === 'trainer' && training.trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own training programs' });
    }

    await training.destroy();
    res.json({ message: 'Training program deleted' });
  } catch (err) {
    next(err);
  }
};
