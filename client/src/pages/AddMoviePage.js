import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { movieService } from '../services/api';
import './AddMoviePage.css';

const AddMoviePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster_url: '',
    trailer_url: '',
    duration: '',
    genre: '',
    rating: '',
    status: 'now_showing',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      loadMovie();
    }
  }, [id]);

  const loadMovie = async () => {
    try {
      const movie = await movieService.getById(id);
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        poster_url: movie.poster_url || '',
        trailer_url: movie.trailer_url || '',
        duration: movie.duration || '',
        genre: movie.genre || '',
        rating: movie.rating || '',
        status: movie.status || 'now_showing',
      });
    } catch (err) {
      setError('Failed to load movie');
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
      if (isEditMode) {
        await movieService.update(id, formData);
      } else {
        await movieService.create(formData);
      }
      navigate('/admin/movies');
    } catch (err) {
      setError(err.message || 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-movie-page">
      <div className="add-movie-container">
        <button className="btn-back" onClick={() => navigate('/admin/movies')}>
          ← Back to Movies
        </button>

        <h1>{isEditMode ? 'Edit Movie' : 'Add New Movie'}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter movie title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter movie description"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Poster URL</label>
              <input
                type="text"
                name="poster_url"
                value={formData.poster_url}
                onChange={handleChange}
                placeholder="https://example.com/poster.jpg"
              />
            </div>

            <div className="form-group">
              <label>Trailer URL</label>
              <input
                type="text"
                name="trailer_url"
                value={formData.trailer_url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="120"
              />
            </div>

            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Action, Drama, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating</label>
              <select name="rating" value={formData.rating} onChange={handleChange}>
                <option value="">Select Rating</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/movies')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Movie' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
