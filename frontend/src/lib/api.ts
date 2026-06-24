import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Backend
  withCredentials: true, // Garante envio dos cookies HttpOnly
});
