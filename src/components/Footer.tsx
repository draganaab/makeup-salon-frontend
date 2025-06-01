'use client';

import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Calendar, Scissors } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-text text-light-text mt-auto">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="bg-primary p-2 rounded-lg">
                                <Heart className="w-6 h-6 text-light-text" />
                            </div>
                            <span className="ml-3 text-xl font-bold">Makeup Salon</span>
                        </div>
                        <p className="text-light-text/80 mb-6 leading-relaxed">
                            Where beauty meets artistry. Professional makeup services for every occasion,
                            making you feel confident and radiant.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="bg-light-text/10 p-2 rounded-lg hover:bg-primary transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="bg-light-text/10 p-2 rounded-lg hover:bg-primary transition-colors duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="bg-light-text/10 p-2 rounded-lg hover:bg-primary transition-colors duration-200"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="/services" className="text-light-text/80 hover:text-primary transition-colors duration-200 flex items-center">
                                    <Scissors className="w-4 h-4 mr-2" />
                                    Our Services
                                </a>
                            </li>
                            <li>
                                <a href="/appointments" className="text-light-text/80 hover:text-primary transition-colors duration-200 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Appointment
                                </a>
                            </li>
                            <li>
                                <a href="/dashboard" className="text-light-text/80 hover:text-primary transition-colors duration-200">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/profile" className="text-light-text/80 hover:text-primary transition-colors duration-200">
                                    My Profile
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Services</h3>
                        <ul className="space-y-3">
                            <li>
                                <span className="text-light-text/80">Bridal Makeup</span>
                            </li>
                            <li>
                                <span className="text-light-text/80">Party Makeup</span>
                            </li>
                            <li>
                                <span className="text-light-text/80">Everyday Makeup</span>
                            </li>
                            <li>
                                <span className="text-light-text/80">Photoshoot Makeup</span>
                            </li>
                            <li>
                                <span className="text-light-text/80">Special FX</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Contact Us</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-light-text/80">
                                        Knez Mihajlova 43<br />
                                        Belgrade, Serbia 11000
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Phone className="w-5 h-5 text-primary mr-3" />
                                <a href="tel:+381123456789" className="text-light-text/80 hover:text-primary transition-colors">
                                    +381 12 345 6789
                                </a>
                            </div>

                            <div className="flex items-center">
                                <Mail className="w-5 h-5 text-primary mr-3" />
                                <a href="mailto:info@makeupsalon.com" className="text-light-text/80 hover:text-primary transition-colors">
                                    info@makeupsalon.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-light-text/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-light-text/60 text-sm">
                            © {currentYear} Makeup Salon. All rights reserved.
                        </div>

                        <div className="flex space-x-6 text-sm">
                            <a href="#" className="text-light-text/60 hover:text-primary transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-light-text/60 hover:text-primary transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="text-light-text/60 hover:text-primary transition-colors">
                                Booking Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}