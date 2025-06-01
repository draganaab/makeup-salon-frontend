'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Service } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Scissors,
    Plus,
    Edit,
    Eye,
    EyeOff,
    DollarSign,
    Clock,
    Filter,
    X,
    Save,
    Trash2
} from 'lucide-react';

interface ServiceFormData {
    name: string;
    description: string;
    price: string;
    durationMinutes: string;
    category: Service['category'];
    active: boolean;
}

export default function ManageServicesPage() {
    const { user, loading: authLoading } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [showInactive, setShowInactive] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: '',
        durationMinutes: '',
        category: 'EVERYDAY',
        active: true
    });

    useEffect(() => {
        if (user?.role === 'STAFF') {
            fetchServices();
        }
    }, [user]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await api.get<Service[]>('/services/all');
            setServices(response.data);
        } catch (error: any) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        if (!showInactive && !service.active) return false;
        if (categoryFilter === 'ALL') return true;
        return service.category === categoryFilter;
    });

    const categories = [
        { value: 'ALL', label: 'All Categories' },
        { value: 'BRIDAL', label: 'Bridal' },
        { value: 'PARTY', label: 'Party' },
        { value: 'EVERYDAY', label: 'Everyday' },
        { value: 'PHOTOSHOOT', label: 'Photoshoot' },
        { value: 'SPECIAL_FX', label: 'Special FX' }
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            'BRIDAL': 'bg-pink-100 text-pink-800',
            'PARTY': 'bg-purple-100 text-purple-800',
            'EVERYDAY': 'bg-blue-100 text-blue-800',
            'PHOTOSHOOT': 'bg-green-100 text-green-800',
            'SPECIAL_FX': 'bg-orange-100 text-orange-800'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const openModal = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description,
                price: service.price.toString(),
                durationMinutes: service.durationMinutes.toString(),
                category: service.category,
                active: service.active
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                durationMinutes: '',
                category: 'EVERYDAY',
                active: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingService(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error('Name and description are required');
            return;
        }

        const price = parseFloat(formData.price);
        const duration = parseInt(formData.durationMinutes);

        if (isNaN(price) || price <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        if (isNaN(duration) || duration <= 0) {
            toast.error('Please enter a valid duration');
            return;
        }

        try {
            setSubmitting(true);

            const serviceData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: price,
                durationMinutes: duration,
                category: formData.category,
                active: formData.active
            };

            if (editingService) {
                // Update existing service
                await api.put(`/services/${editingService.id}`, serviceData);
                toast.success('Service updated successfully');
            } else {
                // Create new service
                await api.post('/services', serviceData);
                toast.success('Service created successfully');
            }

            fetchServices();
            closeModal();
        } catch (error: any) {
            console.error('Error saving service:', error);
            toast.error(error.response?.data?.message || 'Failed to save service');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleServiceStatus = async (service: Service) => {
        try {
            await api.put(`/services/${service.id}`, {
                active: !service.active
            });
            toast.success(`Service ${!service.active ? 'activated' : 'deactivated'}`);
            fetchServices();
        } catch (error: any) {
            console.error('Error toggling service status:', error);
            toast.error('Failed to update service status');
        }
    };

    const deleteService = async (serviceId: number) => {
        if (!confirm('Are you sure you want to delete this service? This will deactivate it.')) return;

        try {
            await api.delete(`/services/${serviceId}`);
            toast.success('Service deactivated successfully');
            fetchServices();
        } catch (error: any) {
            console.error('Error deleting service:', error);
            toast.error('Failed to delete service');
        }
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-dark-text/60">Loading services...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (user?.role !== 'STAFF') {
        return (
            <Layout>
                <div className="card text-center py-12">
                    <Scissors size={48} className="mx-auto text-dark-text/30 mb-4" />
                    <h3 className="text-xl font-semibold text-dark-text mb-2">
                        Access Denied
                    </h3>
                    <p className="text-dark-text/60">
                        Only staff members can manage services.
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
                        <h1 className="text-3xl font-bold text-dark-text">Manage Services</h1>
                        <p className="text-dark-text/60 mt-1">
                            Create, edit, and manage salon services
                        </p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add New Service
                    </button>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Filter size={20} className="text-dark-text/60" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="input-field"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setShowInactive(!showInactive)}
                            className={`btn-secondary flex items-center gap-2 ${
                                showInactive ? 'bg-accent text-white' : ''
                            }`}
                        >
                            {showInactive ? <Eye size={20} /> : <EyeOff size={20} />}
                            {showInactive ? 'Showing All' : 'Active Only'}
                        </button>
                    </div>
                </div>

                {/* Services Grid */}
                {filteredServices.length === 0 ? (
                    <div className="card text-center py-12">
                        <Scissors size={48} className="mx-auto text-dark-text/30 mb-4" />
                        <h3 className="text-xl font-semibold text-dark-text mb-2">
                            No services found
                        </h3>
                        <p className="text-dark-text/60 mb-4">
                            {categoryFilter === 'ALL'
                                ? 'No services have been created yet.'
                                : `No services found in the ${categoryFilter.toLowerCase()} category.`
                            }
                        </p>
                        <button
                            onClick={() => openModal()}
                            className="btn-primary"
                        >
                            Create First Service
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div
                                key={service.id}
                                className={`card ${!service.active ? 'opacity-60 border-dashed' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-dark-text mb-1">
                                            {service.name}
                                        </h3>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                                            {service.category.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openModal(service)}
                                            className="p-2 text-dark-text/40 hover:text-accent transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleServiceStatus(service)}
                                            className="p-2 text-dark-text/40 hover:text-accent transition-colors"
                                        >
                                            {service.active ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-dark-text/70 text-sm mb-4 line-clamp-2">
                                    {service.description}
                                </p>

                                <div className="flex justify-between items-center pt-4 border-t border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-sm text-dark-text/60">
                                            <Clock size={16} />
                                            {formatDuration(service.durationMinutes)}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                                            <DollarSign size={16} />
                                            {formatPrice(service.price)}
                                        </div>
                                    </div>
                                    {!service.active && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Service Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-light-text rounded-xl max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold text-dark-text">
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="p-2 text-dark-text/60 hover:text-dark-text transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Service Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="input-field"
                                        placeholder="e.g., Bridal Makeup"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="input-field resize-none"
                                        rows={3}
                                        placeholder="Describe the service..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                            className="input-field"
                                            placeholder="50.00"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Duration (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            min="15"
                                            step="15"
                                            value={formData.durationMinutes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: e.target.value }))}
                                            className="input-field"
                                            placeholder="60"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Service['category'] }))}
                                        className="input-field"
                                    >
                                        <option value="BRIDAL">Bridal</option>
                                        <option value="PARTY">Party</option>
                                        <option value="EVERYDAY">Everyday</option>
                                        <option value="PHOTOSHOOT">Photoshoot</option>
                                        <option value="SPECIAL_FX">Special FX</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="active" className="text-sm text-dark-text">
                                        Service is active and available for booking
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={submitting}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-light-text/30 border-t-light-text rounded-full animate-spin" />
                                        ) : (
                                            <Save size={20} />
                                        )}
                                        {submitting ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}