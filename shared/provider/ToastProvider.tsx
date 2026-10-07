'use client';

import Alert, { type AlertColor } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

interface ToastContextType {
    /** Copy uses the action's own verb: "نُشر العقار" after "نشر". */
    showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastState {
    open: boolean;
    message: string;
    severity: AlertColor;
    /** Changes per toast so a new message replaces the old one instead of being merged into it. */
    key: number;
}

const SEVERITY_TOKEN: Record<AlertColor, string> = {
    success: '--c-success',
    info: '--c-info',
    warning: '--c-warning',
    error: '--c-error',
};

/**
 * The one toast provider (DESIGN-SYSTEM.md, Components): bottom-start, a raised surface with the severity's
 * token colour on its inline-start edge and icon, and text in the normal reading direction.
 * Snackbar positions with physical `left`, which the RTL style cache flips: "left" is the inline start.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success', key: 0 });

    const showToast = useCallback((message: string, severity: AlertColor = 'success') => {
        setToast((prev) => ({ open: true, message, severity, key: prev.key + 1 }));
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setToast((prev) => ({ ...prev, open: false }));
    };

    const contextValue = useMemo(() => ({ showToast }), [showToast]);
    const token = SEVERITY_TOKEN[toast.severity];

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <Snackbar
                key={toast.key}
                open={toast.open}
                autoHideDuration={toast.severity === 'error' ? 6000 : 4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={toast.severity}
                    variant="outlined"
                    slotProps={{ closeButton: { 'aria-label': 'إغلاق' } }}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        alignItems: 'center',
                        color: 'text.primary',
                        bgcolor: 'var(--c-surface-raised)',
                        border: '1px solid',
                        borderColor: `color-mix(in srgb, var(${token}) 40%, var(--c-border))`,
                        borderInlineStartWidth: 4,
                        borderInlineStartColor: `var(${token})`,
                        boxShadow: 8,
                        fontSize: '0.875rem',
                        '& .MuiAlert-icon': { color: `var(${token})` },
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};
