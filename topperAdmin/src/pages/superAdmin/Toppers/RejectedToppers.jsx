import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    TextField,
    IconButton,
    Tooltip,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    alpha,
    useTheme,
    Grid
} from "@mui/material";
import { useGetPendingToppersQuery } from "../../../feature/api/adminApi";
import DataTable from "../../../components/DataTable";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import StatusChip from "../../../components/common/StatusChip";

const RejectedToppers = () => {
    const theme = useTheme();
    const token = useMemo(() => localStorage.getItem("authToken"), []);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        expertiseClass: "",
        stream: "",
        board: ""
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching, refetch } = useGetPendingToppersQuery({
        token,
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        ...filters,
        status: "REJECTED"
    }, { skip: !token });

    const columns = useMemo(() => [
        {
            id: 'name',
            label: 'Topper Detail',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontWeight: 700 }}>
                        {row.firstName?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.firstName} {row.lastName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.userId?.phone || 'No Phone'}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'expertiseClass',
            label: 'Class/Stream',
            render: (row) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Class {row.expertiseClass}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.stream || "General"}</Typography>
                </Box>
            )
        },
        {
            id: 'avg',
            label: 'Performance',
            render: (row) => {
                const avg = row.subjectMarks?.length > 0
                    ? (row.subjectMarks.reduce((a, b) => a + b.marks, 0) / row.subjectMarks.length).toFixed(1)
                    : 0;
                return (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{avg}% Avg</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Across {row.subjectMarks?.length || 0} subjects</Typography>
                    </Box>
                );
            }
        },
        {
            id: 'reason',
            label: 'Rejection Reason',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'text.secondary'
                        }}
                    >
                        {row.adminRemark || "No reason specified"}
                    </Typography>
                    {row.adminRemark && (
                        <Tooltip title={row.adminRemark} arrow>
                            <IconButton size="small">
                                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'info.main' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        },
        {
            id: 'status',
            label: 'Cycle Status',
            render: (row) => <StatusChip status={row.status} />
        }
    ], [theme]);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Rejected Archive</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Declined Applications</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                        Showing {data?.data?.length || 0} out of {data?.pagination?.total || 0} applications.
                    </Typography>
                </Box>
                <IconButton onClick={() => refetch()} sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
                    <RefreshIcon sx={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                </IconButton>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            placeholder="Find by name..."
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Experience Level</InputLabel>
                            <Select
                                name="expertiseClass"
                                value={filters.expertiseClass}
                                label="Experience Level"
                                onChange={handleFilterChange}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            >
                                <MenuItem value="">All Experience</MenuItem>
                                <MenuItem value="10">Class 10</MenuItem>
                                <MenuItem value="12">Class 12</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                pagination={data?.pagination}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                noDataMessage="No rejected applications found"
                noDataIcon={CancelOutlinedIcon}
            />
        </Box>
    );
};

export default RejectedToppers;
