'use client';

import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { Appointment, Service, User } from '@/lib/types';
import api from '@/lib/api';
import {
    Calendar,
    Scissors,
    Users,
    Clock,
    TrendingUp,
    Star,
    DollarSign,
    CheckCircle
} from 'lucide-react';

interface DashboardStats {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    totalRevenue?: number;
    todayAppointments?: number;
    totalClients?: number;
    activeServices?: number;
}

export default function DashboardPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalRevenue: 0,
        todayAppointments: 0,
        totalClients: 0,
        activeServices: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && isAuthenticated) {
            fetchDashboardData();
        }
    }, [user, isAuthenticated]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            if (user?.role === 'CLIENT') {
                // Client dashboard data
                const appointmentsRes = await api.get<Appointment[]>('/appointments/my');
                const appointments = appointmentsRes.data;

                const now = new Date();
                const upcoming = appointments.filter(apt =>
                    new Date(apt.appointmentDate) > now &&
                    (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED')
                );
                const completed = appointments.filter(apt => apt.status === 'COMPLETED');

                setStats({
                    totalAppointments: appointments.length,
                    upcomingAppointments: upcoming.length,
                    completedAppointments: completed.length
                });

                // Get 3 most recent appointments
                setRecentAppointments(appointments.slice(0, 3));

            } else if (user?.role === 'STAFF') {
                // Staff dashboard data
                const [appointmentsRes, clientsRes, servicesRes] = await Promise.all([
                    api.get<Appointment[]>('/appointments'),
                    api.get<User[]>('/users/clients'),
                    api.get<Service[]>('/services/all')
                ]);

                const appointments = appointmentsRes.data;
                const clients = clientsRes.data;
                const services = servicesRes.data;

                const now = new Date();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppointments = appointments.filter(apt => {
                    const aptDate = new Date(apt.appointmentDate);
                    return aptDate >= today && aptDate < tomorrow;
                });

                const completed = appointments.filter(apt => apt.status === 'COMPLETED');
                const totalRevenue = completed.reduce((sum, apt) => sum + apt.totalPrice, 0);

                setStats({
                    totalAppointments: appointments.length,
                    todayAppointments: todayAppointments.length,
                    completedAppointments: completed.length,
                    totalRevenue: totalRevenue,
                    totalClients: clients.length,
                    activeServices: services.filter(s => s.active).length,
                    upcomingAppointments: appointments.filter(apt =>
                        new Date(apt.appointmentDate) > now &&
                        (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED')
                    ).length
                });

                // Get today's appointments for display
                setRecentAppointments(todayAppointments.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-text/60">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-dark-text">Not authenticated. Redirecting...</p>
                </div>
            </div>
        );
    }

    // Client Dashboard
    if (user.role === 'CLIENT') {
        return (
            <Layout>
                <div className="space-y-8">
                    {/* Welcome Section */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-dark-text mb-2">
                            Welcome back, {user.firstName}! ✨
                        </h1>
                        <p className="text-dark-text/60">
                            Ready for your next beautiful transformation?
                        </p>
                    </div>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card text-center">
                            <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                                <Calendar className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-text mb-2">
                                Upcoming Appointments
                            </h3>
                            <p className="text-2xl font-bold text-accent">{stats.upcomingAppointments}</p>
                            <p className="text-sm text-dark-text/60 mt-1">Scheduled</p>
                        </div>

                        <div className="card text-center">
                            <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-text mb-2">
                                Completed Sessions
                            </h3>
                            <p className="text-2xl font-bold text-accent">{stats.completedAppointments}</p>
                            <p className="text-sm text-dark-text/60 mt-1">All time</p>
                        </div>

                        <div className="card text-center">
                            <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                                <Clock className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-text mb-2">
                                Total Appointments
                            </h3>
                            <p className="text-2xl font-bold text-accent">{stats.totalAppointments}</p>
                            <p className="text-sm text-dark-text/60 mt-1">Booked</p>
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    {recentAppointments.length > 0 && (
                        <div className="card">
                            <h2 className="text-xl font-semibold text-dark-text mb-4">Recent Appointments</h2>
                            <div className="space-y-3">
                                {recentAppointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={20} className="text-accent" />
                                            <div>
                                                <p className="font-medium text-dark-text">
                                                    {formatDate(appointment.appointmentDate)}
                                                </p>
                                                <p className="text-sm text-dark-text/60">
                                                    {appointment.services.map(s => s.name).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                    appointment.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                        }`}>
                                            {appointment.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-dark-text mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <a href="/appointments" className="btn-primary text-center">
                                <Calendar className="w-5 h-5 mx-auto mb-2" />
                                Book Appointment
                            </a>
                            <a href="/services" className="btn-secondary text-center">
                                <Scissors className="w-5 h-5 mx-auto mb-2" />
                                Browse Services
                            </a>
                            <a href="/appointments" className="btn-secondary text-center">
                                <Clock className="w-5 h-5 mx-auto mb-2" />
                                View History
                            </a>
                            <a href="/profile" className="btn-secondary text-center">
                                <Users className="w-5 h-5 mx-auto mb-2" />
                                Update Profile
                            </a>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Staff Dashboard
    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-dark-text mb-2">
                        Staff Dashboard
                    </h1>
                    <p className="text-dark-text/60">
                        Manage your salon efficiently, {user.firstName}
                    </p>
                </div>
                {/* Staff Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Today's Appointments
                        </h3>
                        <p className="text-2xl font-bold text-accent">{stats.todayAppointments}</p>
                        <p className="text-sm text-dark-text/60 mt-1">Scheduled</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <Users className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Total Clients
                        </h3>
                        <p className="text-2xl font-bold text-accent">{stats.totalClients}</p>
                        <p className="text-sm text-dark-text/60 mt-1">Registered</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <Scissors className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Active Services
                        </h3>
                        <p className="text-2xl font-bold text-accent">{stats.activeServices}</p>
                        <p className="text-sm text-dark-text/60 mt-1">Available</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <DollarSign className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Total Revenue
                        </h3>
                        <p className="text-2xl font-bold text-accent">
                            {formatPrice(stats.totalRevenue || 0)}
                        </p>
                        <p className="text-sm text-dark-text/60 mt-1">From completed</p>
                    </div>
                </div>

                {/* Today's Appointments */}
                {recentAppointments.length > 0 && (
                    <div className="card">
                        <h2 className="text-xl font-semibold text-dark-text mb-4">Today's Schedule</h2>
                        <div className="space-y-3">
                            {recentAppointments.map((appointment) => (
                                <div key={appointment.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Clock size={20} className="text-accent" />
                                        <div>
                                            <p className="font-medium text-dark-text">
                                                {appointment.client.firstName} {appointment.client.lastName}
                                            </p>
                                            <p className="text-sm text-dark-text/60">
                                                {formatDate(appointment.appointmentDate)} • {appointment.services.map(s => s.name).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-accent font-medium">
                                            {formatPrice(appointment.totalPrice)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                                                    appointment.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                        }`}>
                                            {appointment.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Staff Quick Actions */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-dark-text mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a href="/appointments" className="btn-primary text-center">
                            <Calendar className="w-5 h-5 mx-auto mb-2" />
                            Manage Appointments
                        </a>
                        <a href="/clients" className="btn-secondary text-center">
                            <Users className="w-5 h-5 mx-auto mb-2" />
                            View Clients
                        </a>
                        <a href="/manage-services" className="btn-secondary text-center">
                            <Scissors className="w-5 h-5 mx-auto mb-2" />
                            Manage Services
                        </a>
                        <a href="/appointments" className="btn-secondary text-center">
                            <TrendingUp className="w-5 h-5 mx-auto mb-2" />
                            View Reports
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}