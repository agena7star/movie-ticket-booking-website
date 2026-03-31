const express = require('express');
const { getTheaters, getRooms, createTheater } = require('../controllers/theaterController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getTheaters);
router.get('/:theaterId/rooms', getRooms);
router.post('/', auth, adminOnly, createTheater);

module.exports = router;
