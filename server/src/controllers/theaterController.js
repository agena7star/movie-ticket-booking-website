const Theater = require('../models/Theater');
const pool = require('../config/db');

const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.findAll();
    res.json(theaters);
  } catch (error) {
    console.error('Get theaters error:', error);
    res.status(500).json({ error: 'Failed to fetch theaters' });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Theater.getRooms(req.params.theaterId);
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

const createTheater = async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json(theater);
  } catch (error) {
    console.error('Create theater error:', error);
    res.status(500).json({ error: 'Failed to create theater' });
  }
};

module.exports = { getTheaters, getRooms, createTheater };
