import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

function Playlist({ playlists, songs, onPlaySong, onRefresh }) {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showAddSong, setShowAddSong] = useState(false);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await axios.post(`${API_URL}/playlists`, {
        name: newPlaylistName,
        description: ''
      });
      setNewPlaylistName('');
      onRefresh();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await axios.delete(`${API_URL}/playlists/${playlistId}`);
        setSelectedPlaylist(null);
        onRefresh();
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    }
  };

  const addSongToPlaylist = async (songId) => {
    if (!selectedPlaylist) return;

    try {
      await axios.post(`${API_URL}/playlists/${selectedPlaylist._id}/songs`, {
        songId
      });
      onRefresh();
      setShowAddSong(false);
      // Refresh selected playlist
      const response = await axios.get(`${API_URL}/playlists/${selectedPlaylist._id}`);
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    if (!selectedPlaylist) return;

    try {
      await axios.delete(`${API_URL}/playlists/${selectedPlaylist._id}/songs/${songId}`);
      onRefresh();
      // Refresh selected playlist
      const response = await axios.get(`${API_URL}/playlists/${selectedPlaylist._id}`);
      setSelectedPlaylist(response.data);
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  return (
    <div className="playlist-section">
      <div className="playlist-header">
        <h2>Playlists</h2>
        <form onSubmit={createPlaylist} className="create-playlist-form">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
          />
          <button type="submit">+ Create</button>
        </form>
      </div>

      <div className="playlist-container">
        <div className="playlist-list">
          <h3>Your Playlists ({playlists.length})</h3>
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className={`playlist-item ${selectedPlaylist && selectedPlaylist._id === playlist._id ? 'active' : ''}`}
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <div className="playlist-info">
                <h4>{playlist.name}</h4>
                <p>{playlist.songs.length} songs</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlaylist(playlist._id);
                }}
                className="btn-delete-small"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="playlist-details">
          {selectedPlaylist ? (
            <>
              <div className="playlist-details-header">
                <h3>{selectedPlaylist.name}</h3>
                <button onClick={() => setShowAddSong(!showAddSong)} className="btn-add-song">
                  + Add Song
                </button>
              </div>

              {showAddSong && (
                <div className="add-song-modal">
                  <h4>Add Song to Playlist</h4>
                  <div className="song-selection">
                    {songs.map((song) => (
                      <div key={song._id} className="song-select-item">
                        <span>{song.title} - {song.artist}</span>
                        <button onClick={() => addSongToPlaylist(song._id)}>Add</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowAddSong(false)} className="btn-close">Close</button>
                </div>
              )}

              <div className="playlist-songs">
                {selectedPlaylist.songs.length === 0 ? (
                  <p className="empty-state">No songs in this playlist</p>
                ) : (
                  selectedPlaylist.songs.map((song, index) => (
                    <div key={song._id} className="playlist-song-item">
                      <span className="song-number">{index + 1}</span>
                      <div className="song-info-inline">
                        <h4>{song.title}</h4>
                        <p>{song.artist}</p>
                      </div>
                      <div className="song-actions-inline">
                        <button onClick={() => onPlaySong(song, selectedPlaylist.songs)}>▶️</button>
                        <button onClick={() => removeSongFromPlaylist(song._id)}>✖️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="empty-state">Select a playlist to view songs</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Playlist;
