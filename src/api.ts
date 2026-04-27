import axios from 'axios';
import { API_URL } from './config/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
