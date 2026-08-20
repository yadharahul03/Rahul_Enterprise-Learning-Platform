// Centralized API Client for Enterprise Learning
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const getHeaders = (customHeaders = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse(res) {
  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = (data && data.message) || (data && data.error) || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  baseUrl: BASE_URL,
  
  async get(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(options.headers),
      ...options,
    });
    return handleResponse(res);
  },

  async post(endpoint, body, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(options.headers),
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  async put(endpoint, body, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(options.headers),
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  },

  async delete(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(options.headers),
      ...options,
    });
    return handleResponse(res);
  },
};

export default api;
