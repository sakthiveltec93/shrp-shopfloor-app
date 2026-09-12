const pool = require('../db/pool');

// In-app notifications. No external delivery (SMS/WhatsApp/email) - these
// only show up inside the app for the recipient's own login.
async function notifyUser(userId, type, message, link = null) {
  await pool.query(
    'INSERT INTO notifications (user_id, type, message, link) VALUES ($1,$2,$3,$4)',
    [userId, type, message, link]
  );
}

async function notifyRoles(roles, type, message, link = null) {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE role = ANY($1) AND active = TRUE',
    [roles]
  );
  for (const r of rows) {
    await notifyUser(r.id, type, message, link);
  }
}

module.exports = { notifyUser, notifyRoles };
