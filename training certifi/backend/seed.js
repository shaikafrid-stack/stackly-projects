require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const { User, TrainingProgram, Enrollment, Certification } = require('./models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // WARNING: drops and recreates tables

    const password = await bcrypt.hash('Password123!', 10);

    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@example.com',
      password,
      role: 'admin',
    });

    const trainer1 = await User.create({
      name: 'Tom Trainer',
      email: 'trainer@example.com',
      password,
      role: 'trainer',
    });

    const trainer2 = await User.create({
      name: 'Tina Trainer',
      email: 'trainer2@example.com',
      password,
      role: 'trainer',
    });

    const employee1 = await User.create({
      name: 'Emma Employee',
      email: 'employee@example.com',
      password,
      role: 'employee',
    });

    const employee2 = await User.create({
      name: 'Ethan Employee',
      email: 'employee2@example.com',
      password,
      role: 'employee',
    });

    const training1 = await TrainingProgram.create({
      title: 'Workplace Safety Fundamentals',
      description: 'Covers essential workplace safety protocols and compliance.',
      trainer_id: trainer1.id,
      duration: '2 weeks',
      start_date: '2026-08-01',
      end_date: '2026-08-14',
      status: 'active',
    });

    const training2 = await TrainingProgram.create({
      title: 'Advanced Excel for Analysts',
      description: 'Deep dive into formulas, pivot tables, and dashboards.',
      trainer_id: trainer2.id,
      duration: '3 weeks',
      start_date: '2026-07-01',
      end_date: '2026-07-21',
      status: 'completed',
    });

    const training3 = await TrainingProgram.create({
      title: 'Leadership Essentials',
      description: 'Foundational leadership and communication skills.',
      trainer_id: trainer1.id,
      duration: '4 weeks',
      start_date: '2026-09-01',
      end_date: '2026-09-28',
      status: 'upcoming',
    });

    const enrollment1 = await Enrollment.create({
      employee_id: employee1.id,
      training_id: training2.id,
      enrollment_date: '2026-06-25',
      completion_status: 'completed',
      progress_percentage: 100,
      attendance: 'present',
    });

    await Enrollment.create({
      employee_id: employee2.id,
      training_id: training1.id,
      enrollment_date: '2026-08-01',
      completion_status: 'in_progress',
      progress_percentage: 40,
      attendance: 'present',
    });

    await Enrollment.create({
      employee_id: employee1.id,
      training_id: training1.id,
      enrollment_date: '2026-08-02',
      completion_status: 'pending',
      progress_percentage: 0,
      attendance: 'not_marked',
    });

    await Certification.create({
      employee_id: employee1.id,
      training_id: training2.id,
      certificate_number: `CERT-${training2.id}-${employee1.id}-SEED1`,
      issued_date: '2026-07-22',
      expiry_date: '2028-07-22',
    });

    console.log('Seed complete!');
    console.log('Test credentials (password for all: Password123!):');
    console.log('  Admin:    admin@example.com');
    console.log('  Trainer:  trainer@example.com / trainer2@example.com');
    console.log('  Employee: employee@example.com / employee2@example.com');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
