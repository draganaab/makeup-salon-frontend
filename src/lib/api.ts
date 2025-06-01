import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If we're already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = Cookies.get('refreshToken');

            if (refreshToken) {
                try {
                    console.log('🔄 Attempting to refresh token...');

                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken: refreshToken
                    });

                    const { token: newToken, refreshToken: newRefreshToken } = response.data;

                    console.log('✅ Token refreshed successfully');

                    // Update cookies
                    Cookies.set('token', newToken, { expires: 1 });
                    Cookies.set('refreshToken', newRefreshToken, { expires: 7 });

                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Process the queued requests
                    processQueue(null, newToken);

                    return api(originalRequest);
                } catch (refreshError: any) {
                    console.log('❌ Token refresh failed:', refreshError.response?.data?.message || refreshError.message);

                    // Refresh failed, logout user
                    processQueue(refreshError, null);
                    Cookies.remove('token');
                    Cookies.remove('refreshToken');

                    // Redirect to login if not already there
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // No refresh token, logout
                console.log('❌ No refresh token available');
                processQueue(error, null);
                Cookies.remove('token');
                Cookies.remove('refreshToken');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;