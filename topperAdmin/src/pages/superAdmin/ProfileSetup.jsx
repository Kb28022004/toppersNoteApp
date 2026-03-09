import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    TextField,
    Typography,
    Avatar,
    Paper,
    IconButton,
    CircularProgress,
    Container,
    alpha,
    useTheme,
    Stack
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateProfileMutation } from "../../feature/api/adminApi";

const validationSchema = Yup.object({
    fullName: Yup.string().min(2, "Name must be at least 2 characters").required("Full Name is required"),
    bio: Yup.string().max(500, "Bio must be at most 500 characters"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
});

const ProfileSetup = () => {
    const theme = useTheme();
    const [createProfile, { isLoading }] = useCreateProfileMutation();
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);

    const formik = useFormik({
        initialValues: {
            fullName: "",
            bio: "",
            department: "",
            designation: "",
            profilePhoto: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("fullName", values.fullName);
            formData.append("bio", values.bio);
            formData.append("department", values.department);
            formData.append("designation", values.designation);
            if (values.profilePhoto) {
                formData.append("profilePhoto", values.profilePhoto);
            }

            try {
                const response = await createProfile({ formData, token: localStorage.getItem("authToken") }).unwrap();
                toast.success(response.message || "Profile created successfully!");
                navigate("/superAdmin");
            } catch (error) {
                toast.error(error?.data?.message || "Failed to create profile");
            }
        },
    });

    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profilePhoto", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: "blur(20px)",
                    }}
                >
                    <Box sx={{ mb: 5, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Onboarding
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mb: 1.5 }}>
                            Initialize Profile
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300, mx: 'auto' }}>
                            Configure your administrative credentials and identity for the TopperApp ecosystem.
                        </Typography>
                    </Box>

                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5 }}>
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    src={preview}
                                    alt="Profile Preview"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: "4px solid",
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                />
                                <IconButton
                                    color="primary"
                                    aria-label="upload picture"
                                    component="label"
                                    sx={{
                                        position: "absolute",
                                        bottom: -4,
                                        right: -4,
                                        bgcolor: "primary.main",
                                        color: 'white',
                                        boxShadow: 4,
                                        "&:hover": { bgcolor: "primary.dark" },
                                    }}
                                >
                                    <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                                    <PhotoCamera sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Box>
                        </Box>

                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                id="fullName"
                                name="fullName"
                                label="Full Legal Name"
                                variant="outlined"
                                value={formik.values.fullName}
                                onChange={formik.handleChange}
                                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                helperText={formik.touched.fullName && formik.errors.fullName}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    fullWidth
                                    id="department"
                                    name="department"
                                    label="Org Department"
                                    variant="outlined"
                                    value={formik.values.department}
                                    onChange={formik.handleChange}
                                    error={formik.touched.department && Boolean(formik.errors.department)}
                                    helperText={formik.touched.department && formik.errors.department}
                                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    id="designation"
                                    name="designation"
                                    label="Administrative Rank"
                                    variant="outlined"
                                    value={formik.values.designation}
                                    onChange={formik.handleChange}
                                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                                    helperText={formik.touched.designation && formik.errors.designation}
                                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                                />
                            </Stack>

                            <TextField
                                fullWidth
                                id="bio"
                                name="bio"
                                label="Professional Biography"
                                multiline
                                rows={3}
                                variant="outlined"
                                value={formik.values.bio}
                                onChange={formik.handleChange}
                                error={formik.touched.bio && Boolean(formik.errors.bio)}
                                helperText={formik.touched.bio && formik.errors.bio}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            />

                            <Button
                                color="primary"
                                variant="contained"
                                fullWidth
                                type="submit"
                                size="large"
                                disabled={isLoading}
                                sx={{
                                    mt: 2,
                                    py: 1.8,
                                    borderRadius: 3,
                                    fontWeight: 800,
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    boxShadow: theme.shadows[8],
                                }}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Complete Activation"}
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default ProfileSetup;

