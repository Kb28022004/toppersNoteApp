import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Stack,
    CircularProgress,
    Divider,
    IconButton,
    Chip,
    alpha,
    useTheme,
    Avatar
} from "@mui/material";
import {
    usePreviewNoteQuery,
    useApproveNoteMutation,
    useRejectNoteMutation
} from "../../../feature/api/adminApi";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import toast from "react-hot-toast";
import ConfirmationModal from "../../../components/ConfirmationModal";

const ReviewNote = () => {
    const { id } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("authToken"), []);
    const { data: noteData, isLoading, error } = usePreviewNoteQuery({ id, token }, { skip: !id || !token });

    const [approveNote, { isLoading: isApproving }] = useApproveNoteMutation();
    const [rejectNote, { isLoading: isRejecting }] = useRejectNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        type: '',
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const handleApprove = () => {
        setModalConfig({
            open: true,
            type: 'approve',
            title: 'Authorize Content',
            message: 'Are you sure you want to approve this note? It will be immediately visible and purchasable for all students.',
            confirmText: 'Approve & Publish',
            confirmColor: 'primary',
            showReasonField: false
        });
    };

    const handleReject = () => {
        setModalConfig({
            open: true,
            type: 'reject',
            title: 'Decline Content',
            message: 'Please provide a constructive reason for rejecting this note so the topper can improve it.',
            confirmText: 'Reject Note',
            confirmColor: 'error',
            showReasonField: true
        });
    };

    const handleConfirmAction = async (reason) => {
        try {
            if (modalConfig.type === 'approve') {
                await approveNote({ id, token }).unwrap();
                toast.success("Note approved and published");
            } else {
                await rejectNote({ id, reason, token }).unwrap();
                toast.success("Note rejected successfully");
            }
            setModalConfig(prev => ({ ...prev, open: false }));
            navigate("/superAdmin/notes/pending");
        } catch (err) {
            toast.error(err?.data?.message || "Action failed");
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, minHeight: "80vh", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !noteData?.data) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 4 }}
                >
                    Return to Pipeline
                </Button>
                <Typography variant="h5" color="error">Resource Unavailable</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>The requested note content could not be found or loaded.</Typography>
            </Box>
        );
    }

    const note = noteData.data;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.05),
                        '&:hover': { bgcolor: alpha(theme.palette.divider, 0.1) }
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Content Verification</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Review Document</Typography>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Meta Panel */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            position: { lg: 'sticky' },
                            top: 24
                        }}
                    >
                        <Stack spacing={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 56, height: 56, borderRadius: 3 }}>
                                    <DescriptionOutlinedIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{note.chapterName || note.title}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>ID: {note._id?.slice(-8)}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Subject Area</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{note.subject}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Classification</Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                        <Chip label={`Class ${note.class}`} size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }} />
                                        <Chip label={note.board} size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }} />
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Pricing Structure</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{note.price}</Typography>
                                </Box>

                                <Stack direction="row" spacing={3}>
                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>Total Extent</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{note.pageCount} Pages</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>Author</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{note.topperId?.firstName || "Topper"}</Typography>
                                    </Box>
                                </Stack>
                            </Stack>

                            <Stack spacing={2} sx={{ pt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<CheckCircleOutlineIcon />}
                                    onClick={handleApprove}
                                    disabled={isApproving || isRejecting}
                                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, boxShadow: theme.shadows[4] }}
                                >
                                    Authorize & Publish
                                </Button>
                                <Button
                                    fullWidth
                                    variant="soft"
                                    color="error"
                                    size="large"
                                    startIcon={<CancelOutlinedIcon />}
                                    onClick={handleReject}
                                    disabled={isApproving || isRejecting}
                                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}
                                >
                                    Reject Submission
                                </Button>
                            </Stack>

                            <Box sx={{ display: 'flex', gap: 1.5, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}` }}>
                                <InfoOutlinedIcon sx={{ color: 'warning.main', fontSize: 20, mt: 0.2 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Review these notes carefully. Once published, they will be live on the student marketplace immediately.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Preview Panel */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            bgcolor: 'background.paper',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{
                            p: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            zIndex: 2
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Document Preview</Typography>
                            <Chip
                                label={`${note.previewImages?.length || 0} Pages Loaded`}
                                size="small"
                                sx={{ fontWeight: 700, borderRadius: 1 }}
                            />
                        </Box>

                        <Box sx={{
                            flexGrow: 1,
                            overflowY: "auto",
                            p: 3,
                            bgcolor: alpha(theme.palette.divider, 0.02),
                            "&::-webkit-scrollbar": { width: 8 },
                            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                            "&::-webkit-scrollbar-thumb": { bgcolor: alpha(theme.palette.text.primary, 0.1), borderRadius: 10 }
                        }}>
                            <Stack spacing={4} alignItems="center">
                                {note.previewImages && note.previewImages.length > 0 ? (
                                    note.previewImages.map((url, index) => (
                                        <Box key={index} sx={{ width: "100%", maxWidth: 800, position: "relative", boxShadow: theme.shadows[10] }}>
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16,
                                                    bgcolor: alpha("#000", 0.7),
                                                    backdropFilter: 'blur(4px)',
                                                    color: "white",
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1.5,
                                                    zIndex: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            >
                                                Page {index + 1} of {note.previewImages.length}
                                            </Box>
                                            <img
                                                src={url}
                                                alt={`Preview Page ${index + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "auto",
                                                    display: 'block',
                                                    borderRadius: 8
                                                }}
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ py: 12, textAlign: "center", opacity: 0.5 }}>
                                        <DescriptionOutlinedIcon sx={{ fontSize: 80, mb: 2 }} />
                                        <Typography variant="h6">No Visual Assets Available</Typography>
                                        <Typography variant="caption">The document preview could not be generated for this submission.</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

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

export default ReviewNote;

