'use client';

import { useState } from 'react';
import { Appointment } from '@/lib/types';
import {
    Calendar,
    Clock,
    DollarSign,
    User,
    CheckCircle,
    XCircle,
    PlayCircle,
    AlertCircle
} from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

interface AppointmentCardProps {
    appointment: Appointment;
    userRole: 'CLIENT' | 'STAFF';
    onStatusUpdate?: (appointmentId: number, newStatus: string) => void;
    onCancel?: (appointmentId: number) => void;
    showClientInfo?: boolean;
    compact?: boolean;
}

export default function AppointmentCard({
                                            appointment,
                                            userRole,
                                            onStatusUpdate,
                                            onCancel,
                                            showClientInfo = false,
                                            compact = false
                                        }: AppointmentCardProps) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const getStatusColor = (status: string) => {
        const colors = {
            'SCHEDULED': 'bg-blue-100 text-blue-800',
            'CONFIRMED': 'bg-green-100 text-green-800',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
            'COMPLETED': 'bg-emerald-100 text-emerald-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'NO_SHOW': 'bg-gray-100 text-gray-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            'SCHEDULED': <Clock size={16} />,
            'CONFIRMED': <CheckCircle size={16} />,
            'IN_PROGRESS': <PlayCircle size={16} />,
            'COMPLETED': <CheckCircle size={16} />,
            'CANCELLED': <XCircle size={16} />,
            'NO_SHOW': <AlertCircle size={16} />
        };
        return icons[status as keyof typeof icons] || <Clock size={16} />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: compact ? 'short' : 'long',
            year: 'numeric',
            month: compact ? 'short' : 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const handleStatusUpdate = (newStatus: string) => {
        if (onStatusUpdate) {
            onStatusUpdate(appointment.id, newStatus);
        }
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (onCancel) {
            setCancelLoading(true);
            try {
                await onCancel(appointment.id);
                setShowCancelModal(false);
            } finally {
                setCancelLoading(false);
            }
        }
    };

    const canUpdateStatus = userRole === 'STAFF' &&
        appointment.status !== 'COMPLETED' &&
        appointment.status !== 'CANCELLED';

    const canCancel = appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED';

    if (compact) {
        return (
            <>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-secondary p-2 rounded-lg">
                                <Calendar className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                                <h4 className="font-medium text-dark-text text-sm">
                                    {formatDate(appointment.appointmentDate)}
                                </h4>
                                <p className="text-dark-text/60 text-xs">
                                    {formatTime(appointment.appointmentDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                {appointment.status.replace('_', ' ')}
                            </span>
                            <span className="text-accent font-semibold text-sm">
                                {formatPrice(appointment.totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelConfirm}
                    title="Cancel Appointment"
                    message="Are you sure you want to cancel this appointment? This action cannot be undone."
                    confirmText="Cancel Appointment"
                    cancelText="Keep Appointment"
                    isLoading={cancelLoading}
                    variant="danger"
                />
            </>
        );
    }

    return (
        <>
            <div className="card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Appointment Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-secondary p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark-text">
                                        {formatDate(appointment.appointmentDate)}
                                    </h3>
                                    <p className="text-dark-text/60 text-sm">
                                        {formatTime(appointment.appointmentDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                    {getStatusIcon(appointment.status)}
                                    {appointment.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Client Info (for staff or when showClientInfo is true) */}
                        {(showClientInfo || userRole === 'STAFF') && (
                            <div className="flex items-center gap-2 mb-3">
                                <User size={16} className="text-dark-text/60" />
                                <span className="text-dark-text">
                                    {appointment.client.firstName} {appointment.client.lastName}
                                </span>
                                <span className="text-dark-text/60">
                                    ({appointment.client.email})
                                </span>
                            </div>
                        )}

                        {/* Services */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {appointment.services.map((service) => (
                                <span
                                    key={service.id}
                                    className="bg-accent/10 text-accent px-2 py-1 rounded text-sm"
                                >
                                    {service.name}
                                </span>
                            ))}
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                            <p className="text-dark-text/70 text-sm">
                                <strong>Notes:</strong> {appointment.notes}
                            </p>
                        )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-semibold text-accent">
                                <DollarSign size={16} />
                                {formatPrice(appointment.totalPrice)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {(canUpdateStatus || canCancel) && (
                            <div className="flex gap-2">
                                {canUpdateStatus && (
                                    <>
                                        {appointment.status === 'SCHEDULED' && (
                                            <button
                                                onClick={() => handleStatusUpdate('CONFIRMED')}
                                                className="btn-primary text-sm"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {appointment.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => handleStatusUpdate('COMPLETED')}
                                                className="btn-primary text-sm"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </>
                                )}

                                {canCancel && (
                                    <button
                                        onClick={handleCancelClick}
                                        className="btn-secondary text-sm border border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelConfirm}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Cancel Appointment"
                cancelText="Keep Appointment"
                isLoading={cancelLoading}
                variant="danger"
            />
        </>
    );
}