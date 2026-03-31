const Showtime = require('../models/Showtime');
const SeatLock = require('../models/SeatLock');

const getShowtimes = async (req, res) => {
  try {
    const { movie_id, date } = req.query;
    if (!movie_id) {
      return res.status(400).json({ error: 'movie_id is required' });
    }
    const showtimes = await Showtime.findByMovie(movie_id, date);
    res.json(showtimes);
  } catch (error) {
    console.error('Get showtimes error:', error);
    res.status(500).json({ error: 'Failed to fetch showtimes' });
  }
};

const getShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }
    res.json(showtime);
  } catch (error) {
    console.error('Get showtime error:', error);
    res.status(500).json({ error: 'Failed to fetch showtime' });
  }
};

const createShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.create(req.body);
    res.status(201).json(showtime);
  } catch (error) {
    console.error('Create showtime error:', error);
    res.status(500).json({ error: 'Failed to create showtime' });
  }
};

const getAvailableSeats = async (req, res) => {
  try {
    const bookedSeats = await Showtime.getBookedSeats(req.params.showtimeId);
    const lockedSeats = await SeatLock.getLockedSeats(req.params.showtimeId);
    res.json({ bookedSeats, lockedSeats });
  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
};

const deleteShowtime = async (req, res) => {
  try {
    await Showtime.delete(req.params.id);
    res.json({ message: 'Showtime deleted' });
  } catch (error) {
    console.error('Delete showtime error:', error);
    res.status(500).json({ error: 'Failed to delete showtime' });
  }
};

module.exports = { getShowtimes, getShowtime, createShowtime, getAvailableSeats, deleteShowtime };
