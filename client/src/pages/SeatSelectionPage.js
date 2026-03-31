import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimeService, bookingService } from '../services/api';
import { BookingContext } from '../context/BookingContext';
import './SeatSelectionPage.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEATS_PER_ROW = 12;
const LOCK_DURATION_MINUTES = 5;

// Generate session ID for this browser session
const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('seatSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('seatSessionId', sessionId);
  }
  return sessionId;
};

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { bookingData, setShowtime, selectSeats } = useContext(BookingContext);
  const [showtime, setShowtimeData] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(generateSessionId);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState('');

  // Load showtime and seats data
  const loadShowtime = useCallback(async () => {
    try {
      const [showtimeData, seatsData] = await Promise.all([
        showtimeService.getById(showtimeId),
        showtimeService.getAvailableSeats(showtimeId),
      ]);
      setShowtimeData(showtimeData);
      setShowtime(showtimeData);
      setBookedSeats(seatsData.bookedSeats || []);
      setLockedSeats(seatsData.lockedSeats || []);
    } catch (error) {
      console.error('Failed to load showtime:', error);
      setError('Failed to load seats');
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    loadShowtime();
  }, [loadShowtime]);

  // Poll for locked seats every 10 seconds
  useEffect(() => {
    const pollLockedSeats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/showtimes/${showtimeId}/locked-seats`
        );
        const data = await response.json();
        setLockedSeats(data.lockedSeats || []);
      } catch (err) {
        console.error('Failed to poll locked seats:', err);
      }
    };

    const interval = setInterval(pollLockedSeats, 10000);
    return () => clearInterval(interval);
  }, [showtimeId]);

  // Countdown timer
  useEffect(() => {
    if (!lockExpiry) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(lockExpiry);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired!');
        setSelectedSeats([]);
        setLockExpiry(null);
        loadShowtime(); // Reload seats
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lockExpiry, loadShowtime]);

  // Lock seats when selection changes
  const lockSelectedSeats = async (seats) => {
    try {
      const response = await fetch('http://localhost:5000/api/showtimes/lock-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
          showtime_id: parseInt(showtimeId),
          seats: seats,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to lock seats');
        // Remove the seat that caused the error
        setSelectedSeats(prev => prev.slice(0, -1));
        return false;
      }

      setLockExpiry(data.expiresAt);
      setError('');
      return true;
    } catch (err) {
      console.error('Lock seats error:', err);
      setError('Failed to lock seats');
      return false;
    }
  };

  // Release a specific seat
  const releaseSeat = async (seat) => {
    try {
      await fetch('http://localhost:5000/api/showtimes/release-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
          showtime_id: parseInt(showtimeId),
          seats: [seat],
          session_id: sessionId,
        }),
      });
    } catch (err) {
      console.error('Release seat error:', err);
    }
  };

  const isBooked = (row, number) => {
    return bookedSeats.some((s) => s.seat_row === row && s.seat_number === number);
  };

  const isLocked = (row, number) => {
    return lockedSeats.some((s) => s.seat_row === row && s.seat_number === number);
  };

  const isSelected = (row, number) => {
    return selectedSeats.some((s) => s.row === row && s.number === number);
  };

  const toggleSeat = async (row, number) => {
    if (isBooked(row, number) || isLocked(row, number)) return;

    const seat = { row, number };

    if (isSelected(row, number)) {
      // Deselect - release the seat
      setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
      await releaseSeat(seat);

      if (selectedSeats.length === 1) {
        setLockExpiry(null);
      }
    } else {
      // Select - add seat first optimistically, then lock
      setSelectedSeats(prev => [...prev, seat]);
      const success = await lockSelectedSeats([...selectedSeats, seat]);

      if (!success) {
        // Lock failed, seat already removed optimistically
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    selectSeats(selectedSeats);
    navigate('/checkout');
  };

  const totalPrice = selectedSeats.length * (showtime?.price || 75000);

  // NOTE: Don't release seats on unmount - they need to stay locked for checkout
  // Seats will be released only when:
  // 1. Lock expires (5 min timeout)
  // 2. User completes booking successfully
  // 3. User explicitly cancels (via clearBooking or booking failure)

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="seat-selection-page">
      <div className="container">
        <div className="showtime-header">
          <h2>{showtime?.movie_title}</h2>
          <p>{showtime?.theater_name} - {showtime?.room_name}</p>
          <p>{showtime?.date} at {showtime?.time}</p>
          {lockExpiry && (
            <p className="lock-timer">
              Seats locked for: <strong>{timeLeft}</strong>
            </p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="screen">SCREEN</div>

        <div className="seat-map">
          {ROWS.map((row) => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`seat ${isBooked(row, num) ? 'booked' : ''} ${isLocked(row, num) && !isSelected(row, num) ? 'locked' : ''} ${isSelected(row, num) ? 'selected' : ''}`}
                  onClick={() => toggleSeat(row, num)}
                  disabled={isBooked(row, num) || (isLocked(row, num) && !isSelected(row, num))}
                >
                  {num}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="seat-legend">
          <div className="legend-item">
            <span className="seat available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="seat selected"></span>
            <span>Selected (Locked)</span>
          </div>
          <div className="legend-item">
            <span className="seat booked"></span>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <span className="seat locked"></span>
            <span>Being Held</span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="booking-summary">
            <div className="selected-seats">
              <strong>Selected Seats:</strong> {selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')}
            </div>
            <div className="total-price">
              <strong>Total:</strong> {totalPrice.toLocaleString()}đ
            </div>
            {lockExpiry && (
              <p className="lock-warning">
                Complete your booking within {timeLeft} or seats will be released
              </p>
            )}
            <button className="btn-continue" onClick={handleContinue}>
              Continue to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionPage;
