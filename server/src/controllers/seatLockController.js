const SeatLock = require('../models/SeatLock');

const lockSeats = async (req, res) => {
  try {
    const { showtime_id, seats } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.session_id;

    if (!seats || seats.length === 0) {
      return res.status(400).json({ error: 'No seats provided' });
    }

    const result = await SeatLock.lockSeats(showtime_id, seats, userId, sessionId);

    if (!result.success) {
      return res.status(409).json({ error: result.message });
    }

    res.json({
      success: true,
      expiresAt: result.expiresAt,
      message: `Seats locked for ${5} minutes`
    });
  } catch (error) {
    console.error('Lock seats error:', error);
    res.status(500).json({ error: 'Failed to lock seats' });
  }
};

const getLockedSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const lockedSeats = await SeatLock.getLockedSeats(showtimeId);

    // Also get booked seats
    const Showtime = require('../models/Showtime');
    const bookedSeats = await Showtime.getBookedSeats(showtimeId);

    res.json({
      lockedSeats,
      bookedSeats
    });
  } catch (error) {
    console.error('Get locked seats error:', error);
    res.status(500).json({ error: 'Failed to get seats' });
  }
};

const releaseSeats = async (req, res) => {
  try {
    const { showtime_id, seats } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.body.session_id;

    for (const seat of seats) {
      await SeatLock.releaseLock(showtime_id, seat.row, seat.number, userId, sessionId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Release seats error:', error);
    res.status(500).json({ error: 'Failed to release seats' });
  }
};

module.exports = { lockSeats, getLockedSeats, releaseSeats };
