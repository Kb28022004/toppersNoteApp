import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Stack,
    InputAdornment,
    alpha,
    useTheme,
    CircularProgress,
    Alert,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Save as SaveIcon,
    NotificationImportant as BroadcastIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
    Percent as PercentIcon,
    Payment as PayoutIcon,
    Domain as DomainIcon
} from '@mui/icons-material';
import {
    useGetSystemConfigQuery,
    useUpdateSystemConfigMutation,
    useSendBroadcastMutation
} from '../../feature/api/adminApi';
import toast from 'react-hot-toast';

const SystemSettings = () => {
    const theme = useTheme();
    const token = localStorage.getItem("authToken");
    const { data: configData, isLoading: configLoading } = useGetSystemConfigQuery(token);
    const [updateConfig] = useUpdateSystemConfigMutation();
    const [sendBroadcast] = useSendBroadcastMutation();

    const [config, setConfig] = useState({
        platformFeePercentage: 20,
        maintenanceMode: false,
        minWithdrawalAmount: 500,
        contactEmail: 'support@toppernotes.com'
    });

    const [broadcast, setBroadcast] = useState({
        title: '',
        body: '',
        targetRole: 'ALL'
    });

    useEffect(() => {
        if (configData?.data) {
            setConfig(configData.data);
        }
    }, [configData]);

    const handleConfigSave = async () => {
        try {
            await updateConfig({ token, config }).unwrap();
            toast.success("System configuration updated");
        } catch (err) {
            toast.error(err.data?.message || "Failed to update configuration");
        }
    };

    const handleBroadcastSend = async () => {
        if (!broadcast.title || !broadcast.body) {
            return toast.error("Title and message are required");
        }
        try {
            const res = await sendBroadcast({ token, ...broadcast }).unwrap();
            toast.success(res.message);
            setBroadcast({ title: '', body: '', targetRole: 'ALL' });
        } catch (err) {
            toast.error(err.data?.message || "Failed to send broadcast");
        }
    };

    if (configLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.5 }}>
                    ADMINISTRATION • SYSTEM
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>System Settings</Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Side: Configuration */}
                <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Stack spacing={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                    <SettingsIcon />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Platform Governance</Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Platform Fee (%)"
                                        type="number"
                                        fullWidth
                                        value={config.platformFeePercentage}
                                        onChange={(e) => setConfig({ ...config, platformFeePercentage: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PercentIcon fontSize="small" /></InputAdornment>,
                                            sx: { borderRadius: 3 }
                                        }}
                                        helperText="Revenue share taken by the platform"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Min Withdrawal (₹)"
                                        type="number"
                                        fullWidth
                                        value={config.minWithdrawalAmount}
                                        onChange={(e) => setConfig({ ...config, minWithdrawalAmount: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PayoutIcon fontSize="small" /></InputAdornment>,
                                            sx: { borderRadius: 3 }
                                        }}
                                        helperText="Minimum balance required for toppers to cash out"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Support Email"
                                        fullWidth
                                        value={config.contactEmail}
                                        onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                                        InputProps={{
                                            sx: { borderRadius: 3 }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px dashed ${theme.palette.warning.main}` }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={config.maintenanceMode}
                                                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                                                    color="warning"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Maintenance Mode</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Block student access while performing system updates</Typography>
                                                </Box>
                                            }
                                        />
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                                onClick={handleConfigSave}
                            >
                                Save Configuration
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Side: Broadcast */}
                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Stack spacing={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                                    <BroadcastIcon />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Broadcast Message</Typography>
                            </Box>

                            <Alert severity="info" sx={{ borderRadius: 3 }}>
                                This will send a push notification to all users matching the selected role. Use sparingly.
                            </Alert>

                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>Target Audience</InputLabel>
                                <Select
                                    label="Target Audience"
                                    value={broadcast.targetRole}
                                    onChange={(e) => setBroadcast({ ...broadcast, targetRole: e.target.value })}
                                    sx={{ borderRadius: 3 }}
                                >
                                    <MenuItem value="ALL">Everyone (Global)</MenuItem>
                                    <MenuItem value="STUDENT">All Students</MenuItem>
                                    <MenuItem value="TOPPER">All Toppers</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Subject Title"
                                fullWidth
                                placeholder="e.g. New Features Added!"
                                value={broadcast.title}
                                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />

                            <TextField
                                label="Message Body"
                                multiline
                                rows={4}
                                fullWidth
                                placeholder="Write your message here..."
                                value={broadcast.body}
                                onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />

                            <Button
                                variant="soft"
                                color="secondary"
                                sx={{ borderRadius: 3, py: 1.5, fontWeight: 800 }}
                                onClick={handleBroadcastSend}
                            >
                                Send Broadcast Now
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SystemSettings;
