const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, getAuthHeader());
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'API error');
    }
    return res.json();
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      ...getAuthHeader(),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const movieService = {
  getAll: (status) => api.get(`/movies${status ? `?status=${status}` : ''}`),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
};

export const showtimeService = {
  getByMovie: (movieId, date) => api.get(`/showtimes?movie_id=${movieId}${date ? `&date=${date}` : ''}`),
  getById: (id) => api.get(`/showtimes/${id}`),
  create: (data) => api.post('/showtimes', data),
  getAvailableSeats: (showtimeId) => api.get(`/showtimes/${showtimeId}/seats`),
  delete: (id) => api.delete(`/showtimes/${id}`),
};

export const bookingService = {
  create: (data) => {
    const sessionId = sessionStorage.getItem('seatSessionId');
    return api.post('/bookings', { ...data, session_id: sessionId });
  },
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getAll: () => api.get('/bookings/all'),
  getStats: () => api.get('/bookings/stats'),
};

export const theaterService = {
  getAll: () => api.get('/theaters'),
  getRooms: (theaterId) => api.get(`/theaters/${theaterId}/rooms`),
};
