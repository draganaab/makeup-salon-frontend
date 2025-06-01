'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Heart, Sparkles, Palette } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-dark-text/60">Loading...</p>
          </div>
        </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-secondary p-4 rounded-full">
              <Heart className="w-8 h-8 text-accent" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-dark-text mb-2">
            Makeup Salon Management
          </h1>

          <p className="text-lg text-dark-text/70 mb-8">
            Beautiful appointments made simple
          </p>

          <div className="flex gap-3 justify-center mb-8">
            <a href="/login" className="btn-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sign In
            </a>
            <a href="/register" className="btn-accent flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Register
            </a>
          </div>

          <div className="space-y-2 text-sm text-dark-text/60">
            <p>✨ Professional makeup services</p>
            <p>💜 Easy appointment booking</p>
            <p>🎨 Expert beauty consultation</p>
          </div>
        </div>
      </div>
  );
}