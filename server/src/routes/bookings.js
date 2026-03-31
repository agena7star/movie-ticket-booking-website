const express = require('express');
const { createBooking, getMyBookings, getAllBookings, getStats } = require('../controllers/bookingController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/stats', auth, adminOnly, getStats);
router.get('/all', auth, adminOnly, getAllBookings);

module.exports = router;
