const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  try {
    const { showtime_id, total_price, seats, session_id } = req.body;

    if (!seats || seats.length === 0) {
      return res.status(400).json({ error: 'At least one seat must be selected' });
    }

    const result = await Booking.create({
      user_id: req.user.id,
      showtime_id,
      total_price,
      seats,
      session_id,
    });

    if (!result.success) {
      return res.status(409).json({ error: result.message });
    }

    res.status(201).json({ ...result.booking, seats });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.user.id);
    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await Booking.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, getStats };
