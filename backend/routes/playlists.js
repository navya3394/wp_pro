const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Get all playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('songs');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single playlist
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new playlist
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const newPlaylist = new Playlist({
      name,
      description: description || '',
      songs: []
    });

    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add song to playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(
      song => song.toString() !== req.params.songId
    );
    
    await playlist.save();
    const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
