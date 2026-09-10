require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/masters');
const assignmentRoutes = require('./routes/assignments');
const entryRoutes = require('./routes/entries');
const bagRoutes = require('./routes/bags');

const app = express();
app.use(cors());
// Higher limit than Express's 100kb default - photo/SOP/PPAP uploads arrive
// as base64 JSON, which inflates file size by roughly a third.
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/bags', bagRoutes);

// Serve the built React PWA (client/dist) for everything else
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`SHRP shop floor server listening on ${PORT}`));
