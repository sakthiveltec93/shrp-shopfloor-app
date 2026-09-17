const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { isValidGSTIN } = require('../lib/gstinValidator');

router.use(requireAuth);

/**
 * Format and checksum validation endpoint (local, instant, zero rate-limit cost)
 */
router.get('/validate/:gstin', (req, res) => {
  const { gstin } = req.params;
  const valid = isValidGSTIN(gstin);
  res.json({ gstin: gstin.toUpperCase(), valid });
});

/**
 * Live GSTIN verification via gstinapi.in (rate-limited, protected by auth)
 */
router.get('/verify/:gstin', async (req, res) => {
  const { gstin } = req.params;
  const normalizedGstin = (gstin || '').trim().toUpperCase();

  if (!isValidGSTIN(normalizedGstin)) {
    return res.status(400).json({ error: 'Invalid GSTIN format or checksum digit. Please verify the 15-character number.' });
  }

  const apiKey = process.env.GST_VERIFY_API_KEY;
  if (!apiKey) {
    console.warn('[GST-VERIFY] GST_VERIFY_API_KEY is not configured in environment.');
    return res.status(503).json({ error: 'GST verification API key is not configured on server' });
  }

  try {
    const response = await fetch(`https://www.gstinapi.in/v1/gstin/${encodeURIComponent(normalizedGstin)}`, {
      headers: { 'x-api-key': apiKey },
    });

    const result = await response.json();
    if (!result || !result.success) {
      return res.status(404).json({
        error: result?.message || result?.error || 'GSTIN not found or verification failed',
      });
    }

    res.json(result.data);
  } catch (err) {
    console.warn('[GST-VERIFY] External API request failed:', err.message);
    res.status(502).json({ error: 'GST verification service unavailable — try again shortly' });
  }
});

module.exports = router;
