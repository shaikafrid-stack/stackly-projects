const { Op, fn, col } = require('sequelize');
const { User, TrainingProgram, Enrollment, Certification } = require('../models');

// GET /api/dashboard/admin
exports.adminDashboard = async (req, res, next) => {
  try {
    const totalEmployees = await User.count({ where: { role: 'employee' } });
    const totalTrainers = await User.count({ where: { role: 'trainer' } });
    const activeTrainings = await TrainingProgram.count({ where: { status: 'active' } });
    const completedTrainings = await TrainingProgram.count({ where: { status: 'completed' } });
    const totalEnrollments = await Enrollment.count();
    const completedEnrollments = await Enrollment.count({ where: { completion_status: 'completed' } });

    const overallCompletionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    res.json({
      data: {
        totalEmployees,
        totalTrainers,
        activeTrainings,
        completedTrainings,
        overallCompletionRate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/trainer
exports.trainerDashboard = async (req, res, next) => {
  try {
    const trainerId = req.user.id;

    const totalPrograms = await TrainingProgram.count({ where: { trainer_id: trainerId } });
    const activeSessions = await TrainingProgram.count({ where: { trainer_id: trainerId, status: 'active' } });

    const trainings = await TrainingProgram.findAll({ where: { trainer_id: trainerId }, attributes: ['id'] });
    const trainingIds = trainings.map((t) => t.id);

    const employeesTrained = trainingIds.length
      ? await Enrollment.count({
          where: { training_id: { [Op.in]: trainingIds }, completion_status: 'completed' },
          distinct: true,
          col: 'employee_id',
        })
      : 0;

    const certificatesIssued = trainingIds.length
      ? await Certification.count({ where: { training_id: { [Op.in]: trainingIds } } })
      : 0;

    res.json({
      data: {
        totalPrograms,
        activeSessions,
        employeesTrained,
        certificatesIssued,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/employee
exports.employeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user.id;

    const enrolledTrainings = await Enrollment.count({ where: { employee_id: employeeId } });
    const completedTrainings = await Enrollment.count({
      where: { employee_id: employeeId, completion_status: 'completed' },
    });
    const pendingTrainings = await Enrollment.count({
      where: { employee_id: employeeId, completion_status: { [Op.in]: ['pending', 'in_progress'] } },
    });
    const certificationsEarned = await Certification.count({ where: { employee_id: employeeId } });

    res.json({
      data: {
        enrolledTrainings,
        completedTrainings,
        pendingTrainings,
        certificationsEarned,
      },
    });
  } catch (err) {
    next(err);
  }
};
