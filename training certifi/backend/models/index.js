const sequelize = require('../config/db');
const User = require('./User');
const TrainingProgram = require('./TrainingProgram');
const Enrollment = require('./Enrollment');
const Certification = require('./Certification');

// Trainer (User) -> TrainingPrograms
User.hasMany(TrainingProgram, { foreignKey: 'trainer_id', as: 'trainingsCreated' });
TrainingProgram.belongsTo(User, { foreignKey: 'trainer_id', as: 'trainer' });

// Employee (User) -> Enrollments
User.hasMany(Enrollment, { foreignKey: 'employee_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

// TrainingProgram -> Enrollments
TrainingProgram.hasMany(Enrollment, { foreignKey: 'training_id', as: 'enrollments' });
Enrollment.belongsTo(TrainingProgram, { foreignKey: 'training_id', as: 'training' });

// Employee (User) -> Certifications
User.hasMany(Certification, { foreignKey: 'employee_id', as: 'certifications' });
Certification.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

// TrainingProgram -> Certifications
TrainingProgram.hasMany(Certification, { foreignKey: 'training_id', as: 'certifications' });
Certification.belongsTo(TrainingProgram, { foreignKey: 'training_id', as: 'training' });

module.exports = {
  sequelize,
  User,
  TrainingProgram,
  Enrollment,
  Certification,
};
