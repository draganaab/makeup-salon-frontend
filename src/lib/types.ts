// User types
export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'CLIENT' | 'STAFF';
    createdAt: string;
}

// Service types
export interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    category: 'BRIDAL' | 'PARTY' | 'EVERYDAY' | 'PHOTOSHOOT' | 'SPECIAL_FX';
    active: boolean;
    createdAt: string;
}

// Appointment types
export interface Appointment {
    id: number;
    appointmentDate: string;
    status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    totalPrice: number;
    notes?: string;
    client: User;
    staffMember?: User;
    services: Service[];
    createdAt: string;
}

// Auth request/response types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface JwtResponse {
    token: string;
    refreshToken: string;
    type: string;
    id: number;
    username: string;
    email: string;
    role: string;
}

// API response types
export interface MessageResponse {
    message: string;
}

// Form types
export interface CreateAppointmentRequest {
    appointmentDate: string;
    clientId?: number;
    serviceIds: number[];
    notes?: string;
}