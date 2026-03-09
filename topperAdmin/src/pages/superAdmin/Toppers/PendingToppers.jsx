import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Avatar,
    IconButton,
    alpha,
    useTheme,
    Chip
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
import FilterBar from "../../../components/common/FilterBar";

const PendingToppers = () => {
    const theme = useTheme();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        expertiseClass: "",
        stream: ""
    });

    const [modalConfig, setModalConfig] = useState({
        open: false,
        type: '',
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const [debouncedSearch, setDebouncedSearch] = useState(search);
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

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const filterFields = [
        {
            name: 'expertiseClass',
            label: 'Class',
            type: 'select',
            width: 3,
            options: [
                { label: 'Class 10', value: '10' },
                { label: 'Class 12', value: '12' }
            ]
        },
        {
            name: 'stream',
            label: 'Stream',
            type: 'select',
            width: 3,
            options: [
                { label: 'Science', value: 'Science' },
                { label: 'Commerce', value: 'Commerce' },
                { label: 'Arts', value: 'Arts' }
            ]
        }
    ];

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

            <FilterBar
                searchPlaceholder="Search by name or phone..."
                search={search}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                fields={filterFields}
            />

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

