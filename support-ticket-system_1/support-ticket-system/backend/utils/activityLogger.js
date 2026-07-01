const { ActivityLog } = require('../models');

exports.logActivity = async (userId, activity, moduleName) => {
  try {
    await ActivityLog.create({ user_id: userId, activity, module_name: moduleName });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};
