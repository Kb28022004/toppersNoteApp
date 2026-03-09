import React, { useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Divider,
    Tab,
    Tabs,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    alpha,
    useTheme,
    LinearProgress,
    styled
} from '@mui/material';
import {
    Description as DescriptionIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Payments as PaymentsIcon,
    TrendingUp as TrendingUpIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as ApprovedIcon,
    RadioButtonUnchecked as PendingIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer
} from 'recharts';
import {
    useGetDashboardDataQuery,
    useGetPendingNotesQuery,
    useGetPendingToppersQuery
} from '../../feature/api/adminApi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const chartData = [
    { name: 'Mon', active: 400, sales: 240 },
    { name: 'Tue', active: 300, sales: 139 },
    { name: 'Wed', active: 200, sales: 980 },
    { name: 'Thu', active: 278, sales: 390 },
    { name: 'Fri', active: 189, sales: 480 },
    { name: 'Sat', active: 239, sales: 380 },
    { name: 'Sun', active: 349, sales: 430 },
];

const StatCard = ({ title, value, icon, color, trend }) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>
                        {value}
                    </Typography>
                    {trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                                {trend}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                vs last month
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Avatar
                    sx={{
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        width: 45,
                        height: 45,
                        borderRadius: 3
                    }}
                >
                    {icon}
                </Avatar>
            </Box>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    bgcolor: alpha(color, 0.2)
                }}
            >
                <Box sx={{ width: '70%', height: '100%', bgcolor: color }} />
            </Box>
        </Paper>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const token = localStorage.getItem("authToken");

    const { data: dashboardData, isLoading: dashLoading } = useGetDashboardDataQuery({ token });
    const { data: pendingNotes } = useGetPendingNotesQuery({ token, status: 'UNDER_REVIEW' });
    const { data: pendingToppers } = useGetPendingToppersQuery({ token, status: 'PENDING' });

    const stats = [
        {
            title: "Total Students",
            value: dashboardData?.data?.totalStudents || 0,
            icon: <PeopleIcon />,
            color: theme.palette.primary.main,
            trend: "+12%"
        },
        {
            title: "Active Toppers",
            value: dashboardData?.data?.totalToppers || 0,
            icon: <SchoolIcon />,
            color: theme.palette.secondary.main,
            trend: "+5%"
        },
        {
            title: "Notes Published",
            value: dashboardData?.data?.totalNotes || 0,
            icon: <DescriptionIcon />,
            color: "#f59e0b",
            trend: "+18%"
        },
        {
            title: "Total Revenue",
            value: `₹${dashboardData?.data?.totalRevenue || 0}`,
            icon: <PaymentsIcon />,
            color: "#ec4899"
        },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {dashLoading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.title}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                {/* User Activity Chart */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1)
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Activity & Engagement</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Student traffic and transaction summaries</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label="Sales" size="small" sx={{ bgcolor: alpha('#ec4899', 0.1), color: '#ec4899', fontWeight: 700 }} />
                                <Chip label="Active" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', fontWeight: 700 }} />
                            </Box>
                        </Box>

                        <Box sx={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.05)} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                    />
                                    <ChartTooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.background.paper,
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="active" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="sales" stroke="#ec4899" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Action Items Sidebar */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Action Required</Typography>

                        <List disablePadding>
                            <SectionHeader>Pending Topper Verifications</SectionHeader>
                            {pendingToppers?.data?.slice(0, 3).map((topper) => (
                                <ListItem key={topper._id} disableGutters sx={{ mb: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary' }}>
                                            <PeopleIcon fontSize="small" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={topper.fullName || "New Applicant"}
                                        secondary={`${topper.phone} • Class ${topper.expertiseClass}`}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    />
                                    <IconButton onClick={() => navigate('/superAdmin/toppers/pending')} size="small">
                                        <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                </ListItem>
                            ))}
                            {(!pendingToppers?.data || pendingToppers?.data?.length === 0) && (
                                <Typography variant="caption" sx={{ color: 'text.disabled', py: 2, display: 'block' }}>
                                    No pending toppers
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <SectionHeader>Notes Under Review</SectionHeader>
                            {pendingNotes?.data?.slice(0, 3).map((note) => (
                                <ListItem key={note._id} disableGutters sx={{ mb: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.main' }}>
                                            <DescriptionIcon fontSize="small" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={note.chapterName || note.title}
                                        secondary={`by ${note.topperId?.firstName || "Topper"}`}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                    />
                                    <IconButton onClick={() => navigate(`/superAdmin/notes/pending`)} size="small">
                                        <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                </ListItem>
                            ))}
                            {(!pendingNotes?.data || pendingNotes?.data?.length === 0) && (
                                <Typography variant="caption" sx={{ color: 'text.disabled', py: 2, display: 'block' }}>
                                    No pending notes
                                </Typography>
                            )}
                        </List>

                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 3, py: 1.5, borderRadius: 3, borderStyle: 'dashed' }}
                            onClick={() => navigate('/superAdmin/toppers/pending')}
                        >
                            View All Tasks
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;

const SectionHeader = styled(Box)(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontSize: '0.7rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
}));

