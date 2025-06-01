'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { User } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import {
    Users,
    Search,
    Mail,
    Phone,
    Calendar,
    Shield,
    User as UserIcon,
    Filter,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function ClientsPage() {
    const { user, loading: authLoading } = useAuth();
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
    const [expandedClient, setExpandedClient] = useState<number | null>(null);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [promoteLoading, setPromoteLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'STAFF') {
            fetchClients();
        }
    }, [user]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get<User[]>('/users/clients');
            setClients(response.data);
        } catch (error: any) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return fullName.includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower) ||
            (client.username && client.username.toLowerCase().includes(searchLower));
    });

    const sortedClients = [...filteredClients].sort((a, b) => {
        if (sortBy === 'name') {
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const toggleClientExpansion = (clientId: number) => {
        setExpandedClient(expandedClient === clientId ? null : clientId);
    };

    const handlePromoteClick = (userId: number) => {
        setSelectedClientId(userId);
        setShowPromoteModal(true);
    };

    const handlePromoteConfirm = async () => {
        if (!selectedClientId) return;

        try {
            setPromoteLoading(true);
            await api.put(`/users/${selectedClientId}/role`, { role: 'STAFF' });
            toast.success('User promoted to staff successfully');
            fetchClients(); // Refresh the list
            setShowPromoteModal(false);
            setSelectedClientId(null);
        } catch (error: any) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role');
        } finally {
            setPromoteLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-dark-text/60">Loading clients...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (user?.role !== 'STAFF') {
        return (
            <Layout>
                <div className="card text-center py-12">
                    <Shield size={48} className="mx-auto text-dark-text/30 mb-4" />
                    <h3 className="text-xl font-semibold text-dark-text mb-2">
                        Access Denied
                    </h3>
                    <p className="text-dark-text/60">
                        Only staff members can access this page.
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
                        <h1 className="text-3xl font-bold text-dark-text">Clients</h1>
                        <p className="text-dark-text/60 mt-1">
                            View and manage all registered clients
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-dark-text/60">
                        <Users size={20} />
                        <span className="font-medium">{clients.length} Total Clients</span>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="card">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text/40" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, email, or username..."
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-dark-text/60" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                                className="input-field"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="date">Sort by Join Date</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Clients List */}
                {sortedClients.length === 0 ? (
                    <div className="card text-center py-12">
                        <Users size={48} className="mx-auto text-dark-text/30 mb-4" />
                        <h3 className="text-xl font-semibold text-dark-text mb-2">
                            No clients found
                        </h3>
                        <p className="text-dark-text/60">
                            {searchTerm
                                ? `No clients match "${searchTerm}"`
                                : 'No registered clients yet.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedClients.map((client) => (
                            <div key={client.id} className="card">
                                <div
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleClientExpansion(client.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-secondary p-3 rounded-full">
                                            <UserIcon size={24} className="text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-dark-text">
                                                {client.firstName} {client.lastName}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-dark-text/60">
                                                <span className="flex items-center gap-1">
                                                    <Mail size={14} />
                                                    {client.email}
                                                </span>
                                                {client.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={14} />
                                                        {client.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-dark-text/60">
                                            Member since {formatDate(client.createdAt)}
                                        </span>
                                        {expandedClient === client.id ? (
                                            <ChevronUp size={20} className="text-dark-text/40" />
                                        ) : (
                                            <ChevronDown size={20} className="text-dark-text/40" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedClient === client.id && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-medium text-dark-text mb-2">Account Details</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-dark-text/60">Username:</span>
                                                        <span className="text-dark-text">{client.username}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-dark-text/60">User ID:</span>
                                                        <span className="text-dark-text">#{client.id}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-dark-text/60">Role:</span>
                                                        <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                                                            {client.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-dark-text mb-2">Actions</h4>
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePromoteClick(client.id);
                                                        }}
                                                        className="btn-accent w-full text-sm"
                                                    >
                                                        Promote to Staff
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={showPromoteModal}
                onClose={() => {
                    setShowPromoteModal(false);
                    setSelectedClientId(null);
                }}
                onConfirm={handlePromoteConfirm}
                title="Promote to Staff"
                message="Are you sure you want to promote this client to staff member? This will give them access to staff features and management capabilities."
                confirmText="Promote to Staff"
                cancelText="Cancel"
                isLoading={promoteLoading}
                variant="warning"
            />
        </Layout>
    );
}