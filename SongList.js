import React from 'react';

function SongList({ songs, onPlaySong, onDeleteSong, currentSong }) {
  return (
    <div className="song-list">
      <h2>All Songs ({songs.length})</h2>
      {songs.length === 0 ? (
        <p className="empty-state">No songs available. Upload some music!</p>
      ) : (
        <div className="songs-grid">
          {songs.map((song) => (
            <div
              key={song._id}
              className={`song-card ${currentSong && currentSong._id === song._id ? 'playing' : ''}`}
            >
              <div className="song-info">
                <h3>{song.title}</h3>
                <p className="artist">{song.artist}</p>
                <p className="album">{song.album}</p>
                <p className="genre">{song.genre}</p>
              </div>
              <div className="song-actions">
                <button
                  onClick={() => onPlaySong(song)}
                  className="btn-play"
                >
                  {currentSong && currentSong._id === song._id ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <button
                  onClick={() => onDeleteSong(song._id)}
                  className="btn-delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SongList;
