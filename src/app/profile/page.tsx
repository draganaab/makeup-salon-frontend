'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { User, Appointment } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    User as UserIcon,
    Mail,
    Phone,
    Calendar,
    Edit3,
    Save,
    X,
    Shield,
    Clock
} from 'lucide-react';

interface ProfileStats {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    totalSpent?: number; // For clients
    cancelledAppointments?: number;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState<User | null>(null);
    const [stats, setStats] = useState<ProfileStats>({
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalSpent: 0,
        cancelledAppointments: 0
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfileData();
            fetchRealStats();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            const response = await api.get<User>('/users/profile');
            setProfileData(response.data);
            setEditForm({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phone: response.data.phone || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
        }
    };

    const fetchRealStats = async () => {
        try {
            setLoading(true);

            // Fetch real appointment data
            const endpoint = user?.role === 'STAFF' ? '/appointments' : '/appointments/my';
            const response = await api.get<Appointment[]>(endpoint);
            const appointments = response.data;

            const now = new Date();

            // Calculate real stats
            const upcoming = appointments.filter(apt => {
                const aptDate = new Date(apt.appointmentDate);
                return aptDate > now && (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED');
            });

            const completed = appointments.filter(apt => apt.status === 'COMPLETED');
            const cancelled = appointments.filter(apt => apt.status === 'CANCELLED');

            // Calculate total spent (for clients)
            const totalSpent = user?.role === 'CLIENT'
                ? completed.reduce((sum, apt) => sum + apt.totalPrice, 0)
                : 0;

            setStats({
                totalAppointments: appointments.length,
                upcomingAppointments: upcoming.length,
                completedAppointments: completed.length,
                totalSpent: totalSpent,
                cancelledAppointments: cancelled.length
            });

        } catch (error) {
            console.error('Error fetching real stats:', error);
            toast.error('Failed to load appointment statistics');

            // Fallback to zero stats instead of mock data
            setStats({
                totalAppointments: 0,
                upcomingAppointments: 0,
                completedAppointments: 0,
                totalSpent: 0,
                cancelledAppointments: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        // Reset form to original values
        if (profileData) {
            setEditForm({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone || ''
            });
        }
    };

    const handleSave = async () => {
        if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
            toast.error('First name and last name are required');
            return;
        }

        try {
            setSaving(true);
            const response = await api.put('/users/profile', {
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                phone: editForm.phone.trim() || null
            });

            setProfileData(response.data);
            setEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getRoleBadgeColor = (role: string) => {
        return role === 'STAFF'
            ? 'bg-accent text-white'
            : 'bg-primary text-white';
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-dark-text/60">Loading profile...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!profileData) {
        return (
            <Layout>
                <div className="card text-center py-12">
                    <UserIcon size={48} className="mx-auto text-dark-text/30 mb-4" />
                    <h3 className="text-xl font-semibold text-dark-text mb-2">
                        Profile not found
                    </h3>
                    <p className="text-dark-text/60">
                        Unable to load your profile information.
                    </p>
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
                        <h1 className="text-3xl font-bold text-dark-text">My Profile</h1>
                        <p className="text-dark-text/60 mt-1">
                            Manage your account information
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="card">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-semibold text-dark-text">Personal Information</h2>
                        {!editing && (
                            <button
                                onClick={handleEdit}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Info */}
                        <div className="space-y-4">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-1">
                                    First Name
                                </label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                        className="input-field"
                                        placeholder="Enter your first name"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                        <UserIcon size={16} className="text-dark-text/60" />
                                        <span className="text-dark-text">{profileData.firstName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-1">
                                    Last Name
                                </label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                        className="input-field"
                                        placeholder="Enter your last name"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                        <UserIcon size={16} className="text-dark-text/60" />
                                        <span className="text-dark-text">{profileData.lastName}</span>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-1">
                                    Phone Number
                                </label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        className="input-field"
                                        placeholder="Enter your phone number"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                        <Phone size={16} className="text-dark-text/60" />
                                        <span className="text-dark-text">
                                            {profileData.phone || 'Not provided'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Info (Read-only) */}
                        <div className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-1">
                                    Username
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <UserIcon size={16} className="text-dark-text/60" />
                                    <span className="text-dark-text">{profileData.username}</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-1">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <Mail size={16} className="text-dark-text/60" />
                                    <span className="text-dark-text">{profileData.email}</span>
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-1">
                                    Account Type
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                    <Shield size={16} className="text-dark-text/60" />
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profileData.role)}`}>
                                        {profileData.role === 'CLIENT' ? 'Client' : 'Staff Member'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Actions */}
                    {editing && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                            <button
                                onClick={handleCancel}
                                className="btn-secondary flex items-center gap-2"
                                disabled={saving}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary flex items-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-light-text/30 border-t-light-text rounded-full animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Real Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Total Appointments
                        </h3>
                        <p className="text-2xl font-bold text-accent">{stats.totalAppointments}</p>
                        <p className="text-sm text-dark-text/60 mt-1">All time</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Upcoming
                        </h3>
                        <p className="text-2xl font-bold text-accent">{stats.upcomingAppointments}</p>
                        <p className="text-sm text-dark-text/60 mt-1">Scheduled</p>
                    </div>

                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            <UserIcon className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            Completed
                        </h3>
                        <p className="text-2xl font-bold text-accent">{stats.completedAppointments}</p>
                        <p className="text-sm text-dark-text/60 mt-1">Finished</p>
                    </div>

                    {/* Total Spent (for clients) or Cancelled (for staff) */}
                    <div className="card text-center">
                        <div className="bg-secondary p-3 rounded-full w-fit mx-auto mb-4">
                            {user?.role === 'CLIENT' ? (
                                <UserIcon className="w-6 h-6 text-accent" />
                            ) : (
                                <X className="w-6 h-6 text-accent" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-dark-text mb-2">
                            {user?.role === 'CLIENT' ? 'Total Spent' : 'Cancelled'}
                        </h3>
                        <p className="text-2xl font-bold text-accent">
                            {user?.role === 'CLIENT'
                                ? formatPrice(stats.totalSpent || 0)
                                : stats.cancelledAppointments
                            }
                        </p>
                        <p className="text-sm text-dark-text/60 mt-1">
                            {user?.role === 'CLIENT' ? 'All services' : 'Appointments'}
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}