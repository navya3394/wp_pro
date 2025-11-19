const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Music Player API Running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🎵 Server running on port ${PORT}`);
});
