import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, showtimeService } from '../services/api';
import { format } from 'date-fns';
import './MovieDetailPage.css';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  useEffect(() => {
    if (movie) {
      loadShowtimes(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [movie, selectedDate]);

  const loadMovie = async () => {
    try {
      const data = await movieService.getById(id);
      setMovie(data);
    } catch (error) {
      console.error('Failed to load movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShowtimes = async (date) => {
    try {
      const data = await showtimeService.getByMovie(id, date);
      setShowtimes(data);
    } catch (error) {
      console.error('Failed to load showtimes:', error);
    }
  };

  const handleBookTicket = (showtime) => {
    navigate(`/booking/${showtime.id}/seats`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-backdrop" style={{ backgroundImage: `url(${movie.poster_url})` }} />
      <div className="container">
        <div className="movie-content">
          <div className="movie-poster">
            <img src={movie.poster_url} alt={movie.title} />
          </div>
          <div className="movie-info">
            <h1>{movie.title}</h1>
            <div className="movie-meta">
              <span>{movie.genre}</span>
              <span>{movie.duration} min</span>
              <span>{movie.rating}</span>
            </div>
            <p className="movie-description">{movie.description}</p>

            <div className="showtime-section">
              <h3>Select Date</h3>
              <div className="date-picker">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    className={`date-btn ${format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'active' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="day">{format(date, 'EEE')}</span>
                    <span className="date">{format(date, 'dd')}</span>
                  </button>
                ))}
              </div>

              <h3>Available Showtimes</h3>
              {showtimes.length > 0 ? (
                <div className="showtime-list">
                  {showtimes.map((showtime) => (
                    <div key={showtime.id} className="showtime-item">
                      <div className="showtime-info">
                        <span className="time">{showtime.time}</span>
                        <span className="room">{showtime.room_name}</span>
                        <span className="theater">{showtime.theater_name}</span>
                      </div>
                      <div className="showtime-action">
                        <span className="price">{showtime.price.toLocaleString()}đ</span>
                        <button onClick={() => handleBookTicket(showtime)}>Book</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-showtimes">No showtimes available for this date</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
