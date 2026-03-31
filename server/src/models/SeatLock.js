const pool = require('../config/db');

const LOCK_DURATION_MINUTES = 5;

class SeatLock {
  static async lockSeats(showtimeId, seats, userId, sessionId) {
    const client = await pool.connect();
    const expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);

    try {
      await client.query('BEGIN');

      // Clean up expired locks first
      await client.query(
        'DELETE FROM seat_locks WHERE expires_at < NOW()'
      );

      // Check if any seats are already locked or booked
      for (const seat of seats) {
        // Check for existing confirmed booking
        const bookedSeat = await client.query(
          `SELECT bs.id FROM booking_seats bs
           JOIN bookings b ON bs.booking_id = b.id
           WHERE b.showtime_id = $1 AND bs.seat_row = $2 AND bs.seat_number = $3 AND b.status = 'confirmed'`,
          [showtimeId, seat.row, seat.number]
        );

        if (bookedSeat.rows.length > 0) {
          await client.query('ROLLBACK');
          return { success: false, message: `Seat ${seat.row}${seat.number} is already booked` };
        }

        // Check for existing lock (by other users only)
        const lockedSeat = await client.query(
          `SELECT * FROM seat_locks
           WHERE showtime_id = $1 AND seat_row = $2 AND seat_number = $3 AND expires_at > NOW()
           AND (user_id != $4 AND session_id != $5)`,
          [showtimeId, seat.row, seat.number, userId || '', sessionId || '']
        );

        if (lockedSeat.rows.length > 0) {
          await client.query('ROLLBACK');
          return { success: false, message: `Seat ${seat.row}${seat.number} is currently being held by another user` };
        }

        // Check if same user already has this seat locked - extend it
        const myLock = await client.query(
          `SELECT * FROM seat_locks
           WHERE showtime_id = $1 AND seat_row = $2 AND seat_number = $3 AND expires_at > NOW()
           AND session_id = $4`,
          [showtimeId, seat.row, seat.number, sessionId || '']
        );

        if (myLock.rows.length > 0) {
          await client.query(
            'UPDATE seat_locks SET expires_at = $1 WHERE id = $2',
            [expiresAt, myLock.rows[0].id]
          );
        } else {
          // Insert new lock
          await client.query(
            `INSERT INTO seat_locks (showtime_id, seat_row, seat_number, user_id, session_id, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [showtimeId, seat.row, seat.number, userId, sessionId, expiresAt]
          );
        }
      }

      await client.query('COMMIT');
      return { success: true, expiresAt };
    } catch (error) {
      console.error('SeatLock.lockSeats error:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLockedSeats(showtimeId) {
    const result = await pool.query(
      `SELECT seat_row, seat_number, expires_at, user_id
       FROM seat_locks
       WHERE showtime_id = $1 AND expires_at > NOW()`,
      [showtimeId]
    );
    return result.rows;
  }

  static async releaseLock(showtimeId, seatRow, seatNumber, userId, sessionId) {
    await pool.query(
      `DELETE FROM seat_locks
       WHERE showtime_id = $1 AND seat_row = $2 AND seat_number = $3
       AND (user_id = $4 OR session_id = $5)`,
      [showtimeId, seatRow, seatNumber, userId, sessionId]
    );
  }

  static async releaseUserLocks(userId, sessionId) {
    await pool.query(
      `DELETE FROM seat_locks WHERE user_id = $1 OR session_id = $2`,
      [userId, sessionId]
    );
  }

  static async cleanupExpired() {
    await pool.query('DELETE FROM seat_locks WHERE expires_at < NOW()');
  }
}

module.exports = SeatLock;
