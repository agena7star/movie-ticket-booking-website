require('dotenv').config();
const initDatabase = require('./initDb');
const pool = require('./db');

const seedData = async () => {
  await initDatabase();

  const client = await pool.connect();

  try {
    // Check if movies already exist
    const movieCheck = await client.query('SELECT COUNT(*) FROM movies');
    if (parseInt(movieCheck.rows[0].count) > 0) {
      console.log('Data already seeded, skipping...');
      return;
    }

    // Seed movies
    const movies = [
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully and Ney\'tiri form a family and do everything to stay together. They must leave their home and explore the regions of Pandora. When an old threat returns to finish what they previously started, Jake must work with Ney\'tiri and the army of the Na\'vi race to protect their home.',
        poster_url: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        duration: 192,
        genre: 'Sci-Fi, Adventure, Action',
        rating: 'PG-13',
        status: 'now_showing'
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        poster_url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=shW9i6k8cB0',
        duration: 140,
        genre: 'Animation, Action, Adventure',
        rating: 'PG',
        status: 'now_showing'
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II. A film about the father of the atomic bomb, exploring his career, personal life, and the moral complexities he faced.',
        poster_url: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        duration: 180,
        genre: 'Biography, Drama, History',
        rating: 'R',
        status: 'now_showing'
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
        poster_url: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        duration: 166,
        genre: 'Sci-Fi, Adventure, Drama',
        rating: 'PG-13',
        status: 'now_showing'
      },
      {
        title: 'The Flash',
        description: 'Barry Allen uses his super speed to change the past, but his attempt to save his family creates a world without metahumans. He must rally a team of heroes to save the world and return to the future.',
        poster_url: 'https://image.tmdb.org/t/p/w500/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=heI8lFQqSd4',
        duration: 144,
        genre: 'Action, Adventure, Fantasy',
        rating: 'PG-13',
        status: 'coming_soon'
      },
      {
        title: 'Guardians of the Galaxy Vol. 3',
        description: 'Still reeling from the loss of Gamora, Peter Quill must rally his team to defend the universe and protect one of their own. A mission that could be Quill\'s last, leading to a heartfelt farewell.',
        poster_url: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=u4VFL7QmvfI',
        duration: 150,
        genre: 'Action, Adventure, Comedy',
        rating: 'PG-13',
        status: 'now_showing'
      }
    ];

    for (const movie of movies) {
      await client.query(
        `INSERT INTO movies (title, description, poster_url, trailer_url, duration, genre, rating, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [movie.title, movie.description, movie.poster_url, movie.trailer_url, movie.duration, movie.genre, movie.rating, movie.status]
      );
    }
    console.log('Movies seeded successfully');

    // Seed theaters
    const theaters = [
      { name: 'Galaxy Cinema Quận 1', address: '123 Nguyễn Huệ, Quận 1, TP.HCM', total_seats: 120 },
      { name: 'Galaxy Cinema Quận 7', address: '456 Đại Lộ V Neptune, Quận 7, TP.HCM', total_seats: 100 },
      { name: 'Galaxy Cinema Bình Thạnh', address: '789 Điện Biên Phủ, Bình Thạnh, TP.HCM', total_seats: 80 }
    ];

    for (const theater of theaters) {
      await client.query(
        'INSERT INTO theaters (name, address, total_seats) VALUES ($1, $2, $3)',
        [theater.name, theater.address, theater.total_seats]
      );
    }
    console.log('Theaters seeded successfully');

    // Seed rooms
    const rooms = [
      { theater_id: 1, name: 'Room 1 - Standard', seat_layout: { rows: 10, seatsPerRow: 12 } },
      { theater_id: 1, name: 'Room 2 - VIP', seat_layout: { rows: 8, seatsPerRow: 10 } },
      { theater_id: 2, name: 'Room 1 - Standard', seat_layout: { rows: 10, seatsPerRow: 10 } },
      { theater_id: 3, name: 'Room 1 - Standard', seat_layout: { rows: 10, seatsPerRow: 8 } }
    ];

    for (const room of rooms) {
      await client.query(
        'INSERT INTO rooms (theater_id, name, seat_layout) VALUES ($1, $2, $3)',
        [room.theater_id, room.name, JSON.stringify(room.seat_layout)]
      );
    }
    console.log('Rooms seeded successfully');

    // Seed showtimes (for the next 7 days)
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      const times = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30'];

      for (let movieId = 1; movieId <= 4; movieId++) {
        for (let roomId = 1; roomId <= 2; roomId++) {
          const time = times[Math.floor(Math.random() * times.length)];
          const price = 75000 + Math.floor(Math.random() * 3) * 10000;
          await client.query(
            'INSERT INTO showtimes (movie_id, room_id, date, time, price) VALUES ($1, $2, $3, $4, $5)',
            [movieId, roomId, dateStr, time, price]
          );
        }
      }
    }
    console.log('Showtimes seeded successfully');
    console.log('All data seeded successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
