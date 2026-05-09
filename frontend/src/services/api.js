import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cars
export const fetchCars = async () => {
  const response = await api.get('/cars/available');
  return response.data;
};

export const fetchCar = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

// Bookings
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Payments
export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments/initiate', paymentData);
  return response.data;
};

// AI Chat
export const sendChatMessage = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data.reply;
};

// Ajouter dans api.js
export const createCar = async (carData, token) => {
  const response = await axios.post(`${API_BASE_URL}/cars`, carData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateCar = async (id, carData, token) => {
  const response = await axios.put(`${API_BASE_URL}/cars/${id}`, carData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteCar = async (id, token) => {
  const response = await axios.delete(`${API_BASE_URL}/cars/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchBookings = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchPayments = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;