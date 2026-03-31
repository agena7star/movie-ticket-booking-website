const pool = require('../config/db');

class Theater {
  static async findAll() {
    const result = await pool.query('SELECT * FROM theaters ORDER BY name');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM theaters WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getRooms(theaterId) {
    const result = await pool.query(
      'SELECT * FROM rooms WHERE theater_id = $1 ORDER BY name',
      [theaterId]
    );
    return result.rows;
  }

  static async create({ name, address, total_seats }) {
    const result = await pool.query(
      'INSERT INTO theaters (name, address, total_seats) VALUES ($1, $2, $3) RETURNING *',
      [name, address, total_seats]
    );
    return result.rows[0];
  }
}

module.exports = Theater;
