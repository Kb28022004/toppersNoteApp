import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    InputAdornment,
    Pagination,
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Button,
    Chip,
    Tooltip,
    Grid
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Visibility as ViewIcon,
    ReceiptLong as ReceiptIcon,
    AccountBalanceWallet as WalletIcon,
    ShoppingBag as BagIcon,
    Download as DownloadIcon,
    MoreVert as MoreIcon
} from '@mui/icons-material';
import { useGetAllOrdersQuery } from '../../feature/api/adminApi';

const Transactions = () => {
    const theme = useTheme();
    const token = localStorage.getItem("authToken");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data: ordersData, isLoading } = useGetAllOrdersQuery({
        token,
        page,
        limit: 10,
        search,
        status: statusFilter
    });

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, minHeight: '60vh', alignItems: 'center' }}>
                <CircularProgress thickness={5} size={50} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.5 }}>
                        ADMINISTRATION • REVENUE
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                        Orders & Transactions
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    sx={{ borderRadius: 3, fontWeight: 800, px: 3 }}
                >
                    Export Report
                </Button>
            </Box>

            {/* Quick Stats Summary */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 5, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'success.main', color: 'white' }}>
                                <WalletIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>TOTAL REVENUE</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{ordersData?.data?.reduce((sum, o) => sum + (o.amountPaid || 0), 0).toLocaleString()}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 5, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'info.main', color: 'white' }}>
                                <BagIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>TOTAL ORDERS</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>{ordersData?.pagination?.total || 0}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filter Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <TextField
                    placeholder="Search by student or transaction ID..."
                    value={search}
                    onChange={handleSearchChange}
                    size="small"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment>,
                        sx: { borderRadius: 3, bgcolor: 'background.paper' }
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="soft"
                    startIcon={<FilterIcon />}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                    All Status
                </Button>
            </Paper>

            {/* Transactions Table */}
            <TableContainer component={Paper} elevation={0} sx={{
                borderRadius: 6,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Resource Purchased</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordersData?.data?.map((order) => (
                            <TableRow key={order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                        #{order.txnId?.slice(-8).toUpperCase() || order._id.slice(-8).toUpperCase()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{order.studentId?.fullName || 'Anonymous student'}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>ID: {order.studentId?._id?.slice(-6) || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReceiptIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.noteId?.title || order.noteId?.subject}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Notes Package</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.main' }}>
                                        ₹{order.amountPaid || 0}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.paymentStatus || 'SUCCESS'}
                                        size="small"
                                        sx={{
                                            fontWeight: 900,
                                            borderRadius: 2,
                                            height: 24,
                                            bgcolor: order.paymentStatus === 'FAILED' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                            color: order.paymentStatus === 'FAILED' ? 'error.main' : 'success.main',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Receipt">
                                        <IconButton size="small" sx={{ color: 'text.secondary', bgcolor: alpha(theme.palette.action.selected, 0.05) }}>
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small">
                                        <MoreIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={ordersData?.pagination?.pages || 1}
                    page={page}
                    onChange={(e, p) => setPage(p)}
                    color="primary"
                    sx={{
                        '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 700 }
                    }}
                />
            </Box>
        </Box>
    );
};

export default Transactions;
