const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');

// GET /api/users?role=employee|trainer|admin
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: Number(limit),
      offset,
      order: [['name', 'ASC']],
    });

    res.json({ data: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id (admin edits a user, e.g. role change, deactivate via role field)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    const { password: _pw, ...safeUser } = user.toJSON();
    res.json({ data: safeUser });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id (admin removes a user)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
