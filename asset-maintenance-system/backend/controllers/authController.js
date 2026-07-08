const authService = require('../services/authService');
const { success, failure } = require('../utils/response');

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return failure(res, 400, 'Name, email and password are required.');
    }

    const existing = await authService.findUserByEmail(email);
    if (existing) {
      return failure(res, 409, 'A user with this email already exists.');
    }

    const user = await authService.createUser({ name, email, password, role });
    const token = authService.generateToken(user);

    return success(res, 201, 'User registered successfully.', { user, token });
  } catch (err) {
    console.error('Register error:', err);
    return failure(res, 500, 'Server error while registering user.');
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return failure(res, 400, 'Email and password are required.');
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return failure(res, 401, 'Invalid email or password.');
    }

    const match = await authService.verifyPassword(password, user.password);
    if (!match) {
      return failure(res, 401, 'Invalid email or password.');
    }

    const token = authService.generateToken(user);
    delete user.password;

    return success(res, 200, 'Login successful.', { user, token });
  } catch (err) {
    console.error('Login error:', err);
    return failure(res, 500, 'Server error while logging in.');
  }
}

async function profile(req, res) {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) {
      return failure(res, 404, 'User not found.');
    }
    return success(res, 200, 'Profile fetched successfully.', { user });
  } catch (err) {
    console.error('Profile error:', err);
    return failure(res, 500, 'Server error while fetching profile.');
  }
}

module.exports = { register, login, profile };
