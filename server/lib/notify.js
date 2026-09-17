const pool = require('../db/pool');

// In-app notifications. No external delivery (SMS/WhatsApp/email) - these
// only show up inside the app for the recipient's own login.
async function notifyUser(userId, type, message, link = null) {
  if (!userId) return;
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, message, link) VALUES ($1,$2,$3,$4)',
      [userId, type, message, link]
    );
  } catch (err) {
    console.warn('Failed to insert in-app notification:', err.message);
  }
}

async function notifyRoles(roles, type, message, link = null) {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE role = ANY($1) AND active = TRUE',
      [roles]
    );
    for (const r of rows) {
      await notifyUser(r.id, type, message, link);
    }
  } catch (err) {
    console.warn('Failed to notify roles:', err.message);
  }
}

module.exports = { notifyUser, notifyRoles };
