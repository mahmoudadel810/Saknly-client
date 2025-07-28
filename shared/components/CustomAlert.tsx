import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = 'تأكيد العملية',
    message,
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog open={open} onClose={onCancel} PaperProps={{
            sx: { minWidth: '23rem' },
        }}>
            <DialogTitle>{title}</DialogTitle>
            <Divider sx={{ mx: 2 }} />
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <Divider sx={{ mx: 2, mb: 2 }} />
            <DialogActions>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: "row-reverse",
                        justifyContent: 'space-between',
                        px: 2,
                        pb: 2,
                    }}
                >
                    <Button onClick={onCancel} color="error" variant="contained">
                        إلغاء
                    </Button>
                    <Button onClick={onConfirm} color="info" variant="contained">
                        تأكيد
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
