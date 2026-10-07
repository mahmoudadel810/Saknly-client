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
  description: React.ReactNode;
  confirmLabel: string;
  loadingLabel?: string;
  cancelLabel?: string;
  /** While true the dialog cannot be dismissed and both buttons are disabled. */
  loading?: boolean;
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
  description,
  confirmLabel,
  loadingLabel,
  cancelLabel = 'إلغاء',
  loading = false,
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
      onClose={() => !loading && onClose()}
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
          {description}
        </DialogContentText>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={loading || confirmDisabled}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? loadingLabel ?? confirmLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
