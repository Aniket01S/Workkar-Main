import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const workerApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject worker JWT token
workerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('worker_token') || localStorage.getItem('workkar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Operations
export const registerWorkerApi = async (email, mobile, password, confirmPassword) => {
  const response = await workerApi.post('/auth/worker/register', {
    email,
    mobile,
    password,
    confirmPassword,
  });
  return response.data;
};

export const loginWorkerApi = async (emailOrMobile, password) => {
  const response = await workerApi.post('/auth/worker/login', {
    emailOrMobile,
    password,
  });
  return response.data;
};

export const getWorkerMeApi = async () => {
  const response = await workerApi.get('/auth/worker/me');
  return response.data;
};

// Permissions Operations
export const updatePermissionsApi = async ({
  locationPermission,
  notificationPermission,
  latitude,
  longitude,
  formattedAddress,
}) => {
  const response = await workerApi.put('/worker/permissions', {
    locationPermission,
    notificationPermission,
    latitude,
    longitude,
    formattedAddress,
  });
  return response.data;
};

// Profile Operations
export const getWorkerProfileApi = async () => {
  const response = await workerApi.get('/worker/profile');
  return response.data;
};

export const updateWorkerProfileApi = async (formData) => {
  const response = await workerApi.put('/worker/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default workerApi;
