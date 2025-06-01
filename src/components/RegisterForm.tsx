'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// Simple form type that matches exactly what we need
interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>();

    // Simple validation function
    const validateForm = (data: RegisterFormData) => {
        const errors: Partial<RegisterFormData> = {};

        if (!data.username || data.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!data.email || !data.email.includes('@')) {
            errors.email = 'Valid email is required';
        }

        if (!data.password || data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!data.firstName) {
            errors.firstName = 'First name is required';
        }

        if (!data.lastName) {
            errors.lastName = 'Last name is required';
        }

        return errors;
    };

    const onSubmit = async (data: RegisterFormData) => {
        const validationErrors = validateForm(data);

        if (Object.keys(validationErrors).length > 0) {
            // Show first error
            const firstError = Object.values(validationErrors)[0];
            toast.error(firstError || 'Please fix form errors');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare data for API
            const signupData = {
                username: data.username,
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone.trim() || undefined,
            };

            await signup(signupData);
            toast.success('Registration successful! Please sign in.');
            router.push('/login');
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || 'Registration failed');
            } else {
                toast.error('Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-dark-text mb-2">Create Account</h2>
                <p className="text-dark-text/60">Join our makeup salon</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-1">
                            First Name
                        </label>
                        <input
                            {...register('firstName', { required: true })}
                            type="text"
                            className="input-field"
                            placeholder="First name"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">First name is required</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-1">
                            Last Name
                        </label>
                        <input
                            {...register('lastName', { required: true })}
                            type="text"
                            className="input-field"
                            placeholder="Last name"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">Last name is required</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-text mb-1">
                        Username
                    </label>
                    <input
                        {...register('username', { required: true, minLength: 3 })}
                        type="text"
                        className="input-field"
                        placeholder="Choose a username"
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm mt-1">Username must be at least 3 characters</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-text mb-1">
                        Email
                    </label>
                    <input
                        {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                        type="email"
                        className="input-field"
                        placeholder="your@email.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">Valid email is required</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-text mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            {...register('password', { required: true, minLength: 6 })}
                            type={showPassword ? 'text' : 'password'}
                            className="input-field pr-10"
                            placeholder="Create a password"
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
                        <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-text mb-1">
                        Phone (Optional)
                    </label>
                    <input
                        {...register('phone')}
                        type="tel"
                        className="input-field"
                        placeholder="Your phone number"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-light-text/30 border-t-light-text rounded-full animate-spin" />
                    ) : (
                        <UserPlus size={20} />
                    )}
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-dark-text/60">
                    Already have an account?{' '}
                    <a href="/login" className="text-accent hover:text-accent/80 font-medium">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}