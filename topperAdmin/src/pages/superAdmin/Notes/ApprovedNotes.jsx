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
    useTheme,
    Grid
} from "@mui/material";
import {
    useGetPendingNotesQuery,
    useRejectNoteMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/common/StatusChip";

const ApprovedNotes = () => {
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
        { token, status: 'PUBLISHED', search: debouncedSearch },
        { skip: !token }
    );

    const [rejectNote, { isLoading: isRejecting }] = useRejectNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const handleReject = useCallback((id) => {
        setModalConfig({
            open: true,
            id,
            title: 'Unpublish Content',
            message: 'Are you sure you want to take down this note? This will move it back to the rejected state.',
            confirmText: 'Unpublish',
            confirmColor: 'error',
            showReasonField: true
        });
    }, []);

    const handleConfirmAction = useCallback(async (reason) => {
        const { id } = modalConfig;
        try {
            await rejectNote({ id, reason, token }).unwrap();
            toast.success("Note unpublished successfully");
            setModalConfig(prev => ({ ...prev, open: false }));
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to unpublish note");
        }
    }, [modalConfig, rejectNote, token, refetch]);

    const columns = useMemo(() => [
        {
            id: 'title',
            label: 'Resource Summary',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', borderRadius: 2 }}>
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
            label: 'Publisher',
            render: (row) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>{row.topperId?.firstName?.charAt(0)}</Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.topperId?.firstName}</Typography>
                    </Box>
                </Stack>
            )
        },
        {
            id: 'price',
            label: 'Market Price',
            render: (row) => (
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                    {row.price ? `₹${row.price}` : "Free"}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'System Status',
            render: (row) => <StatusChip status="APPROVED" />
        },
        {
            id: 'actions',
            label: 'Management',
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
                        variant="soft" size="small" color="error"
                        onClick={() => handleReject(row._id)}
                        disabled={isRejecting}
                        sx={{ fontWeight: 700 }}
                    >
                        Take Down
                    </Button>
                </Stack>
            )
        }
    ], [navigate, handleReject, isRejecting, theme]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Live Content Library</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Approved Notes</Typography>
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
                    placeholder="Search by title, subject or topper..."
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
                noDataMessage="No published study notes found"
                noDataIcon={CheckCircleOutlineIcon}
            />

            <ConfirmationModal
                open={modalConfig.open}
                onClose={() => setModalConfig(prev => ({ ...prev, open: false }))}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                showReasonField={true}
                isLoading={isRejecting}
            />
        </Box>
    );
};

export default ApprovedNotes;

