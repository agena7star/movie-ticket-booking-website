import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import './BookingConfirmationPage.css';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const bookings = await bookingService.getMyBookings();
        const found = bookings.find((b) => b.id === parseInt(bookingId) || b.id === bookingId);
        setBooking(found);
      } catch (error) {
        console.error('Failed to load booking:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!booking) {
    return <div className="error">Booking not found</div>;
  }

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>
          <h1>Booking Confirmed!</h1>
          <p className="booking-id">Booking ID: #{booking.id}</p>

          <div className="ticket">
            <div className="ticket-header">
              <h2>{booking.movie_title}</h2>
            </div>
            <div className="ticket-body">
              <div className="ticket-row">
                <span>Theater</span>
                <strong>{booking.theater_name}</strong>
              </div>
              <div className="ticket-row">
                <span>Room</span>
                <strong>{booking.room_name}</strong>
              </div>
              <div className="ticket-row">
                <span>Date</span>
                <strong>{booking.date}</strong>
              </div>
              <div className="ticket-row">
                <span>Time</span>
                <strong>{booking.time}</strong>
              </div>
              <div className="ticket-row">
                <span>Seats</span>
                <strong>{booking.seat_row}{booking.seat_number}</strong>
              </div>
              <div className="ticket-row total">
                <span>Total Paid</span>
                <strong>{parseFloat(booking.total_price).toLocaleString()}đ</strong>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/movies" className="btn-back">Book More</Link>
            <Link to="/profile" className="btn-profile">My Bookings</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
