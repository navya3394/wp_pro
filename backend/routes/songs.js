const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/songs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Get all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ uploadDate: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single song
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload new song
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const { title, artist, album, genre, duration } = req.body;

    const newSong = new Song({
      title: title || 'Untitled',
      artist: artist || 'Unknown Artist',
      album: album || 'Unknown Album',
      genre: genre || 'Unknown',
      duration: duration || '0:00',
      fileName: req.file.filename,
      filePath: `/uploads/songs/${req.file.filename}`
    });

    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// Update song
router.put('/:id', async (req, res) => {
  try {
    const { title, artist, album, genre } = req.body;
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      { title, artist, album, genre },
      { new: true }
    );
    
    if (!updatedSong) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.json(updatedSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete song
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads/songs', song.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search songs
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { album: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
