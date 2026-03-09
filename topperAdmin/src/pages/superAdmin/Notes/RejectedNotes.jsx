import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Avatar,
    Stack,
    IconButton,
    TextField,
    alpha,
    useTheme
} from "@mui/material";
import {
    useGetPendingNotesQuery,
    useApproveNoteMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/common/StatusChip";

const RejectedNotes = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: notes, isLoading, isFetching, refetch } = useGetPendingNotesQuery(
        { token, status: 'REJECTED', search: debouncedSearch },
        { skip: !token }
    );

    const [approveNote, { isLoading: isApproving }] = useApproveNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary'
    });

    const handleApprove = useCallback((id) => {
        setModalConfig({
            open: true,
            id,
            title: 'Re-approve Content',
            message: 'Are you sure you want to approve this previously rejected note? This will publish it to the platform.',
            confirmText: 'Approve',
            confirmColor: 'primary'
        });
    }, []);

    const handleConfirmAction = useCallback(async () => {
        const { id } = modalConfig;
        try {
            await approveNote({ id, token }).unwrap();
            toast.success("Note approved and published");
            setModalConfig(prev => ({ ...prev, open: false }));
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to approve note");
        }
    }, [modalConfig, approveNote, token, refetch]);

    const columns = useMemo(() => [
        {
            id: 'title',
            label: 'Archive Summary',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', borderRadius: 2 }}>
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
                <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>{row.topperId?.firstName?.charAt(0)}</Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.topperId?.firstName}</Typography>
                </Stack>
            )
        },
        {
            id: 'price',
            label: 'Valuation',
            render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {row.price ? `₹${row.price}` : "Free"}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Archive Status',
            render: (row) => <StatusChip status="REJECTED" />
        },
        {
            id: 'actions',
            label: 'Workflow',
            render: (row) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="soft" size="small" color="secondary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/superAdmin/notes/review/${row._id}`)}
                        sx={{ fontWeight: 700 }}
                    >
                        View
                    </Button>
                    <Button
                        variant="soft" size="small" color="primary"
                        onClick={() => handleApprove(row._id)}
                        disabled={isApproving}
                        sx={{ fontWeight: 700 }}
                    >
                        Re-Approve
                    </Button>
                </Stack>
            )
        }
    ], [navigate, handleApprove, isApproving, theme]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Rejection Archive</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Rejected Notes</Typography>
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
                <TextField
                    fullWidth
                    placeholder="Filter archive..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                />
            </Paper>

            <DataTable
                columns={columns}
                data={notes?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                noDataMessage="No rejected study notes found"
                noDataIcon={CancelOutlinedIcon}
            />

            <ConfirmationModal
                open={modalConfig.open}
                onClose={() => setModalConfig(prev => ({ ...prev, open: false }))}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                isLoading={isApproving}
            />
        </Box>
    );
};

export default RejectedNotes;

