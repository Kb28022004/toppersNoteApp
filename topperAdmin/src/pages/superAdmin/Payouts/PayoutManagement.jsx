import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    CircularProgress,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    alpha,
    useTheme,
    Grid
} from "@mui/material";
import {
    useGetPayoutRequestsQuery,
    useUpdatePayoutStatusMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import RefreshIcon from '@mui/icons-material/Refresh';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/common/StatusChip";

const PayoutManagement = () => {
    const theme = useTheme();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [processModal, setProcessModal] = useState({
        open: false,
        payout: null,
        type: 'approve', // 'approve' or 'reject'
        transactionId: '',
        adminRemarks: ''
    });

    const { data, isLoading, isFetching, refetch } = useGetPayoutRequestsQuery({
        token,
        status: statusFilter,
        page,
        limit: rowsPerPage
    }, { skip: !token });

    const [updateStatus, { isLoading: isUpdating }] = useUpdatePayoutStatusMutation();

    const handleOpenProcess = (payout, type) => {
        setProcessModal({
            open: true,
            payout,
            type,
            transactionId: '',
            adminRemarks: ''
        });
    };

    const handleConfirmProcess = async () => {
        const { payout, type, transactionId, adminRemarks } = processModal;
        if (type === 'approve' && !transactionId) {
            toast.error("Transaction ID is required for approval");
            return;
        }

        try {
            await updateStatus({
                id: payout._id,
                status: type === 'approve' ? 'PAID' : 'REJECTED',
                transactionId,
                adminRemarks,
                token
            }).unwrap();

            toast.success(`Payout ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
            setProcessModal(prev => ({ ...prev, open: false }));
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update payout status");
        }
    };

    const columns = useMemo(() => [
        {
            id: 'topper',
            label: 'Topper Identity',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                        <AccountBalanceWalletIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.topperId?.phone || 'N/A'}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>ID: {row.topperId?._id?.slice(-8)}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'amount',
            label: 'Withdrawal',
            render: (row) => (
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 800 }}>₹{row.amount}</Typography>
            )
        },
        {
            id: 'method',
            label: 'Transfer Via',
            render: (row) => (
                <Chip
                    icon={row.paymentMethod === 'UPI' ? <PaymentIcon sx={{ fontSize: '0.9rem !important' }} /> : <AccountBalanceIcon sx={{ fontSize: '0.9rem !important' }} />}
                    label={row.paymentMethod}
                    size="small"
                    sx={{
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: 'secondary.main',
                        borderRadius: 1.5
                    }}
                />
            )
        },
        {
            id: 'details',
            label: 'Destination',
            render: (row) => (
                <Box sx={{ maxWidth: 200 }}>
                    {row.paymentMethod === 'UPI' ? (
                        <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>{row.payoutDetails?.upiId}</Typography>
                    ) : (
                        <Box>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>{row.payoutDetails?.accountHolderName}</Typography>
                            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>{row.payoutDetails?.accountNumber} ({row.payoutDetails?.ifscCode})</Typography>
                        </Box>
                    )}
                </Box>
            )
        },
        {
            id: 'status',
            label: 'Cycle Status',
            render: (row) => <StatusChip status={row.status} />
        },
        {
            id: 'actions',
            label: 'Settlement',
            render: (row) => row.status === 'PENDING' ? (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="soft" size="small" color="primary"
                        onClick={() => handleOpenProcess(row, 'approve')}
                        sx={{ fontWeight: 700 }}
                    >
                        Mark Paid
                    </Button>
                    <Button
                        variant="soft" size="small" color="error"
                        onClick={() => handleOpenProcess(row, 'reject')}
                        sx={{ fontWeight: 700 }}
                    >
                        Reject
                    </Button>
                </Stack>
            ) : (
                <Box>
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {row.transactionId ? `Txn: ${row.transactionId}` : 'Processed'}
                    </Typography>
                </Box>
            )
        }
    ], [theme]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Financial Operations</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Payout Pipeline</Typography>
                </Box>
                <IconButton onClick={() => refetch()} sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
                    <RefreshIcon sx={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                </IconButton>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                }}
            >
                <Grid container spacing={1}>
                    {['PENDING', 'PAID', 'REJECTED'].map((s) => (
                        <Grid item key={s}>
                            <Button
                                variant={statusFilter === s ? "contained" : "soft"}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                size="small"
                                sx={{
                                    minWidth: 100,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    boxShadow: statusFilter === s ? theme.shadows[4] : 'none'
                                }}
                            >
                                {s}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                pagination={data?.pagination}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                noDataMessage={`No ${statusFilter.toLowerCase()} requests`}
                noDataIcon={CurrencyRupeeIcon}
            />

            <Dialog
                open={processModal.open}
                onClose={() => setProcessModal(prev => ({ ...prev, open: false }))}
                PaperProps={{
                    sx: {
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(16px)',
                        color: 'text.primary',
                        borderRadius: 4,
                        minWidth: 400,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 4 }}>
                    {processModal.type === 'approve' ? 'Process Disbursement' : 'Suspend Request'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.divider, 0.05), borderRadius: 3, textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ color: 'text.secondary' }}>Payout Amount</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{processModal.payout?.amount}</Typography>
                        </Box>

                        {processModal.type === 'approve' && (
                            <TextField
                                fullWidth
                                label="Execution Reference / Transaction ID"
                                value={processModal.transactionId}
                                autoFocus
                                onChange={(e) => setProcessModal(prev => ({ ...prev, transactionId: e.target.value }))}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            />
                        )}

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Internal Remarks"
                            placeholder="Add a note about this transaction..."
                            value={processModal.adminRemarks}
                            onChange={(e) => setProcessModal(prev => ({ ...prev, adminRemarks: e.target.value }))}
                            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 4, justifyContent: 'center', gap: 2 }}>
                    <Button
                        onClick={() => setProcessModal(prev => ({ ...prev, open: false }))}
                        sx={{ color: 'text.secondary', fontWeight: 700 }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmProcess}
                        disabled={isUpdating}
                        color={processModal.type === 'approve' ? 'success' : 'error'}
                        sx={{ px: 4, borderRadius: 3, fontWeight: 700 }}
                    >
                        {isUpdating ? <CircularProgress size={24} color="inherit" /> : (processModal.type === 'approve' ? 'Authorize Payment' : 'Reject Request')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PayoutManagement;

