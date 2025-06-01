'use client';

import { useState, useEffect } from 'react';
import { User, LoginRequest, SignupRequest } from '@/lib/types';
import { authAPI } from '@/lib/auth';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setLoading(true);

        try {
            const token = Cookies.get('token');

            if (token) {
                const profile = await authAPI.getProfile();
                setUser(profile);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            // Only clear tokens if it's an auth error (401/403), not a network error
            if (error.response?.status === 401 || error.response?.status === 403) {
                Cookies.remove('token');
                Cookies.remove('refreshToken');
            }

            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await authAPI.login(credentials);

            // Small delay to ensure cookies are set
            setTimeout(async () => {
                await checkAuth();
            }, 100);

            toast.success('Login successful!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const signup = async (data: SignupRequest) => {
        try {
            await authAPI.signup(data);
            toast.success('Registration successful! Please login.');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        toast.success('Logged out successfully');
    };

    const isAuthenticated = !!user;

    return {
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
    };
};