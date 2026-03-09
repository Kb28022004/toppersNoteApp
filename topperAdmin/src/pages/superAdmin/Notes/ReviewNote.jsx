import React, { useMemo, useState, useRef } from "react";
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
    Avatar,
    Tooltip
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import toast from "react-hot-toast";
import ConfirmationModal from "../../../components/ConfirmationModal";

const ReviewNote = () => {
    const { id } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const token = useMemo(() => localStorage.getItem("authToken"), []);
    const { data: noteData, isLoading, error } = usePreviewNoteQuery({ id, token }, { skip: !id || !token });

    const [approveNote, { isLoading: isApproving }] = useApproveNoteMutation();
    const [rejectNote, { isLoading: isRejecting }] = useRejectNoteMutation();
    const [zoom, setZoom] = useState(1);

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

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -600 : 600;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
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
                <CircularProgress thickness={5} size={60} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    if (error || !noteData?.data) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Paper sx={{ p: 6, borderRadius: 6, maxWidth: 500, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.1)}` }}>
                    <CancelOutlinedIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Resource Unavailable</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>The requested note content could not be found or loaded. It might have been deleted or moved.</Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ borderRadius: 3, px: 4 }}
                    >
                        Return to Pipeline
                    </Button>
                </Paper>
            </Box>
        );
    }

    const note = noteData.data;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: alpha(theme.palette.background.default, 0.4) }}>
            {/* Header Area */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: theme.shadows[2],
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.5 }}>ADMINISTRATION • CONTENT REVIEW</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>Verify Submission</Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="soft"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={handleReject}
                        sx={{ px: 3, py: 1.2, borderRadius: 3, fontWeight: 700 }}
                    >
                        Reject Note
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={handleApprove}
                        sx={{ px: 4, py: 1.2, borderRadius: 3, fontWeight: 800, boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}` }}
                    >
                        Approve & Publish
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={4}>
                {/* Meta Panel - Glassmorphism style */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 6,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            bgcolor: alpha(theme.palette.background.paper, 0.7),
                            backdropFilter: 'blur(10px)',
                            position: { lg: 'sticky' },
                            top: 24,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                            width:"75vw"
                        }}
                    >
                        <Stack spacing={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                <Avatar sx={{
                                    bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    width: 72, height: 72, borderRadius: 4,
                                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                                }}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.5 }}>{note.chapterName || note.title}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip label={note.subject} size="small" sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', height: 24 }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>#{note._id?.slice(-8).toUpperCase()}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.3) }} />

                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block' }}>Academic Stream</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>Class {note.class}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block' }}>Board</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>{note.board}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block' }}>Market Valuation</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main' }}>₹{note.price}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block' }}>Volume</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800 }}>{note.pageCount} Pages</Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ borderStyle: 'solid', borderColor: alpha(theme.palette.divider, 0.1) }} />

                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1.5 }}>Submitting Author</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.divider, 0.05) }}>
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', fontWeight: 800 }}>{note.topperId?.firstName?.charAt(0)}</Avatar>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 800 }}>{note.topperId?.firstName} {note.topperId?.lastName || ''}</Typography>
                                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>VERIFIED TOPPER</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 4, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                    <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 22, mt: 0.3 }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.5 }}>
                                        Examine visual clarity, content accuracy, and academic relevance before final authorization.
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Preview Panel - Horizontal Scroll Redesign */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 6,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            bgcolor: 'background.paper',
                            overflow: 'hidden',
                            height: 'auto',
                            minHeight: 700,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                        }}
                    >
                        {/* Viewer Toolbar */}
                        <Box sx={{
                            px: 3,
                            py: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            zIndex: 10
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Document Viewer
                                    <Chip label={`${note.previewImages?.length || 0} Pages`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconButton onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} size="small" title="Zoom Out">
                                    <ZoomOutIcon />
                                </IconButton>
                                <Typography variant="caption" sx={{ fontWeight: 800, width: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Typography>
                                <IconButton onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} size="small" title="Zoom In">
                                    <ZoomInIcon />
                                </IconButton>
                                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, my: 'auto' }} />
                                <IconButton size="small" title="Fullscreen">
                                    <FullscreenIcon />
                                </IconButton>
                                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, my: 'auto' }} />
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        onClick={() => handleScroll('left')}
                                        sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleScroll('right')}
                                        sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Box>

                        {/* Horizontal Scroll Container */}
                        <Box
                            ref={scrollContainerRef}
                            sx={{
                                flexGrow: 1,
                                overflowX: "auto",
                                overflowY: "hidden",
                                whiteSpace: "nowrap",
                                p: 6,
                                bgcolor: alpha(theme.palette.divider, 0.04),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                scrollSnapType: 'x mandatory',
                                scrollBehavior: 'smooth',
                                "&::-webkit-scrollbar": { height: 10 },
                                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                                "&::-webkit-scrollbar-thumb": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    borderRadius: 10,
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.4) }
                                }
                            }}
                        >
                            {note.previewImages && note.previewImages.length > 0 ? (
                                note.previewImages.map((url, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'inline-block',
                                            flexShrink: 0,
                                            width: `${85 * zoom}%`,
                                            maxWidth: 800 * zoom,
                                            position: "relative",
                                            scrollSnapAlign: 'center',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'scale(1.02)' }
                                        }}
                                    >
                                        {/* Page Indicator Tag */}
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: -30,
                                                left: 0,
                                                bgcolor: 'background.paper',
                                                color: "text.primary",
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '8px 8px 0 0',
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                borderBottom: 'none',
                                                boxShadow: '0 -4px 8px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            PAGE {index + 1}
                                        </Box>

                                        <Paper
                                            elevation={24}
                                            sx={{
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                bgcolor: 'white',
                                                display: 'flex'
                                            }}
                                        >
                                            <img
                                                src={url}
                                                alt={`Preview Page ${index + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "auto",
                                                    display: 'block'
                                                }}
                                            />
                                        </Paper>
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ width: '100%', py: 20, textAlign: "center", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 100, color: alpha(theme.palette.text.disabled, 0.2), mb: 3 }} />
                                    <Typography variant="h5" sx={{ color: 'text.disabled', fontWeight: 800 }}>No Visual Assets</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>The document preview could not be generated.</Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Footer / Progress */}
                        <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`, bgcolor: 'background.paper' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                                SCROLL HORIZONTALLY TO BROWSE PAGES
                            </Typography>
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

