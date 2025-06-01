'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Appointment, Service } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Calendar,
    Plus,
    Filter
} from 'lucide-react';
import AppointmentCard from '@/components/AppointmentCard';
import BookAppointmentModal from '@/components/BookAppointmentModal';

type AppointmentStatus = 'ALL' | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export default function AppointmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('ALL');
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAppointments();
            fetchServices();
        }
    }, [user]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Use different endpoints based on user role
            const endpoint = user?.role === 'STAFF'
                ? '/appointments' // Staff can see all appointments
                : '/appointments/my'; // Clients see only their appointments

            const response = await api.get<Appointment[]>(endpoint);
            setAppointments(response.data);
        } catch (error: any) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await api.get<Service[]>('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        if (statusFilter === 'ALL') return true;
        return appointment.status === statusFilter;
    });

    const statusOptions: { value: AppointmentStatus; label: string }[] = [
        { value: 'ALL', label: 'All Appointments' },
        { value: 'SCHEDULED', label: 'Scheduled' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
        try {
            await api.put(`/appointments/${appointmentId}/status`, {
                status: newStatus
            });

            // Update local state
            setAppointments(prev =>
                prev.map(apt =>
                    apt.id === appointmentId
                        ? { ...apt, status: newStatus as any }
                        : apt
                )
            );

            toast.success('Appointment status updated');
        } catch (error: any) {
            console.error('Error updating appointment:', error);
            toast.error('Failed to update appointment status');
        }
    };

    const handleCancelAppointment = async (appointmentId: number) => {
        try {
            await api.put(`/appointments/${appointmentId}/cancel`);

            // Update local state
            setAppointments(prev =>
                prev.map(apt =>
                    apt.id === appointmentId
                        ? { ...apt, status: 'CANCELLED' }
                        : apt
                )
            );

            toast.success('Appointment cancelled');
        } catch (error: any) {
            console.error('Error cancelling appointment:', error);
            toast.error('Failed to cancel appointment');
        }
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-dark-text/60">Loading appointments...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text">
                            {user?.role === 'STAFF' ? 'Manage Appointments' : 'My Appointments'}
                        </h1>
                        <p className="text-dark-text/60 mt-1">
                            {user?.role === 'STAFF'
                                ? 'View and manage all client appointments'
                                : 'View your upcoming and past appointments'
                            }
                        </p>
                    </div>

                    <button
                        onClick={() => setShowNewAppointmentModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Book Appointment
                    </button>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        <Filter size={20} className="text-dark-text/60" />
                        <span className="font-medium text-dark-text">Filter by Status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setStatusFilter(option.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    statusFilter === option.value
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-dark-text hover:bg-primary/10'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length === 0 ? (
                    <div className="card text-center py-12">
                        <Calendar size={48} className="mx-auto text-dark-text/30 mb-4" />
                        <h3 className="text-xl font-semibold text-dark-text mb-2">
                            No appointments found
                        </h3>
                        <p className="text-dark-text/60 mb-4">
                            {statusFilter === 'ALL'
                                ? "You don't have any appointments yet."
                                : `No appointments with status "${statusFilter.toLowerCase()}".`
                            }
                        </p>
                        <button
                            onClick={() => setShowNewAppointmentModal(true)}
                            className="btn-primary"
                        >
                            Book Your First Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                userRole={user?.role || 'CLIENT'}
                                onStatusUpdate={handleStatusUpdate}
                                onCancel={handleCancelAppointment}
                            />
                        ))}
                    </div>
                )}

                {/* Book Appointment Modal */}
                <BookAppointmentModal
                    isOpen={showNewAppointmentModal}
                    onClose={() => setShowNewAppointmentModal(false)}
                    onSuccess={fetchAppointments}
                    userRole={user?.role || 'CLIENT'}
                />
            </div>
        </Layout>
    );
}