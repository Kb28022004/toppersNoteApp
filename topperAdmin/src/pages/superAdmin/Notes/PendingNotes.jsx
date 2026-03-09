import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Avatar,
    IconButton,
    alpha,
    useTheme
} from "@mui/material";
import {
    useGetPendingNotesQuery,
    useApproveNoteMutation,
    useRejectNoteMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/common/StatusChip";
import FilterBar from "../../../components/common/FilterBar";

const PendingNotes = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        expertiseClass: '',
        board: '',
        subject: ''
    });

    const { data: notes, isLoading, isFetching, refetch } = useGetPendingNotesQuery({
        token,
        status: 'UNDER_REVIEW',
        page,
        limit,
        search,
        ...filters
    }, { skip: !token });

    const [approveNote, { isLoading: isApproving }] = useApproveNoteMutation();
    const [rejectNote, { isLoading: isRejecting }] = useRejectNoteMutation();

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleApprove = useCallback((id) => {
        setModalConfig({
            open: true,
            type: 'approve',
            id,
            title: 'Approve Note',
            message: 'Are you sure you want to approve this study note? It will be immediately available for students to purchase.',
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
            title: 'Reject Note',
            message: 'Please provide a clear reason for rejecting this content. This will be visible to the topper.',
            confirmText: 'Reject',
            confirmColor: 'error',
            showReasonField: true
        });
    }, []);

    const handleConfirmAction = useCallback(async (reason) => {
        const { type, id } = modalConfig;
        try {
            if (type === 'approve') {
                await approveNote({ id, token }).unwrap();
                toast.success("Note approved and published");
            } else {
                await rejectNote({ id, reason, token }).unwrap();
                toast.success("Note rejected successfully");
            }
            setModalConfig(prev => ({ ...prev, open: false }));
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || `Failed to ${type} note`);
        }
    }, [modalConfig, approveNote, rejectNote, token, refetch]);

    const filterFields = [
        {
            name: 'expertiseClass',
            label: 'Class',
            type: 'select',
            width: 2.5,
            options: [
                { label: 'Class 10', value: '10' },
                { label: 'Class 12', value: '12' }
            ]
        },
        {
            name: 'board',
            label: 'Board',
            type: 'select',
            width: 2.5,
            options: [
                { label: 'CBSE', value: 'CBSE' },
                { label: 'ICSE', value: 'ICSE' },
                { label: 'State Board', value: 'State Board' }
            ]
        },
        { name: 'subject', label: 'Subject', type: 'text', width: 3 }
    ];

    const columns = useMemo(() => [
        {
            id: 'title',
            label: 'Note Summary',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 2 }}>
                        <DescriptionOutlinedIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.chapterName || row.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Class {row.class} • {row.subject}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'topper',
            label: 'Author',
            render: (row) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.topperId?.firstName || 'Unknown'} {row.topperId?.lastName || ''}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Topper Profile</Typography>
                </Box>
            )
        },
        {
            id: 'board',
            label: 'Board',
            render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {row.board || '—'}
                </Typography>
            )
        },
        {
            id: 'price',
            label: 'Pricing',
            render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                    {row.price ? `₹${row.price}` : "Free"}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => <StatusChip status={row.status || "UNDER_REVIEW"} />
        },
        {
            id: 'actions',
            label: 'Moderation',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="soft" size="small" color="secondary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/superAdmin/notes/review/${row._id}`)}
                        sx={{ fontWeight: 700 }}
                    >
                        Review
                    </Button>
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
                </Box>
            )
        }
    ], [handleApprove, handleReject, isApproving, isRejecting, theme, navigate]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Content Pipeline</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Notes Moderation</Typography>
                </Box>
                <IconButton onClick={() => refetch()} sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
                    <RefreshIcon sx={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                </IconButton>
            </Box>

            <FilterBar
                searchPlaceholder="Search by subject, chapter, or topper name..."
                search={search}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                fields={filterFields}
            />

            <DataTable
                columns={columns}
                data={notes?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                pagination={notes?.pagination}
                onPageChange={setPage}
                onRowsPerPageChange={setLimit}
                noDataMessage="No pending study notes found"
                noDataIcon={DescriptionOutlinedIcon}
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

export default PendingNotes;

