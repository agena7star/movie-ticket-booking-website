import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { movieService, showtimeService, bookingService, theaterService } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/movies">Movies</NavLink>
          <NavLink to="/admin/showtimes">Showtimes</NavLink>
          <NavLink to="/admin/bookings">Bookings</NavLink>
        </nav>
      </div>
      <div className="admin-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="movies" element={<MoviesManagement />} />
          <Route path="showtimes" element={<ShowtimesManagement />} />
          <Route path="bookings" element={<BookingsManagement />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState({ total_bookings: 0, total_revenue: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await bookingService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="dashboard-home">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-value">{stats.total_bookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">{parseFloat(stats.total_revenue).toLocaleString()}đ</p>
        </div>
      </div>
    </div>
  );
};

const MoviesManagement = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const data = await movieService.getAll();
      setMovies(data);
    } catch (error) {
      console.error('Failed to load movies:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.delete(id);
        loadMovies();
      } catch (error) {
        console.error('Failed to delete movie:', error);
      }
    }
  };

  return (
    <div className="movies-management">
      <div className="management-header">
        <h1>Movies Management</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/movies/add')}>Add Movie</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>{movie.title}</td>
              <td>{movie.genre}</td>
              <td>{movie.duration} min</td>
              <td><span className={`badge ${movie.status}`}>{movie.status}</span></td>
              <td>
                <button className="btn-edit" onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(movie.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ShowtimesManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="showtimes-management">
      <div className="management-header">
        <h1>Showtimes Management</h1>
        <button className="btn-primary" onClick={() => navigate('/admin/showtimes/add')}>Add Showtime</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Movie</th>
            <th>Theater</th>
            <th>Room</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="6" className="text-center">Go to Movie Details page to manage showtimes</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="bookings-management">
      <h1>All Bookings</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Movie</th>
            <th>Showtime</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>#{booking.id}</td>
              <td>{booking.user_name}<br /><small>{booking.user_email}</small></td>
              <td>{booking.movie_title}</td>
              <td>{booking.date} {booking.time}</td>
              <td>{parseFloat(booking.total_price).toLocaleString()}đ</td>
              <td><span className={`badge ${booking.status}`}>{booking.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
