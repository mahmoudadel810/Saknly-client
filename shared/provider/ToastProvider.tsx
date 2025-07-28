'use client';

import { Snackbar, Alert, AlertColor } from '@mui/material';
import React, { createContext, useState, useContext, ReactNode } from 'react';

// تعريف نوع الـ Context
interface ToastContextType {
    showToast: (message: string, severity?: AlertColor) => void;
}

// إنشاء السياق
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// هوك للوصول للسياق
export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Props للـ Provider
interface ToastProviderProps {
    children: ReactNode;
}

// الحالة الداخلية للتوست
interface ToastState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

// Provider نفسه
export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showToast = (message: string, severity: AlertColor = 'success') => {
        setToast({ open: true, message, severity });
    };

    const handleClose = () => {
        setToast((prev) => ({ ...prev, open: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={toast.severity}
                    variant="filled"
                    dir="ltr"
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};
