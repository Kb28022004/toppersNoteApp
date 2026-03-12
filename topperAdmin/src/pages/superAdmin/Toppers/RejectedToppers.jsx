import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Avatar,
    alpha,
    useTheme
} from "@mui/material";
import { useGetPendingToppersQuery } from "../../../feature/api/adminApi";
import DataTable from "../../../components/DataTable";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import StatusChip from "../../../components/common/StatusChip";
import FilterBar from "../../../components/common/FilterBar";

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

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    }, []);

    const filterFields = [
        {
            name: 'expertiseClass',
            label: 'Experience Level',
            type: 'select',
            width: 4,
            options: [
                { label: 'Class 9', value: '9' },
                { label: 'Class 10', value: '10' },
                { label: 'Class 11', value: '11' },
                { label: 'Class 12', value: '12' }
            ]
        }
    ];

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
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{row.stream || "General"}</Typography>
                    <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {row.coreSubjects?.map((sub, i) => (
                            <Typography key={i} variant="caption" sx={{
                                bgcolor: 'error.main',
                                color: 'white',
                                px: 0.5,
                                borderRadius: 0.5,
                                fontSize: '0.65rem'
                            }}>
                                {sub}
                            </Typography>
                        ))}
                    </Box>
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

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

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

            <FilterBar
                searchPlaceholder="Find by name..."
                search={search}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                fields={filterFields}
            />

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
