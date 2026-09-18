require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/masters');
const assignmentRoutes = require('./routes/assignments');
const entryRoutes = require('./routes/entries');
const bagRoutes = require('./routes/bags');
const sessionRoutes = require('./routes/sessions');
const checksheetRoutes = require('./routes/checksheet');
const userRoutes = require('./routes/users');
const accountRoutes = require('./routes/account');
const notificationRoutes = require('./routes/notifications');
const attendanceRoutes = require('./routes/attendance');
const deletionRoutes = require('./routes/deletions');
const correctionRoutes = require('./routes/corrections');
const reportRoutes = require('./routes/reports');
const machineRoutes = require('./routes/machines');
const mouldRoutes = require('./routes/moulds');
const rawMaterialRoutes = require('./routes/rawMaterials');
const gaugeRoutes = require('./routes/gauges');
const supplierRoutes = require('./routes/suppliers');
const planningRoutes = require('./routes/planning');
const fpaRoutes = require('./routes/fpa');
const securityRoutes = require('./routes/security');
const gstRoutes = require('./routes/gst');
const dispatchRoutes = require('./routes/dispatch');

const fs = require('fs');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
// Higher limit than Express's 100kb default - photo/SOP/PPAP uploads arrive
// as base64 JSON, which inflates file size by roughly a third.
app.use(express.json({ limit: '15mb' }));

// Public Company Profile & Product Catalog Route
app.get(['/company-profile', '/profile', '/catalog'], (req, res) => {
  const profilePath = path.join(__dirname, '..', 'SHRP_Company_Profile.html');
  if (fs.existsSync(profilePath)) {
    return res.sendFile(profilePath);
  }
  res.status(404).send('Company profile document not found.');
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/bags', bagRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/checksheet', checksheetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/deletions', deletionRoutes);
app.use('/api/corrections', correctionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/moulds', mouldRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/gauges', gaugeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/fpa', fpaRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/dispatch', dispatchRoutes);

// Serve the built React PWA (client/dist) for everything else
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js') || filePath.endsWith('index.html') || filePath.endsWith('.webmanifest')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(clientDist, 'index.html'));
});

const { initDb } = require('./db/initDb');

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`SHRP shop floor server listening on ${PORT}`);
  await initDb();
});
