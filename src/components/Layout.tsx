'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
    Heart,
    Calendar,
    Scissors,
    User,
    LogOut,
    Menu,
    X,
    Users,
    Settings
} from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    if (!user) {
        router.push('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Navigation items based on role
    const getNavigationItems = () => {
        const commonItems = [
            { name: 'Dashboard', href: '/dashboard', icon: Heart },
            { name: 'Appointments', href: '/appointments', icon: Calendar },
            { name: 'Services', href: '/services', icon: Scissors },
            { name: 'Profile', href: '/profile', icon: User },
        ];

        if (user.role === 'STAFF') {
            // Add staff-only items
            return [
                ...commonItems.slice(0, -1), // All except Profile
                { name: 'Clients', href: '/clients', icon: Users },
                { name: 'Manage Services', href: '/manage-services', icon: Settings },
                { name: 'Profile', href: '/profile', icon: User },
            ];
        }

        return commonItems;
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-light-text border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="bg-secondary p-2 rounded-lg">
                                <Heart className="w-6 h-6 text-accent" />
                            </div>
                            <span className="ml-3 text-xl font-bold text-dark-text">
                Makeup Salon
              </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-6">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-3 py-2 text-dark-text/70 hover:text-accent transition-colors"
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </a>
                                );
                            })}
                        </nav>

                        {/* User menu */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-dark-text">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-dark-text/60">
                                    {user.role === 'CLIENT' ? 'Client' : 'Staff Member'}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-dark-text"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border">
                        <div className="px-4 py-4 space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-3 py-2 text-dark-text/70 hover:text-accent transition-colors rounded-lg"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="w-4 h-4 mr-3" />
                                        {item.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}