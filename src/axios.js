import axios from 'axios';

// Create an Axios instance
const instance = axios.create({
  baseURL: 'https://localhost:5001'
});

// Add a request interceptor
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default instance;
