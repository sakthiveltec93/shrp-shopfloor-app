const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { JWT_SECRET } = require('../middleware/auth');

let UAParser;
try {
  UAParser = require('ua-parser-js');
} catch (e) {
  UAParser = null;
}

function parseDeviceLabel(userAgent) {
  if (!userAgent) return 'Unknown Device';
  if (UAParser) {
    try {
      const parser = new UAParser(userAgent);
      const res = parser.getResult();
      const browser = res.browser.name ? `${res.browser.name} ${res.browser.major || ''}`.trim() : '';
      const os = res.os.name ? `${res.os.name} ${res.os.version || ''}`.trim() : '';
      const device = res.device.model || res.device.vendor || '';
      const label = [device, os, browser].filter(Boolean).join(' · ');
      if (label) return label;
    } catch (e) {}
  }
  let os = 'Unknown OS';
  if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  let browser = 'Browser';
  if (/chrome|crios/i.test(userAgent) && !/edge|edg|opr\//i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = 'Safari';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
  else if (/edg/i.test(userAgent)) browser = 'Edge';

  return `${os} · ${browser}`;
}

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, pin } = req.body;
  if (!username || !pin) {
    return res.status(400).json({ error: 'Username and PIN required' });
  }

  const deviceId = req.headers['x-device-id'] || 'unknown';

  // 1. Check if device is blocked by admin
  if (deviceId && deviceId !== 'unknown') {
    try {
      const { rows: blockedRows } = await pool.query(
        'SELECT id, reason FROM blocked_devices WHERE device_id = $1',
        [deviceId]
      );
      if (blockedRows.length > 0) {
        return res.status(403).json({ error: 'This device has been blocked by admin.' });
      }
    } catch (err) {
      console.warn('Blocked device check failed:', err.message);
    }
  }

  // 2. Validate user and credentials
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND active = TRUE AND deleted_at IS NULL',
    [username.trim()]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid username or PIN' });

  const ok = await bcrypt.compare(pin, user.pin_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid username or PIN' });

  // 3. Office Premises IP Check (Admin exempt) - DISABLED in favor of Device-Allowlist enforcement
  const clientIp = (req.ip || '').replace(/^::ffff:/, '').trim();
  const userAgent = req.headers['user-agent'] || null;
  const deviceLabel = parseDeviceLabel(userAgent);

  // [DISABLED IP CHECK - DO NOT DELETE]
  // if (user.role !== 'admin') {
  //   try {
  //     const { rows: ipRows } = await pool.query(
  //       'SELECT id FROM allowed_ips WHERE (ip_address = $1 OR ip_address = $2) AND active = TRUE',
  //       [req.ip, clientIp]
  //     );
  //     if (ipRows.length === 0) {
  //       return res.status(403).json({ error: 'This app can only be accessed from office premises.' });
  //     }
  //   } catch (ipErr) {
  //     console.warn('Allowed IP check warning:', ipErr.message);
  //   }
  // }

  // 4. Strict Device Allowlist Gate (Admin exempt)
  if (user.role !== 'admin') {
    let isApproved = false;
    if (deviceId && deviceId !== 'unknown') {
      try {
        const { rows: approvedRows } = await pool.query(
          'SELECT id FROM approved_devices WHERE device_id = $1',
          [deviceId]
        );
        if (approvedRows.length > 0) {
          isApproved = true;
        }
      } catch (devErr) {
        console.warn('Approved device check error:', devErr.message);
      }
    }

    if (!isApproved) {
      // Record attempt in login_history so it appears in admin pending approval list
      try {
        await pool.query(
          `INSERT INTO login_history (user_id, device_id, ip_address, user_agent, device_label)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, deviceId, clientIp, userAgent, deviceLabel]
        );
      } catch (histErr) {
        console.warn('Failed to log login history for unapproved device:', histErr.message);
      }

      return res.status(403).json({
        error: 'This device is not approved. Ask an admin to approve it before you can log in.',
        code: 'device_not_approved',
      });
    }
  }

  // 5. Log successful login to login_history
  try {
    await pool.query(
      `INSERT INTO login_history (user_id, device_id, ip_address, user_agent, device_label)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, deviceId, clientIp, userAgent, deviceLabel]
    );
  } catch (histErr) {
    console.warn('Failed to log login history:', histErr.message);
  }

  // 5. Fetch page permissions and sign JWT
  const pagesRes = await pool.query('SELECT page_key FROM user_page_access WHERE user_id = $1', [user.id]);
  const pages = pagesRes.rows.map((r) => r.page_key);

  const token = jwt.sign(
    { id: user.id, username: user.username, full_name: user.full_name, role: user.role, assigned_process: user.assigned_process || 'PRODUCTION' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  // 6. Record login activity
  try {
    await pool.query(
      `UPDATE users SET last_login_at = now(), last_active_at = now() WHERE id = $1`,
      [user.id]
    );
    await pool.query(
      `INSERT INTO user_activity_log (user_id, activity_date, first_login_at, last_active_at, active_minutes, actions_count, last_page)
       VALUES ($1, CURRENT_DATE, now(), now(), 1, 1, '/home')
       ON CONFLICT (user_id, activity_date)
       DO UPDATE SET
         last_active_at = now(),
         actions_count = user_activity_log.actions_count + 1`,
      [user.id]
    );
  } catch (logErr) {
    console.warn('Failed to log login activity:', logErr.message);
  }

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      assigned_process: user.assigned_process || 'PRODUCTION',
      default_language: user.default_language || 'en',
      pages,
    },
  });
});

module.exports = router;
