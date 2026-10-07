"use client";
import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useDarkMode } from '@/app/context/DarkModeContext';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** What will actually happen, stated plainly (irreversible? who is notified?). */
  message: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  /** While true the dialog cannot be dismissed and both buttons are disabled. */
  pending?: boolean;
  confirmDisabled?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Extra inputs, e.g. a rejection reason. */
  children?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'إلغاء',
  pending = false,
  confirmDisabled = false,
  destructive = true,
  onConfirm,
  onClose,
  children,
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <Dialog
      open={open}
      onClose={() => !pending && onClose()}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          borderRadius: 3,
          backgroundColor: isDarkMode ? 'var(--dark-800)' : undefined,
          color: isDarkMode ? '#fff' : undefined,
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div" sx={{ color: isDarkMode ? '#e5e7eb' : undefined }}>
          {message}
        </DialogContentText>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={pending} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={pending || confirmDisabled}
          startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {pending ? pendingLabel ?? confirmLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
