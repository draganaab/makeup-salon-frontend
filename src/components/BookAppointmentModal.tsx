'use client';

import { useState, useEffect } from 'react';
import { Service, User } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    X,
    Calendar,
    Clock,
    DollarSign,
    User as UserIcon,
    Scissors,
    Plus,
    Minus
} from 'lucide-react';

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userRole: 'CLIENT' | 'STAFF';
}

export default function BookAppointmentModal({
                                                 isOpen,
                                                 onClose,
                                                 onSuccess,
                                                 userRole
                                             }: BookAppointmentModalProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        appointmentDate: '',
        appointmentTime: '',
        clientId: '',
        selectedServices: [] as number[],
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchServices();
            if (userRole === 'STAFF') {
                fetchClients();
            }
        }
    }, [isOpen, userRole]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await api.get<Service[]>('/services');
            setServices(response.data.filter(service => service.active));
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get<User[]>('/users/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients');
        }
    };

    const selectedServicesData = services.filter(service =>
        formData.selectedServices.includes(service.id)
    );

    const totalPrice = selectedServicesData.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = selectedServicesData.reduce((sum, service) => sum + service.durationMinutes, 0);

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const handleServiceToggle = (serviceId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.includes(serviceId)
                ? prev.selectedServices.filter(id => id !== serviceId)
                : [...prev.selectedServices, serviceId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.appointmentDate || !formData.appointmentTime) {
            toast.error('Please select date and time');
            return;
        }

        if (formData.selectedServices.length === 0) {
            toast.error('Please select at least one service');
            return;
        }

        if (userRole === 'STAFF' && !formData.clientId) {
            toast.error('Please select a client');
            return;
        }

        try {
            setSubmitting(true);

            // Combine date and time
            const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

            const requestData = {
                appointmentDate: appointmentDateTime.toISOString(),
                serviceIds: formData.selectedServices,
                notes: formData.notes.trim() || undefined,
                ...(userRole === 'STAFF' && formData.clientId && { clientId: parseInt(formData.clientId) })
            };

            await api.post('/appointments', requestData);

            toast.success('Appointment booked successfully!');
            onSuccess();
            onClose();

            // Reset form
            setFormData({
                appointmentDate: '',
                appointmentTime: '',
                clientId: '',
                selectedServices: [],
                notes: ''
            });

        } catch (error: any) {
            console.error('Error booking appointment:', error);
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-light-text rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-dark-text">
                        Book New Appointment
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="p-2 text-dark-text/60 hover:text-dark-text transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={formData.appointmentDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                                className="input-field"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Time
                            </label>
                            <input
                                type="time"
                                value={formData.appointmentTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Client Selection (Staff only) */}
                    {userRole === 'STAFF' && (
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Client
                            </label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                                className="input-field"
                                required
                            >
                                <option value="">Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.firstName} {client.lastName} ({client.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Services Selection */}
                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Services
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : (
                                services.map(service => (
                                    <div
                                        key={service.id}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            formData.selectedServices.includes(service.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                        onClick={() => handleServiceToggle(service.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-dark-text">
                                                    {service.name}
                                                </h4>
                                                <p className="text-sm text-dark-text/60 mb-2">
                                                    {service.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-dark-text/60">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {formatDuration(service.durationMinutes)}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-medium text-accent">
                                                        <DollarSign size={14} />
                                                        {formatPrice(service.price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                {formData.selectedServices.includes(service.id) ? (
                                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                        <Minus size={14} className="text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 border-2 border-border rounded-full flex items-center justify-center">
                                                        <Plus size={14} className="text-dark-text/60" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Selected Services Summary */}
                    {formData.selectedServices.length > 0 && (
                        <div className="bg-secondary p-4 rounded-lg">
                            <h4 className="font-medium text-dark-text mb-3">Selected Services</h4>
                            <div className="space-y-2 mb-3">
                                {selectedServicesData.map(service => (
                                    <div key={service.id} className="flex justify-between text-sm">
                                        <span className="text-dark-text">{service.name}</span>
                                        <span className="text-accent font-medium">
                                            {formatPrice(service.price)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-border pt-3 flex justify-between text-sm">
                                <div>
                                    <span className="font-medium text-dark-text">Total Duration: </span>
                                    <span className="text-dark-text/70">{formatDuration(totalDuration)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-dark-text">Total Price: </span>
                                    <span className="text-accent font-semibold">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-dark-text mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="input-field resize-none"
                            rows={3}
                            placeholder="Any special requests or notes..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || formData.selectedServices.length === 0}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-light-text/30 border-t-light-text rounded-full animate-spin" />
                            ) : (
                                <Calendar size={20} />
                            )}
                            {submitting ? 'Booking...' : 'Book Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}