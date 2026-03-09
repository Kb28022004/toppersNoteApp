import React, { useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    CircularProgress,
    TextField,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    alpha,
    Grid,
    useTheme
} from "@mui/material";
import {
    useGetPendingToppersQuery,
    useApproveTopperMutation,
    useRejectTopperMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/common/StatusChip";

const PendingToppers = () => {
    const theme = useTheme();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState({
        expertiseClass: "",
        stream: ""
    });

    const [modalConfig, setModalConfig] = React.useState({
        open: false,
        type: '',
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const [debouncedSearch, setDebouncedSearch] = React.useState(search);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching, error: getError, refetch } = useGetPendingToppersQuery({
        token,
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        expertiseClass: filters.expertiseClass,
        stream: filters.stream,
        status: "PENDING"
    }, { skip: !token });

    const [approveTopper, { isLoading: isApproving }] = useApproveTopperMutation();
    const [rejectTopper, { isLoading: isRejecting }] = useRejectTopperMutation();

    const handleApprove = useCallback((id) => {
        setModalConfig({
            open: true,
            type: 'approve',
            id,
            title: 'Approve Topper',
            message: 'Are you sure you want to approve this topper? They will be verified and allowed to sell notes.',
            confirmText: 'Approve',
            confirmColor: 'primary',
            showReasonField: false
        });
    }, []);

    const handleReject = useCallback((id) => {
        setModalConfig({
            open: true,
            type: 'reject',
            id,
            title: 'Reject Topper',
            message: 'Please provide a reason for rejecting this topper profile.',
            confirmText: 'Reject',
            confirmColor: 'error',
            showReasonField: true
        });
    }, []);

    const handleConfirmAction = useCallback(async (reason) => {
        const { type, id } = modalConfig;
        try {
            if (type === 'approve') {
                await approveTopper({ id, token }).unwrap();
                toast.success("Topper approved successfully");
            } else {
                await rejectTopper({ id, reason, token }).unwrap();
                toast.success("Topper rejected successfully");
            }
            setModalConfig(prev => ({ ...prev, open: false }));
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || `Failed to ${type} topper`);
        }
    }, [modalConfig, approveTopper, rejectTopper, token, refetch]);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setPage(1);
    }, []);

    const columns = useMemo(() => [
        {
            id: 'name',
            label: 'Topper Detail',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700 }}>
                        {row.firstName?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.firstName} {row.lastName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.userId?.phone || 'No Phone'}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'expertiseClass',
            label: 'Class/Stream',
            render: (row) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Class {row.expertiseClass}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.stream || "General"}</Typography>
                </Box>
            )
        },
        {
            id: 'marks',
            label: 'Academic Performance',
            render: (row) => (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {row.subjectMarks?.slice(0, 3).map((sub, index) => (
                        <Chip
                            key={index}
                            label={`${sub.subject}: ${sub.marks}`}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.divider, 0.05), border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1), fontSize: '0.7rem' }}
                        />
                    ))}
                    {row.subjectMarks?.length > 3 && <Typography variant="caption">+{row.subjectMarks.length - 3} more</Typography>}
                </Stack>
            )
        },
        {
            id: 'marksheet',
            label: 'Verification',
            render: (row) => row.marksheetUrl ? (
                <Button
                    href={row.marksheetUrl} target="_blank" variant="text" size="small"
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    View Document
                </Button>
            ) : <Typography variant="caption" color="text.disabled">No File</Typography>
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => <StatusChip status={row.status || "PENDING"} />
        },
        {
            id: 'actions',
            label: 'Review',
            render: (row) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="soft" size="small" color="primary"
                        onClick={() => handleApprove(row._id)}
                        disabled={isApproving || isRejecting}
                        sx={{ fontWeight: 700 }}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="soft" size="small" color="error"
                        onClick={() => handleReject(row._id)}
                        disabled={isApproving || isRejecting}
                        sx={{ fontWeight: 700 }}
                    >
                        Reject
                    </Button>
                </Stack>
            )
        }
    ], [handleApprove, handleReject, isApproving, isRejecting, theme]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Verification Pipeline</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Topper Applications</Typography>
                </Box>
                <IconButton onClick={() => refetch()} sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
                    <RefreshIcon sx={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                </IconButton>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by name or phone..."
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Class</InputLabel>
                            <Select
                                name="expertiseClass"
                                value={filters.expertiseClass}
                                label="Class"
                                onChange={handleFilterChange}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            >
                                <MenuItem value="">All Classes</MenuItem>
                                <MenuItem value="10">Class 10</MenuItem>
                                <MenuItem value="12">Class 12</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Stream</InputLabel>
                            <Select
                                name="stream"
                                value={filters.stream}
                                label="Stream"
                                onChange={handleFilterChange}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            >
                                <MenuItem value="">All Streams</MenuItem>
                                <MenuItem value="Science">Science</MenuItem>
                                <MenuItem value="Commerce">Commerce</MenuItem>
                                <MenuItem value="Arts">Arts</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
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
                noDataMessage="No pending topper applications"
                noDataIcon={AssignmentTurnedInIcon}
            />

            <ConfirmationModal
                open={modalConfig.open}
                onClose={() => setModalConfig(prev => ({ ...prev, open: false }))}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                showReasonField={modalConfig.showReasonField}
                isLoading={isApproving || isRejecting}
            />
        </Box>
    );
};

export default PendingToppers;

