const crypto = require('crypto');
const { Certification, Enrollment, TrainingProgram, User } = require('../models');

const generateCertNumber = (trainingId, employeeId) => {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CERT-${trainingId}-${employeeId}-${random}`;
};

// POST /api/certifications (trainer issues certificate, admin can too)
exports.issueCertification = async (req, res, next) => {
  try {
    const { employee_id, training_id, expiry_date } = req.body;
    if (!employee_id || !training_id) {
      return res.status(400).json({ message: 'employee_id and training_id are required' });
    }

    const training = await TrainingProgram.findByPk(training_id);
    if (!training) {
      return res.status(404).json({ message: 'Training program not found' });
    }

    if (req.user.role === 'trainer' && training.trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only issue certificates for your own trainings' });
    }

    // Validation: enrollment must exist and be marked completed before issuing certificate
    const enrollment = await Enrollment.findOne({ where: { employee_id, training_id } });
    if (!enrollment) {
      return res.status(400).json({ message: 'Employee is not enrolled in this training program' });
    }
    if (enrollment.completion_status !== 'completed') {
      return res.status(400).json({ message: 'Training must be marked as completed before issuing a certificate' });
    }

    // Prevent duplicate certificate for same employee/training
    const existingCert = await Certification.findOne({ where: { employee_id, training_id } });
    if (existingCert) {
      return res.status(409).json({ message: 'Certificate already issued for this employee and training' });
    }

    const certification = await Certification.create({
      employee_id,
      training_id,
      certificate_number: generateCertNumber(training_id, employee_id),
      issued_date: new Date(),
      expiry_date: expiry_date || null,
    });

    res.status(201).json({ data: certification });
  } catch (err) {
    next(err);
  }
};

// GET /api/certifications
// employee: own; trainer: for their trainings; admin: all
exports.getCertifications = async (req, res, next) => {
  try {
    const { training_id, employee_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (training_id) where.training_id = training_id;

    if (req.user.role === 'employee') {
      where.employee_id = req.user.id;
    } else if (employee_id) {
      where.employee_id = employee_id;
    }

    const include = [
      { model: User, as: 'employee', attributes: ['id', 'name', 'email'] },
      { model: TrainingProgram, as: 'training', attributes: ['id', 'title', 'trainer_id'] },
    ];

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Certification.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset,
      order: [['issued_date', 'DESC']],
    });

    let data = rows;
    if (req.user.role === 'trainer') {
      data = rows.filter((c) => c.training && c.training.trainer_id === req.user.id);
    }

    res.json({ data, pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
};
