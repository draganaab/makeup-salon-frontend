'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'warning' | 'danger' | 'info';
}

export default function ConfirmationModal({
                                              isOpen,
                                              onClose,
                                              onConfirm,
                                              title,
                                              message,
                                              confirmText = 'Confirm',
                                              cancelText = 'Cancel',
                                              isLoading = false,
                                              variant = 'warning'
                                          }: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getVariantColors = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white'
                };
            case 'warning':
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white'
                };
            case 'info':
                return {
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white'
                };
            default:
                return {
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white'
                };
        }
    };

    const colors = getVariantColors();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${colors.iconBg}`}>
                            <AlertTriangle className={`w-5 h-5 ${colors.iconColor}`} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${colors.confirmBtn} flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}