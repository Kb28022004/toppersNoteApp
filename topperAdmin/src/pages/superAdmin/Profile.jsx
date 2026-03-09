import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Grid,
    TextField,
    Button,
    Stack,
    Divider,
    IconButton,
    CircularProgress,
    alpha,
    useTheme,
    Container,
    Tooltip,
    Zoom,
    Fade,
} from "@mui/material";
import {
    Edit as EditIcon,
    Save as SaveIcon,
    PhotoCamera,
    Business as BusinessIcon,
    Work as WorkIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Info as InfoIcon,
    VerifiedUser as VerifiedIcon,
    CalendarMonth as CalendarIcon,
    Security as SecurityIcon,
    KeyboardArrowLeft as BackIcon,
} from "@mui/icons-material";
import { useGetProfileQuery, useCreateProfileMutation } from "../../feature/api/adminApi";
import toast from "react-hot-toast";

const ModernProfile = () => {
    const theme = useTheme();
    const token = localStorage.getItem("authToken");
    const { data: profileData, isLoading, isError, refetch } = useGetProfileQuery(token);
    const [updateProfile, { isLoading: isUpdating }] = useCreateProfileMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        department: "",
        designation: "",
    });
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (profileData?.data) {
            const profile = profileData.data;
            setFormData({
                fullName: profile.fullName || "",
                bio: profile.bio || "",
                department: profile.department || "",
                designation: profile.designation || "",
            });
            setPreview(profile.profilePhoto || null);
        }
    }, [profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        const submissionData = new FormData();
        submissionData.append("fullName", formData.fullName);
        submissionData.append("bio", formData.bio);
        submissionData.append("department", formData.department);
        submissionData.append("designation", formData.designation);
        if (selectedFile) {
            submissionData.append("profilePhoto", selectedFile);
        }

        try {
            await updateProfile({ formData: submissionData, token }).unwrap();
            toast.success("Profile updated successfully");
            setIsEditing(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update profile");
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <CircularProgress thickness={5} size={60} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    const adminDetails = profileData?.data || {};

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: alpha(theme.palette.background.default, 0.4),
            position: 'relative',
            overflow: 'hidden',
            pb: 10
        }}>
            {/* Decorative Dynamic Backgrounds */}
            <Box sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                filter: 'blur(50px)',
                zIndex: 0,
         
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                zIndex: 0
            }} />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <Box sx={{ pt: 4, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 2, display: 'block' }}>
                            ADMINISTRATION • IDENTITY
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {isEditing ? (
                            <>
                                <Button
                                    variant="soft"
                                    color="inherit"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset logic here if needed
                                    }}
                                    sx={{ borderRadius: 3, fontWeight: 700 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    sx={{
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        px: 4,
                                        boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                                    }}
                                >
                                    Save Profile
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setIsEditing(true)}
                                sx={{
                                    borderRadius: 3,
                                    fontWeight: 800,
                                    px: 4,
                                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                                }}
                            >
                                Edit Portfolio
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Grid container sx={{display:"flex",flexDirection:"column",gap:2}}>
                    {/* Left Panel: Profile Hero & Quick Stats */}
                    <Grid item xs={12} lg={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 8,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.1),
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                backdropFilter: 'blur(20px)',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.05)'
                            }}
                        >
                            {/* Role Ribbon */}
                            <Box sx={{
                                position: 'absolute',
                                top: 20,
                                right: -30,
                                transform: 'rotate(45deg)',
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 5,
                                py: 0.5,
                                fontSize: '0.65rem',
                                fontWeight: 900,
                                letterSpacing: 1,
                                boxShadow: 3
                            }}>
                                SUPER ADMIN
                            </Box>

                            {/* Hexagonal Avatar Container */}
                            <Box sx={{ position: "relative", mt: 2, mb: 3 }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -10,
                                    left: -10,
                                    right: -10,
                                    bottom: -10,
                                    borderRadius: '40%',
                                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                    animation: isEditing ? 'spin 10s linear infinite' : 'none',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' }
                                    }
                                }} />
                                <Avatar
                                    src={preview}
                                    sx={{
                                        width: 160,
                                        height: 160,
                                        borderRadius: 6,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        border: `4px solid white`,
                                        boxShadow: theme.shadows[10],
                                        transition: 'all 0.4s ease'
                                    }}
                                >
                                    {formData.fullName?.charAt(0) || <PersonIcon sx={{ fontSize: 60 }} />}
                                </Avatar>
                                {isEditing && (
                                    <Zoom in={true}>
                                        <IconButton
                                            component="label"
                                            sx={{
                                                position: "absolute",
                                                bottom: -10,
                                                right: -10,
                                                bgcolor: "primary.main",
                                                color: "white",
                                                "&:hover": { bgcolor: "primary.dark", transform: 'scale(1.1)' },
                                                boxShadow: theme.shadows[4],
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                                            <PhotoCamera />
                                        </IconButton>
                                    </Zoom>
                                )}
                            </Box>

                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, mb: 1 }}>
                                    {formData.fullName || "Main Administrator"}
                                    <Tooltip title="Verified System Admin">
                                        <VerifiedIcon sx={{ ml: 1, color: 'primary.main', fontSize: 24, verticalAlign: 'middle' }} />
                                    </Tooltip>
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    @{adminDetails.department?.toLowerCase().replace(' ', '_') || 'internal_ops'}
                                </Typography>
                            </Box>

                            <Divider sx={{ width: '100%', mb: 4, borderColor: alpha(theme.palette.divider, 0.05) }} />

                            <Stack spacing={3} sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.05)}` }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                        <WorkIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block' }}>DESIGNATION</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{formData.designation || "Senior Moderator"}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.secondary.main, 0.03), border: `1px solid ${alpha(theme.palette.secondary.main, 0.05)}` }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'secondary.main', color: 'white' }}>
                                        <BusinessIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block' }}>DEPARTMENT</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{formData.department || "Educational Governance"}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.03), border: `1px solid ${alpha(theme.palette.success.main, 0.05)}` }}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.main', color: 'white' }}>
                                        <SecurityIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block' }}>ACCESS LEVEL</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>Level 5 (Full Authority)</Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Right Panel: Content Edit & Bio */}
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5,
                                    borderRadius: 8,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.1),
                                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.03)'
                                }}
                            >
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 8, height: 24, bgcolor: 'primary.main', borderRadius: 4 }} />
                                    Professional Dossier
                                </Typography>

                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', ml: 1 }}>OFFICIAL NAME</Typography>
                                            <TextField
                                                fullWidth
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                variant="filled"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{
                                                    "& .MuiFilledInput-root": {
                                                        borderRadius: 4,
                                                        bgcolor: alpha(theme.palette.action.disabledBackground, 0.05),
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                        transition: 'all 0.2s',
                                                        "&.Mui-focused": { bgcolor: 'white', borderColor: 'primary.main', boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` }
                                                    }
                                                }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', ml: 1 }}>SYSTEM ID</Typography>
                                            <TextField
                                                fullWidth
                                                value={`ADM-${adminDetails._id?.slice(-8).toUpperCase() || 'UNSET'}`}
                                                disabled
                                                variant="filled"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ "& .MuiFilledInput-root": { borderRadius: 4, bgcolor: alpha(theme.palette.action.disabledBackground, 0.05) } }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', ml: 1 }}>FUNCTIONAL RANK</Typography>
                                            <TextField
                                                fullWidth
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                variant="filled"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ "& .MuiFilledInput-root": { borderRadius: 4, bgcolor: alpha(theme.palette.action.disabledBackground, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` } }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={1}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', ml: 1 }}>ORG DIVISION</Typography>
                                            <TextField
                                                fullWidth
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                variant="filled"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ "& .MuiFilledInput-root": { borderRadius: 4, bgcolor: alpha(theme.palette.action.disabledBackground, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` } }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack spacing={1}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', ml: 1 }}>PROFESSIONAL BIOGRAPHY</Typography>
                                            <TextField
                                                fullWidth
                                                name="bio"
                                                multiline
                                                rows={4}
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                variant="filled"
                                                placeholder="Detail your administrative focus and background..."
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ "& .MuiFilledInput-root": { borderRadius: 4, bgcolor: alpha(theme.palette.action.disabledBackground, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` } }}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Secondary Information Card */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 4, borderRadius: 6, border: `1px solid ${alpha(theme.palette.divider, 0.05)}`, bgcolor: 'black' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                                                <CalendarIcon />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Account Tenure</Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Registered Since</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>October 24, 2023</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 4, borderRadius: 6, border: `1px solid ${alpha(theme.palette.divider, 0.05)}`, bgcolor: 'black' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                                                <SecurityIcon />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Account Status</Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Current State</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', animation: 'pulse 2s infinite' }} />
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>FULLY ACTIVE</Typography>
                                        </Box>
                                        <style>{`
                                            @keyframes pulse {
                                                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                                                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                                                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
                                            }
                                        `}</style>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Info Banner */}
                            <Fade in={true}>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'flex-start'
                                }}>
                                    <InfoIcon sx={{ color: 'primary.main', mt: 0.3 }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>Compliance Policy</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                                            Administrative profiles must maintain high standards of transparency. Your bio and contact data are visible to other authorized personnel within the organizational hierarchy.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Fade>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ModernProfile;
