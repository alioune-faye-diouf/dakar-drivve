import axios from 'axios';
import { adminApi } from './adminApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== VÉHICULES ====================

// Public
export const fetchCars = async () => {
  const response = await api.get('/cars/available');
  return response.data;
};

export const fetchCar = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

// Admin
export const fetchAllCars = async () => {
  const response = await adminApi.get('/cars');
  return response.data;
};

export const createCar = async (carData) => {
  const response = await adminApi.post('/cars', carData);
  return response.data;
};

export const updateCar = async (id, carData) => {
  const response = await adminApi.put(`/cars/${id}`, carData);
  return response.data;
};

export const deleteCar = async (id) => {
  const response = await adminApi.delete(`/cars/${id}`);
  return response.data;
};

// ==================== PHOTOS VÉHICULES ====================

export const fetchCarPhotos = async (carId) => {
  const response = await adminApi.get(`/cars/${carId}/photos`);
  return response.data;
};

export const uploadCarPhotos = async (carId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));
  const response = await adminApi.post(`/cars/${carId}/photos/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const setPhotoAsPrimary = async (carId, photoId) => {
  const response = await adminApi.patch(`/cars/${carId}/photos/${photoId}/primary`);
  return response.data;
};

export const deleteCarPhoto = async (carId, photoId) => {
  const response = await adminApi.delete(`/cars/${carId}/photos/${photoId}`);
  return response.data;
};

export const reorderCarPhotos = async (carId, orderedIds) => {
  const response = await adminApi.post(`/cars/${carId}/photos/reorder`, { orderedIds });
  return response.data;
};

// ==================== MARQUES & MODÈLES ====================

export const fetchBrands = async () => {
  const response = await api.get('/brands');
  return response.data;
};

export const fetchBrand = async (id) => {
  const response = await api.get(`/brands/${id}`);
  return response.data;
};

export const createBrand = async (brandData) => {
  const response = await adminApi.post('/brands', brandData);
  return response.data;
};

export const updateBrand = async (id, brandData) => {
  const response = await adminApi.put(`/brands/${id}`, brandData);
  return response.data;
};

export const deleteBrand = async (id) => {
  const response = await adminApi.delete(`/brands/${id}`);
  return response.data;
};

export const fetchModels = async (brandId) => {
  const url = brandId ? `/models?brand_id=${brandId}` : '/models';
  const response = await api.get(url);
  return response.data;
};

export const createModel = async (modelData) => {
  const response = await adminApi.post('/models', modelData);
  return response.data;
};

export const updateModel = async (id, modelData) => {
  const response = await adminApi.put(`/models/${id}`, modelData);
  return response.data;
};

export const deleteModel = async (id) => {
  const response = await adminApi.delete(`/models/${id}`);
  return response.data;
};

// ==================== RÉSERVATIONS ====================

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const fetchBookings = async () => {
  const response = await adminApi.get('/bookings');
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await adminApi.patch(`/bookings/${id}/status`, { status });
  return response.data;
};

// ==================== PAIEMENTS ====================

export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments/initiate', paymentData);
  return response.data;
};

export const fetchPayments = async () => {
  const response = await adminApi.get('/payments');
  return response.data;
};

// ==================== IA ====================

export const sendChatMessage = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data.reply;
};

export default api;
