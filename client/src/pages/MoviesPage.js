import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { movieService } from '../services/api';
import './MoviesPage.css';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, [filter]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? null : filter;
      const data = await movieService.getAll(status);
      setMovies(data);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movies-page">
      <div className="container">
        <h1>Movies</h1>
        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'now_showing' ? 'active' : ''}
            onClick={() => setFilter('now_showing')}
          >
            Now Showing
          </button>
          <button
            className={filter === 'coming_soon' ? 'active' : ''}
            onClick={() => setFilter('coming_soon')}
          >
            Coming Soon
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading movies...</div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="no-results">No movies found</div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
