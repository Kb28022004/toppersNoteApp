import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    alpha,
    useTheme,
    Divider,
    Stack,
    Button
} from '@mui/material';
import {
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    TrendingUp as TrendingUpIcon,
    Download as DownloadIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { useGetDashboardDataQuery } from '../../feature/api/adminApi';

const data01 = [
    { name: 'Class 10', value: 400 },
    { name: 'Class 12', value: 300 },
    { name: 'JEE', value: 300 },
    { name: 'NEET', value: 200 },
];

const data02 = [
    { name: 'Maths', sales: 4000, revenue: 2400 },
    { name: 'Physics', sales: 3000, revenue: 1398 },
    { name: 'Chemistry', sales: 2000, revenue: 9800 },
    { name: 'Biology', sales: 2780, revenue: 3908 },
    { name: 'English', sales: 1890, revenue: 4800 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
    const theme = useTheme();
    const token = localStorage.getItem("authToken");
    const { data: dashData, isLoading } = useGetDashboardDataQuery({ token });

    const noteDistributionData = dashData?.data?.charts?.noteDistribution || [];
    const topSubjectsData = dashData?.data?.charts?.topSubjects || [];

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 900, letterSpacing: 1.5 }}>
                        ADMIN • ANALYTICS
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900 }}>System Reports</Typography>
                </Box>
                <Button variant="soft" startIcon={<DownloadIcon />} sx={{ borderRadius: 3 }}>
                    Download Full PDF
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* 1. Category Distribution (Pie) */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Notes by Grade</Typography>
                        <Box sx={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={noteDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {noteDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* 2. Top Subjects (Bar) */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Top Performing Subjects</Typography>
                        <Box sx={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <BarChart data={topSubjectsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.1)} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" name="Note Count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* 3. Growth Timeline (Live data placeholder for now) */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Acquisition Growth</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Students</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Toppers</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer>
                                <LineChart data={[
                                    { name: 'Jan', students: 400, toppers: 240 },
                                    { name: 'Feb', students: 300, toppers: 139 },
                                    { name: 'Mar', students: 600, toppers: 580 },
                                    { name: 'Apr', students: 800, toppers: 390 },
                                    { name: 'May', students: 1100, toppers: 480 },
                                    { name: 'Jun', students: 1400, toppers: 780 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.1)} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="students" stroke={theme.palette.primary.main} strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="toppers" stroke={theme.palette.secondary.main} strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Reports;
