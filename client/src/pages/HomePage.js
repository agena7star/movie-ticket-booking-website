import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { movieService, showtimeService } from '../services/api';
import { format } from 'date-fns';
import './HomePage.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [todayShowtimes, setTodayShowtimes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const nowShowing = await movieService.getAll('now_showing');
      const comingSoon = await movieService.getAll('coming_soon');
      setMovies(nowShowing);
      setUpcomingMovies(comingSoon);

      if (nowShowing.length > 0) {
        const showtimes = await showtimeService.getByMovie(nowShowing[0].id, format(new Date(), 'yyyy-MM-dd'));
        setTodayShowtimes(showtimes.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Book Your Movie Experience</h1>
          <p>Discover the latest movies and book tickets instantly</p>
          <Link to="/movies" className="btn-hero">Browse Movies</Link>
        </div>
      </section>

      <section className="now-showing">
        <div className="container">
          <h2>Now Showing</h2>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </section>

      {upcomingMovies.length > 0 && (
        <section className="coming-soon">
          <div className="container">
            <h2>Coming Soon</h2>
            <div className="movie-grid">
              {upcomingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
