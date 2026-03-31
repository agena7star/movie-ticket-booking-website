const express = require('express');
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMovies);
router.get('/:id', getMovie);

router.post('/', auth, adminOnly, createMovie);
router.put('/:id', auth, adminOnly, updateMovie);
router.delete('/:id', auth, adminOnly, deleteMovie);

module.exports = router;
