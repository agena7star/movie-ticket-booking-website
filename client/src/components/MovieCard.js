import React from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <div className="movie-poster">
        <img src={movie.poster_url} alt={movie.title} />
        <div className="movie-overlay">
          <Link to={`/movies/${movie.id}`} className="btn-book">Book Now</Link>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="movie-genre">{movie.genre}</p>
        <div className="movie-meta">
          <span>{movie.duration} min</span>
          <span className={`status ${movie.status}`}>
            {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
