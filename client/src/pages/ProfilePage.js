import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
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
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <div className="user-info">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="booking-history">
          <h2>Booking History</h2>
          {bookings.length > 0 ? (
            <div className="bookings-list">
              {bookings.map((booking, index) => (
                <div key={`${booking.id}-${index}`} className="booking-card">
                  <div className="booking-movie">
                    <img src={booking.poster_url} alt={booking.movie_title} />
                    <div className="booking-details">
                      <h3>{booking.movie_title}</h3>
                      <p>{booking.theater_name} - {booking.room_name}</p>
                      <p>{booking.date} at {booking.time}</p>
                      <p className="seats">Seats: {booking.seat_row}{booking.seat_number}</p>
                    </div>
                  </div>
                  <div className="booking-price">
                    <span className={`status ${booking.status}`}>{booking.status}</span>
                    <strong>{parseFloat(booking.total_price).toLocaleString()}đ</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-bookings">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
