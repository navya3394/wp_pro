import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MusicPlayer from './components/MusicPlayer';
import SongList from './components/SongList';
import UploadSong from './components/UploadSong';
import Playlist from './components/Playlist';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('songs');

  // Fetch all songs
  const fetchSongs = async () => {
    try {
      const response = await axios.get(`${API_URL}/songs`);
      setSongs(response.data);
      if (currentPlaylist.length === 0) {
        setCurrentPlaylist(response.data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  // Fetch all playlists
  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`${API_URL}/playlists`);
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchPlaylists();
  }, []);

  // Search songs
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      fetchSongs();
    } else {
      try {
        const response = await axios.get(`${API_URL}/songs/search/${query}`);
        setSongs(response.data);
      } catch (error) {
        console.error('Error searching songs:', error);
      }
    }
  };

  // Play song
  const handlePlaySong = (song, playlist = null) => {
    setCurrentSong(song);
    if (playlist) {
      setCurrentPlaylist(playlist);
    }
  };

  // Delete song
  const handleDeleteSong = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await axios.delete(`${API_URL}/songs/${songId}`);
        fetchSongs();
        if (currentSong && currentSong._id === songId) {
          setCurrentSong(null);
        }
      } catch (error) {
        console.error('Error deleting song:', error);
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎵 MERN Music Player</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <nav className="nav-tabs">
            <button
              className={activeTab === 'songs' ? 'active' : ''}
              onClick={() => setActiveTab('songs')}
            >
              All Songs
            </button>
            <button
              className={activeTab === 'upload' ? 'active' : ''}
              onClick={() => setActiveTab('upload')}
            >
              Upload Song
            </button>
            <button
              className={activeTab === 'playlists' ? 'active' : ''}
              onClick={() => setActiveTab('playlists')}
            >
              Playlists
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {activeTab === 'songs' && (
            <SongList
              songs={songs}
              onPlaySong={handlePlaySong}
              onDeleteSong={handleDeleteSong}
              currentSong={currentSong}
            />
          )}

          {activeTab === 'upload' && (
            <UploadSong onUploadComplete={fetchSongs} />
          )}

          {activeTab === 'playlists' && (
            <Playlist
              playlists={playlists}
              songs={songs}
              onPlaySong={handlePlaySong}
              onRefresh={fetchPlaylists}
            />
          )}
        </main>
      </div>

      {currentSong && (
        <MusicPlayer
          song={currentSong}
          playlist={currentPlaylist}
          onSongChange={setCurrentSong}
        />
      )}
    </div>
  );
}

export default App;
