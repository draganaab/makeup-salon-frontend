'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Service } from '@/lib/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Scissors,
    Clock,
    DollarSign,
    Filter,
    Plus,
    Edit,
    Eye,
    EyeOff
} from 'lucide-react';

export default function ServicesPage() {
    const { user, loading: authLoading } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        fetchServices();
    }, [showInactive, user]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            // Staff can see all services (including inactive), clients see only active
            const endpoint = user?.role === 'STAFF' && showInactive
                ? '/services/all'
                : '/services';

            const response = await api.get<Service[]>(endpoint);
            setServices(response.data);
        } catch (error: any) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(service => {
        if (filter === 'ALL') return true;
        return service.category === filter;
    });

    const categories = [
        { value: 'ALL', label: 'All Services' },
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

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text">Services</h1>
                        <p className="text-dark-text/60 mt-1">
                            Discover our beautiful makeup services
                        </p>
                    </div>

                    {/* Staff Actions */}
                    {user?.role === 'STAFF' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowInactive(!showInactive)}
                                className={`btn-secondary flex items-center gap-2 ${
                                    showInactive ? 'bg-accent text-white' : ''
                                }`}
                            >
                                {showInactive ? <EyeOff size={20} /> : <Eye size={20} />}
                                {showInactive ? 'Hide Inactive' : 'Show All'}
                            </button>
                            <button className="btn-primary flex items-center gap-2">
                                <Plus size={20} />
                                Add Service
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        <Filter size={20} className="text-dark-text/60" />
                        <span className="font-medium text-dark-text">Filter by Category:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => setFilter(category.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    filter === category.value
                                        ? 'bg-primary text-white'
                                        : 'bg-secondary text-dark-text hover:bg-primary/10'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Services Grid */}
                {filteredServices.length === 0 ? (
                    <div className="card text-center py-12">
                        <Scissors size={48} className="mx-auto text-dark-text/30 mb-4" />
                        <h3 className="text-xl font-semibold text-dark-text mb-2">
                            No services found
                        </h3>
                        <p className="text-dark-text/60">
                            {filter === 'ALL'
                                ? 'No services are available at the moment.'
                                : `No services found in the ${filter.toLowerCase()} category.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div
                                key={service.id}
                                className={`card hover:shadow-md transition-shadow duration-200 ${
                                    !service.active ? 'opacity-60 border-dashed' : ''
                                }`}
                            >
                                {/* Service Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-dark-text mb-1">
                                            {service.name}
                                            {!service.active && (
                                                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </h3>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                                            {service.category.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {user?.role === 'STAFF' && (
                                        <button className="p-2 text-dark-text/40 hover:text-accent transition-colors">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Service Description */}
                                <p className="text-dark-text/70 text-sm mb-4 line-clamp-2">
                                    {service.description}
                                </p>

                                {/* Service Details */}
                                <div className="flex justify-between items-center">
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}