const { Enrollment, TrainingProgram, User } = require('../models');

// POST /api/enrollments (employee enrolls self)
exports.createEnrollment = async (req, res, next) => {
  try {
    const { training_id } = req.body;
    if (!training_id) {
      return res.status(400).json({ message: 'training_id is required' });
    }

    const training = await TrainingProgram.findByPk(training_id);
    if (!training) {
      return res.status(404).json({ message: 'Training program not found' });
    }

    // Business rule: employee can enroll only once per training program
    const existing = await Enrollment.findOne({
      where: { employee_id: req.user.id, training_id },
    });
    if (existing) {
      return res.status(409).json({ message: 'You are already enrolled in this training program' });
    }

    const enrollment = await Enrollment.create({
      employee_id: req.user.id,
      training_id,
      enrollment_date: new Date(),
      completion_status: 'pending',
      progress_percentage: 0,
    });

    res.status(201).json({ data: enrollment });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'You are already enrolled in this training program' });
    }
    next(err);
  }
};

// GET /api/enrollments
// employee: own enrollments; trainer: enrollments for their trainings; admin: all
exports.getEnrollments = async (req, res, next) => {
  try {
    const { training_id, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (training_id) where.training_id = training_id;
    if (status) where.completion_status = status;

    if (req.user.role === 'employee') {
      where.employee_id = req.user.id;
    }

    const include = [
      { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
      {
        model: TrainingProgram,
        as: 'training',
        attributes: ['id', 'title', 'trainer_id', 'status'],
      },
    ];

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Enrollment.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset,
      order: [['enrollment_date', 'DESC']],
    });

    // Trainer: filter to only enrollments for trainings they own
    let data = rows;
    if (req.user.role === 'trainer') {
      data = rows.filter((e) => e.training && e.training.trainer_id === req.user.id);
    }

    res.json({
      data,
      pagination: { total: count, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/enrollments/:id
// trainer updates attendance/completion/progress for their own training's enrollments
exports.updateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [{ model: TrainingProgram, as: 'training' }],
    });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (req.user.role === 'trainer' && enrollment.training.trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage enrollments for your own trainings' });
    }
    if (req.user.role === 'employee' && enrollment.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only view/update your own enrollment' });
    }

    const fields = ['completion_status', 'progress_percentage', 'attendance'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) enrollment[f] = req.body[f];
    });

    await enrollment.save();
    res.json({ data: enrollment });
  } catch (err) {
    next(err);
  }
};
