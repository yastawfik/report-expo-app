// services/api.ts

import axios from 'axios';

// Change this to match your Laravel backend URL (use your local IP for physical device testing)
const API_BASE_URL = 'http://192.168.0.172:8000/api'; // <-- Replace with your IP address and port

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Fetch all reports
export const getReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

// Fetch a single report by ID
export const getReportById = async (id: number) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

// Create a new report
export const createReport = async (reportData: any) => {
  const response = await api.post('/reports', reportData);
  return response.data;
};

// Update a report by ID
export const updateReport = async (id: number, reportData: any) => {
  const response = await api.put(`/reports/${id}`, reportData);
  return response.data;
};

// Delete a report by ID
export const deleteReport = async (id: number) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export default api;
    