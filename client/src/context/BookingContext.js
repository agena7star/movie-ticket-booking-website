import React, { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    showtime: null,
    selectedSeats: [],
    totalPrice: 0,
  });

  const selectSeats = (seats) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSeats: seats,
      totalPrice: seats.length * (prev.showtime?.price || 75000),
    }));
  };

  const setShowtime = (showtime) => {
    setBookingData((prev) => ({
      ...prev,
      showtime,
      selectedSeats: [],
      totalPrice: 0,
    }));
  };

  const clearBooking = () => {
    setBookingData({
      showtime: null,
      selectedSeats: [],
      totalPrice: 0,
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, selectSeats, setShowtime, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
};
