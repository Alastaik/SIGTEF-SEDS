import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Default to /api for Vite Proxy or Nginx
  withCredentials: true, // Garante envio dos cookies HttpOnly
});
