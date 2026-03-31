const pool = require('../config/db');

class Booking {
  static async create({ user_id, showtime_id, total_price, seats, session_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify all seats are still available (not booked by others)
      for (const seat of seats) {
        const existingBooking = await client.query(
          `SELECT bs.id FROM booking_seats bs
           JOIN bookings b ON bs.booking_id = b.id
           WHERE b.showtime_id = $1 AND bs.seat_row = $2 AND bs.seat_number = $3 AND b.status = 'confirmed'`,
          [showtime_id, seat.row, seat.number]
        );

        if (existingBooking.rows.length > 0) {
          await client.query('ROLLBACK');
          return { success: false, message: `Seat ${seat.row}${seat.number} has already been booked` };
        }

        // Check if seat is locked by another user/session
        const existingLock = await client.query(
          `SELECT * FROM seat_locks
           WHERE showtime_id = $1 AND seat_row = $2 AND seat_number = $3 AND expires_at > NOW()
           AND session_id != $4`,
          [showtime_id, seat.row, seat.number, session_id || '']
        );

        if (existingLock.rows.length > 0) {
          await client.query('ROLLBACK');
          return { success: false, message: `Seat ${seat.row}${seat.number} is currently being held by another user` };
        }
      }

      // Insert booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, showtime_id, total_price, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, showtime_id, total_price, 'confirmed']
      );
      const booking = bookingResult.rows[0];

      // Insert seat records
      for (const seat of seats) {
        await client.query(
          'INSERT INTO booking_seats (booking_id, seat_row, seat_number) VALUES ($1, $2, $3)',
          [booking.id, seat.row, seat.number]
        );
      }

      // Release seat locks for this session
      if (session_id) {
        await client.query(
          `DELETE FROM seat_locks WHERE showtime_id = $1 AND session_id = $2`,
          [showtime_id, session_id]
        );
      }

      await client.query('COMMIT');
      return { success: true, booking };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByUser(userId) {
    const result = await pool.query(
      `SELECT b.*, bs.seat_row, bs.seat_number,
              s.date, s.time, s.price as ticket_price,
              m.title as movie_title, m.poster_url,
              r.name as room_name, t.name as theater_name
       FROM bookings b
       JOIN booking_seats bs ON b.id = bs.booking_id
       JOIN showtimes s ON b.showtime_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN rooms r ON s.room_id = r.id
       JOIN theaters t ON r.theater_id = t.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findAll() {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email,
              s.date, s.time,
              m.title as movie_title,
              r.name as room_name, t.name as theater_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN showtimes s ON b.showtime_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN rooms r ON s.room_id = r.id
       JOIN theaters t ON r.theater_id = t.id
       ORDER BY b.created_at DESC`
    );
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_revenue
      FROM bookings
      WHERE status = 'confirmed'
    `);
    return result.rows[0];
  }
}

module.exports = Booking;
