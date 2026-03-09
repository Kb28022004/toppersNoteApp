import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    TextField,
    Avatar,
    Chip,
    Button,
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StatusChip from "../../../components/common/StatusChip";

const ApprovedToppers = () => {
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

    const { data, isLoading, isFetching } = useGetPendingToppersQuery({
        token,
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        ...filters,
        status: "APPROVED"
    }, { skip: !token });

    const columns = useMemo(() => [
        {
            id: 'name',
            label: 'Topper Detail',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', fontWeight: 700 }}>
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
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{avg}% Avg</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Across {row.subjectMarks?.length || 0} subjects</Typography>
                    </Box>
                );
            }
        },
        {
            id: 'marksheet',
            label: 'ID Card',
            render: (row) => row.marksheetUrl ? (
                <Button component="a" href={row.marksheetUrl} target="_blank" variant="text" size="small" sx={{ fontWeight: 700 }}>
                    Download ID
                </Button>
            ) : "N/A"
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => <StatusChip status={row.status} />
        }
    ], [theme]);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>Verified Directory</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Approved Toppers</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                    A total of {data?.pagination?.total || 0} toppers are active in the system.
                </Typography>
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                noDataMessage="No approved toppers found"
                noDataIcon={CheckCircleOutlineIcon}
            />
        </Box>
    );
};

export default ApprovedToppers;

