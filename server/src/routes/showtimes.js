const express = require('express');
const { getShowtimes, getShowtime, createShowtime, getAvailableSeats, deleteShowtime } = require('../controllers/showtimeController');
const { lockSeats, getLockedSeats, releaseSeats } = require('../controllers/seatLockController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getShowtimes);
router.get('/:id', getShowtime);
router.get('/:showtimeId/seats', getAvailableSeats);
router.get('/:showtimeId/locked-seats', getLockedSeats);

router.post('/lock-seats', auth, lockSeats);
router.post('/release-seats', auth, releaseSeats);

router.post('/', auth, adminOnly, createShowtime);
router.delete('/:id', auth, adminOnly, deleteShowtime);

module.exports = router;
