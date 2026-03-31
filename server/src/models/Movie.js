const pool = require('../config/db');

class Movie {
  static async findAll(status = null) {
    let query = 'SELECT * FROM movies';
    const params = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create({ title, description, poster_url, trailer_url, duration, genre, rating, status }) {
    const result = await pool.query(
      `INSERT INTO movies (title, description, poster_url, trailer_url, duration, genre, rating, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, poster_url, trailer_url, duration, genre, rating, status]
    );
    return result.rows[0];
  }

  static async update(id, { title, description, poster_url, trailer_url, duration, genre, rating, status }) {
    const result = await pool.query(
      `UPDATE movies SET title=$1, description=$2, poster_url=$3, trailer_url=$4, duration=$5, genre=$6, rating=$7, status=$8 WHERE id=$9 RETURNING *`,
      [title, description, poster_url, trailer_url, duration, genre, rating, status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM movies WHERE id = $1', [id]);
  }
}

module.exports = Movie;
