import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';
import { bookingService, showtimeService } from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { bookingData, clearBooking } = useContext(BookingContext);
  const { showtime, selectedSeats, totalPrice } = bookingData;
  const [sessionId] = useState(sessionStorage.getItem('seatSessionId') || '');
  const [lockExpiry, setLockExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [lockExpired, setLockExpired] = useState(false);
  const [lockError, setLockError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Get session ID for lock management
  const getSessionId = () => sessionStorage.getItem('seatSessionId');

  // Fetch current lock status
  const checkLockStatus = async () => {
    if (!showtime?.id) return;

    try {
      const seatsData = await showtimeService.getAvailableSeats(showtime.id);
      const lockedSeats = seatsData.lockedSeats || [];

      // Check if user's selected seats are still locked by them
      const myLocks = lockedSeats.filter(lock =>
        selectedSeats.some(s => s.row === lock.seat_row && s.number === lock.seat_number)
      );

      if (myLocks.length < selectedSeats.length) {
        // Some or all locks expired
        setLockExpired(true);
        setLockError('Some of your selected seats have been released. Please select seats again.');
        return;
      }

      // Get the earliest expiry
      if (myLocks.length > 0) {
        const earliestExpiry = myLocks.reduce(( earliest, lock ) => {
          const lockExpiry = new Date(lock.expires_at);
          return lockExpiry < earliest ? lockExpiry : earliest;
        }, new Date(myLocks[0].expires_at));

        setLockExpiry(earliestExpiry.toISOString());
        setLockExpired(false);
      }
    } catch (err) {
      console.error('Failed to check lock status:', err);
    }
  };

  // Poll lock status every 5 seconds
  useEffect(() => {
    checkLockStatus();
    const interval = setInterval(checkLockStatus, 5000);
    return () => clearInterval(interval);
  }, [showtime?.id]);

  // Countdown timer
  useEffect(() => {
    if (!lockExpiry || lockExpired) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(lockExpiry);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired!');
        setLockExpired(true);
        setLockError('Your seat locks have expired. Please select seats again.');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      // Warning when less than 1 minute
      if (minutes < 1 && seconds < 30) {
        setLockError(`Hurry! Only ${seconds} seconds left to complete payment.`);
      } else {
        setLockError('');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lockExpiry, lockExpired]);

  const handlePayment = async () => {
    if (lockExpired) {
      navigate('/movies');
      return;
    }

    setProcessing(true);
    try {
      const booking = await bookingService.create({
        showtime_id: showtime.id,
        total_price: totalPrice,
        seats: selectedSeats,
        session_id: getSessionId(),
      });
      clearBooking();
      navigate(`/booking/confirmation/${booking.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      setLockError(error.message || 'Booking failed. Please try again.');
      if (error.message?.includes('held by another') || error.message?.includes('already been booked')) {
        setLockExpired(true);
      }
      setProcessing(false);
    }
  };

  if (!showtime || selectedSeats.length === 0) {
    navigate('/movies');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        {lockExpiry && !lockExpired && (
          <div className="lock-timer">
            Seats locked for: <strong>{timeLeft}</strong>
          </div>
        )}
        {lockError && (
          <div className={`lock-error ${lockExpired ? 'critical' : ''}`}>
            {lockError}
          </div>
        )}
        <div className="checkout-content">
          <div className="booking-details">
            <h3>Booking Summary</h3>
            <div className="detail-row">
              <span>Movie:</span>
              <strong>{showtime.movie_title}</strong>
            </div>
            <div className="detail-row">
              <span>Theater:</span>
              <strong>{showtime.theater_name}</strong>
            </div>
            <div className="detail-row">
              <span>Room:</span>
              <strong>{showtime.room_name}</strong>
            </div>
            <div className="detail-row">
              <span>Date & Time:</span>
              <strong>{showtime.date} at {showtime.time}</strong>
            </div>
            <div className="detail-row">
              <span>Seats:</span>
              <strong>{selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')}</strong>
            </div>
            <div className="detail-row total">
              <span>Total:</span>
              <strong>{totalPrice.toLocaleString()}đ</strong>
            </div>
          </div>

          <div className="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <div className="payment-option selected">
                <input type="radio" name="payment" checked readOnly />
                <span>Credit/Debit Card</span>
              </div>
              <div className="payment-option">
                <input type="radio" name="payment" disabled />
                <span>MoMo (Coming Soon)</span>
              </div>
              <div className="payment-option">
                <input type="radio" name="payment" disabled />
                <span>ZaloPay (Coming Soon)</span>
              </div>
            </div>

            <div className="card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="text" placeholder="123" />
                </div>
              </div>
            </div>

            <button
              className="btn-pay"
              onClick={handlePayment}
              disabled={lockExpired || processing}
            >
              {processing ? 'Processing...' : lockExpired ? 'Seats Released - Go Back' : `Pay ${totalPrice.toLocaleString()}đ`}
            </button>
            {lockExpiry && !lockExpired && (
              <p className="lock-warning">
                Complete payment within {timeLeft} or seats will be released
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
