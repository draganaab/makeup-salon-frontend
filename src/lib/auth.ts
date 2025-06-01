import { LoginRequest, SignupRequest, JwtResponse, User } from './types';
import api from './api';
import Cookies from 'js-cookie';

// Auth functions
export const authAPI = {
    // Login user
    login: async (credentials: LoginRequest): Promise<JwtResponse> => {
        const response = await api.post<JwtResponse>('/auth/signin', credentials);
        const { token, refreshToken } = response.data;

        // Store tokens in cookies
        Cookies.set('token', token, { expires: 1 }); // 1 day
        Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days

        return response.data;
    },

    // Register user
    signup: async (data: SignupRequest): Promise<void> => {
        await api.post('/auth/signup', data);
    },

    // Get current user profile
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/users/profile');
        return response.data;
    },

    // Logout user
    logout: () => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = Cookies.get('token');
        return !!token;
    },
};