import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService, showtimeService, theaterService } from '../services/api';
import './AddShowtimePage.css';

const AddShowtimePage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    movie_id: '',
    theater_id: '',
    room_id: '',
    date: '',
    time: '',
    price: '75000',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moviesData, theatersData] = await Promise.all([
        movieService.getAll('now_showing'),
        theaterService.getAll(),
      ]);
      setMovies(moviesData);
      setTheaters(theatersData);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleTheaterChange = async (theaterId) => {
    try {
      const roomsData = await theaterService.getRooms(theaterId);
      setRooms(roomsData);
      setFormData((prev) => ({ ...prev, theater_id: theaterId, room_id: '' }));
    } catch (err) {
      setError('Failed to load rooms');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await showtimeService.create(formData);
      navigate('/admin/showtimes');
    } catch (err) {
      setError(err.message || 'Failed to create showtime');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-showtime-page">
      <div className="add-showtime-container">
        <button className="btn-back" onClick={() => navigate('/admin/showtimes')}>
          ← Back to Showtimes
        </button>

        <h1>Add New Showtime</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Movie *</label>
            <select
              name="movie_id"
              value={formData.movie_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Movie</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Theater *</label>
            <select
              name="theater_id"
              value={formData.theater_id}
              onChange={(e) => handleTheaterChange(e.target.value)}
              required
            >
              <option value="">Select Theater</option>
              {theaters.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Room *</label>
            <select
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              required
              disabled={!formData.theater_id}
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Price (VND) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/showtimes')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Showtime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShowtimePage;
