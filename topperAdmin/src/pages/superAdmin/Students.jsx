import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Pagination,
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Button,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Visibility as ViewIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    School as SchoolIcon,
    History as HistoryIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useGetAllStudentsQuery, useToggleUserStatusMutation } from '../../feature/api/adminApi';
import toast from 'react-hot-toast';

const Students = () => {
    const theme = useTheme();
    const token = localStorage.getItem("authToken");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ class_filter: '', board: '' });

    const { data: studentsData, isLoading, refetch } = useGetAllStudentsQuery({
        token,
        page,
        search,
        ...filters
    });

    const [toggleStatus] = useToggleUserStatusMutation();

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleToggleStatus = async (userId) => {
        try {
            const res = await toggleStatus({ token, userId }).unwrap();
            toast.success(res.message);
            refetch();
        } catch (err) {
            toast.error(err.data?.message || "Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, minHeight: '60vh', alignItems: 'center' }}>
                <CircularProgress thickness={5} size={50} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.5 }}>
                        ADMINISTRATION • ECOSYSTEM
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                        Student Directory
                    </Typography>
                </Box>
            </Box>

            {/* Filter Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <TextField
                    placeholder="Search by name..."
                    value={search}
                    onChange={handleSearchChange}
                    size="small"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment>,
                        sx: { borderRadius: 3, bgcolor: 'background.paper' }
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="soft"
                    startIcon={<FilterIcon />}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                    Advanced Filters
                </Button>
            </Paper>

            {/* Students Table */}
            <TableContainer component={Paper} elevation={0} sx={{
                borderRadius: 6,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Academic Info</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Platform Usage</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {studentsData?.data?.map((student) => (
                            <TableRow key={student._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar src={student.profilePhoto} sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                            {student.fullName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{student.fullName}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                ID: {student._id.slice(-8).toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip label={`Class ${student.class}`} size="small" sx={{ fontWeight: 800, height: 20, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                                            <Chip label={student.board} size="small" sx={{ fontWeight: 800, height: 20, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }} />
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            {student.stream || 'General'} • {student.medium || 'English'}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                            TIME SPENT: {Math.round((student.stats?.totalTimeSpent || 0) / 60)} mins
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            SAVED NOTES: {student.savedNotes?.length || 0}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={student.userId?.status || 'ACTIVE'}
                                        size="small"
                                        sx={{
                                            fontWeight: 900,
                                            borderRadius: 2,
                                            height: 24,
                                            bgcolor: student.userId?.status === 'BLOCKED' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                            color: student.userId?.status === 'BLOCKED' ? 'error.main' : 'success.main',
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={student.userId?.status === 'BLOCKED' ? "Unblock Student" : "Block Student"}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggleStatus(student.userId?._id || student._id)}
                                            sx={{
                                                color: student.userId?.status === 'BLOCKED' ? 'success.main' : 'error.main',
                                                bgcolor: student.userId?.status === 'BLOCKED' ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05),
                                                mr: 1
                                            }}
                                        >
                                            {student.userId?.status === 'BLOCKED' ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" sx={{ color: 'text.secondary', bgcolor: alpha(theme.palette.action.selected, 0.05) }}>
                                        <ViewIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={studentsData?.pagination?.pages || 1}
                    page={page}
                    onChange={(e, p) => setPage(p)}
                    color="primary"
                    sx={{
                        '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 700 }
                    }}
                />
            </Box>
        </Box>
    );
};

export default Students;
