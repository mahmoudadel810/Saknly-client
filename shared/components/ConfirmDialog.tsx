"use client";
import React, { useId, useRef } from 'react';
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
 * 16px radius) and the title and action gutters. For a destructive action the safe choice, Cancel, has the
 * initial focus, so Enter does not confirm by accident; a non-destructive dialog focuses the confirm button.
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
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
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
      slotProps={{
        paper: { sx: { m: { xs: 2, sm: 4 }, width: { xs: 'calc(100% - 32px)', sm: undefined } } },
        // The focus trap focuses the dialog itself on open, which overrides autoFocus: move focus once the
        // dialog has entered (Cancel for a destructive action, otherwise the confirm button).
        transition: { onEntered: () => (destructive ? cancelRef : confirmRef).current?.focus() },
      }}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId} component="div" sx={{ color: 'text.secondary', fontSize: '0.9375rem' }}>
          {description}
        </DialogContentText>
        {children}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          color="inherit"
          ref={cancelRef}
          autoFocus={destructive}
          sx={{ color: 'text.secondary' }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={loading || confirmDisabled}
          ref={confirmRef}
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
