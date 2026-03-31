const pool = require('../config/db');

class Showtime {
  static async findByMovie(movieId, date = null) {
    let query = `
      SELECT s.*, m.title as movie_title, m.poster_url, r.name as room_name, t.name as theater_name
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      JOIN theaters t ON r.theater_id = t.id
      WHERE s.movie_id = $1
    `;
    const params = [movieId];

    if (date) {
      query += ' AND s.date = $2';
      params.push(date);
    }

    query += ' ORDER BY s.date, s.time';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT s.*, m.title as movie_title, r.name as room_name, t.name as theater_name
       FROM showtimes s
       JOIN movies m ON s.movie_id = m.id
       JOIN rooms r ON s.room_id = r.id
       JOIN theaters t ON r.theater_id = t.id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create({ movie_id, room_id, date, time, price }) {
    const result = await pool.query(
      'INSERT INTO showtimes (movie_id, room_id, date, time, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [movie_id, room_id, date, time, price]
    );
    return result.rows[0];
  }

  static async getBookedSeats(showtimeId) {
    const result = await pool.query(
      `SELECT bs.seat_row, bs.seat_number
       FROM booking_seats bs
       JOIN bookings b ON bs.booking_id = b.id
       WHERE b.showtime_id = $1 AND b.status = 'confirmed'`,
      [showtimeId]
    );
    return result.rows;
  }

  static async delete(id) {
    await pool.query('DELETE FROM showtimes WHERE id = $1', [id]);
  }
}

module.exports = Showtime;
