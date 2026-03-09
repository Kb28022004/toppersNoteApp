import React, { memo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    LinearProgress,
    CircularProgress
} from '@mui/material';

const ConfirmationModal = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    confirmColor = "primary",
    showReasonField = false,
    reasonLabel = "Reason",
    isLoading = false
}) => {
    const [reason, setReason] = React.useState('');

    const handleConfirm = () => {
        if (showReasonField) {
            onConfirm(reason);
        } else {
            onConfirm();
        }
        setReason(''); // Reset for next time
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: '#1e2129',
                    color: 'white',
                    borderRadius: 3,
                    border: '1px solid #2c3039',
                    minWidth: '400px'
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#8b9bb4', mb: showReasonField ? 2 : 0 }}>
                    {message}
                </DialogContentText>
                {showReasonField && (
                    <TextField
                        autoFocus
                        margin="dense"
                        label={reasonLabel}
                        fullWidth
                        variant="outlined"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{
                            mt: 2,
                            bgcolor: '#2c3039',
                            borderRadius: 1,
                            input: { color: 'white' },
                            label: { color: '#8b9bb4' },
                            "& .MuiOutlinedInput-root fieldset": { borderColor: '#3d4250' },
                            "& .MuiInputLabel-root.Mui-focused": { color: '#448aff' },
                            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: '#448aff' }
                        }}
                    />
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} sx={{ color: '#8b9bb4', textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={confirmColor}
                    disabled={isLoading || (showReasonField && !reason.trim())}
                    sx={{ textTransform: 'none', px: 3 }}
                >
                    {isLoading ? <CircularProgress size={20} color="inherit" /> : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default memo(ConfirmationModal);
