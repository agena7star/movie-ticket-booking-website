# Movie Booking System

A full-stack movie ticket booking application built with PERN stack (PostgreSQL, Express, React, Node.js).

## Features

### User Features
- Browse movies (now showing & coming soon)
- View movie details with trailer and showtimes
- Select seats with interactive seat map
- Book tickets with mock payment
- View booking history

### Admin Features
- Dashboard with statistics
- Movie management (CRUD)
- Showtime management
- View all bookings

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Bootstrap 5
- date-fns

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcryptjs

## Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context
│   │   ├── services/     # API calls
│   │   └── styles/       # CSS files
│   └── public/
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/       # DB config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Database models
│   │   └── routes/        # API routes
│   └── package.json
├── docs/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 13+

### Setup Database

1. Create a PostgreSQL database named `movie_booking`
2. Update server/.env with your database credentials

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movie_booking
JWT_SECRET=your_secret_key
```

### Install & Run

**Backend:**
```bash
cd server
npm install
npm run db:init    # Initialize database tables
npm run seed       # Seed sample data
npm run dev        # Start server on port 5000
```

**Frontend:**
```bash
cd client
npm install
npm start          # Start React app on port 3000
```

### Demo Credentials

- **Admin:** admin@moviebooking.com / admin123
- **User:** Register a new account

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Movies
- `GET /api/movies` - List all movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies` - Create movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)
- `DELETE /api/movies/:id` - Delete movie (admin)

### Showtimes
- `GET /api/showtimes?movie_id=` - Get showtimes for movie
- `GET /api/showtimes/:id/seats` - Get available seats
- `POST /api/showtimes` - Create showtime (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/all` - Get all bookings (admin)

### Theaters
- `GET /api/theaters` - List theaters
- `GET /api/theaters/:id/rooms` - Get rooms

## License

MIT
