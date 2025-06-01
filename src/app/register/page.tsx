import { Heart } from 'lucide-react';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
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

                {/* Register Form */}
                <RegisterForm />
            </div>
        </div>
    );
}