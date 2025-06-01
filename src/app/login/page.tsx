import { Heart } from 'lucide-react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-secondary p-3 rounded-full">
                            <Heart className="w-8 h-8 text-accent" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-dark-text">Makeup Salon</h1>
                </div>

                {/* Login Form */}
                <LoginForm />
            </div>
        </div>
    );
}