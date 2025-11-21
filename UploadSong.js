import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

function UploadSong({ onUploadComplete }) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      setMessage('Please select an audio file');
      return;
    }

    setUploading(true);
    setMessage('');

    const data = new FormData();
    data.append('audio', audioFile);
    data.append('title', formData.title || audioFile.name);
    data.append('artist', formData.artist);
    data.append('album', formData.album);
    data.append('genre', formData.genre);
    data.append('duration', formData.duration);

    try {
      await axios.post(`${API_URL}/songs/upload`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('✅ Song uploaded successfully!');
      setFormData({
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: ''
      });
      setAudioFile(null);
      e.target.reset();
      onUploadComplete();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error uploading song: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-song">
      <h2>Upload New Song</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Audio File *</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Song title"
          />
        </div>

        <div className="form-group">
          <label>Artist</label>
          <input
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleInputChange}
            placeholder="Artist name"
          />
        </div>

        <div className="form-group">
          <label>Album</label>
          <input
            type="text"
            name="album"
            value={formData.album}
            onChange={handleInputChange}
            placeholder="Album name"
          />
        </div>

        <div className="form-group">
          <label>Genre</label>
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            placeholder="Genre"
          />
        </div>

        <div className="form-group">
          <label>Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="e.g., 3:45"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={uploading}>
          {uploading ? 'Uploading...' : '📤 Upload Song'}
        </button>

        {message && <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</p>}
      </form>
    </div>
  );
}

export default UploadSong;
