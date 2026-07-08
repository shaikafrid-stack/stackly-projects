const db = require('../config/db');

async function logAssetAction(assetId, actionType, actionDescription, performedBy) {
  await db.query(
    'INSERT INTO asset_history (asset_id, action_type, action_description, performed_by) VALUES (?, ?, ?, ?)',
    [assetId, actionType, actionDescription, performedBy || null]
  );
}

async function getAssetHistory(assetId) {
  const [rows] = await db.query(
    `SELECT ah.*, u.name AS performed_by_name
     FROM asset_history ah
     LEFT JOIN users u ON ah.performed_by = u.id
     WHERE ah.asset_id = ?
     ORDER BY ah.created_at DESC`,
    [assetId]
  );
  return rows;
}

module.exports = { logAssetAction, getAssetHistory };
