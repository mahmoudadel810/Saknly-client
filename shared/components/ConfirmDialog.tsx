"use client";
import React, { useId } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConfirmDialogProps {
  open: boolean;
  /** Names the action: "حذف الاستفسار". */
  title: string;
  /** What will actually happen, stated plainly (irreversible? who is notified?). */
  description: React.ReactNode;
  confirmLabel: string;
  loadingLabel?: string;
  cancelLabel?: string;
  /** While true the dialog cannot be dismissed and both buttons are disabled. */
  loading?: boolean;
  confirmDisabled?: boolean;
  /** Destructive (default): an error-coloured confirm button, and focus starts on Cancel. */
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Extra inputs, e.g. a rejection reason. */
  children?: React.ReactNode;
}

/**
 * The one confirmation dialog (DESIGN-SYSTEM.md, Components). The theme styles the paper (raised surface,
 * 12px radius). For a destructive action the safe choice, Cancel, has the initial focus, so Enter does not
 * confirm by accident; a non-destructive dialog focuses the confirm button.
 */
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
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{ paper: { sx: { m: { xs: 2, sm: 4 }, width: { xs: 'calc(100% - 32px)', sm: undefined } } } }}
    >
      <DialogTitle id={titleId} sx={{ fontSize: '1.125rem', fontWeight: 600, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId} component="div" sx={{ color: 'text.secondary', fontSize: '0.9375rem' }}>
          {description}
        </DialogContentText>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} color="inherit" autoFocus={destructive}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={loading || confirmDisabled}
          autoFocus={!destructive}
          aria-busy={loading || undefined}
          startIcon={loading ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
        >
          {loading ? loadingLabel ?? confirmLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
