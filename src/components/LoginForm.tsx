'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { LoginRequest } from '@/lib/types';

const schema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
});

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            await login(data);
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-dark-text mb-2">Welcome Back</h2>
                <p className="text-dark-text/60">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-dark-text mb-1">
                        Username
                    </label>
                    <input
                        {...register('username')}
                        type="text"
                        className="input-field"
                        placeholder="Enter your username"
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-text mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            className="input-field pr-10"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-text/40 hover:text-dark-text/60"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-light-text/30 border-t-light-text rounded-full animate-spin" />
                    ) : (
                        <LogIn size={20} />
                    )}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-dark-text/60">
                    Don't have an account?{' '}
                    <a href="/register" className="text-accent hover:text-accent/80 font-medium">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}