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
    Pagination,
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Chip,
    Avatar,
    Tooltip
} from '@mui/material';
import {
    History as HistoryIcon,
    Person as PersonIcon,
    Info as InfoIcon,
    Public as PublicIcon,
    Computer as ComputerIcon
} from '@mui/icons-material';
import { useGetAuditLogsQuery } from '../../feature/api/adminApi';

const AuditLogs = () => {
    const theme = useTheme();
    const token = localStorage.getItem("authToken");
    const [page, setPage] = useState(1);

    const { data: logsData, isLoading } = useGetAuditLogsQuery({
        token,
        page,
        limit: 15
    });

    const getActionColor = (action) => {
        if (action.includes('APPROVE')) return 'success';
        if (action.includes('REJECT') || action.includes('TOGGLE')) return 'error';
        if (action.includes('UPDATE')) return 'warning';
        return 'info';
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.5 }}>
                    ADMINISTRATION • SECURITY
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>Audit Logs</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track all administrative actions performed on the platform.</Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{
                borderRadius: 6,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Admin</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Target</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Details</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Context</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logsData?.data?.map((log) => (
                            <TableRow key={log._id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                            {log.adminId?.fullName?.charAt(0) || 'A'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{log.adminId?.fullName || 'System'}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{log.adminId?.phone || ''}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.action.replace(/_/g, ' ')}
                                        size="small"
                                        color={getActionColor(log.action)}
                                        sx={{ fontWeight: 900, fontSize: '0.65rem', borderRadius: 2 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.targetModel || 'N/A'}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                        {log.targetId ? `#${log.targetId.slice(-6)}` : '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {log.details ? (
                                        <Tooltip title={JSON.stringify(log.details, null, 2)}>
                                            <Chip
                                                icon={<InfoIcon style={{ fontSize: 14 }} />}
                                                label="View Data"
                                                size="small"
                                                variant="outlined"
                                                sx={{ borderRadius: 2 }}
                                            />
                                        </Tooltip>
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PublicIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{log.ipAddress || 'Unknown'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ComputerIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.userAgent || 'Unknown'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {new Date(log.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={logsData?.pagination?.pages || 1}
                    page={page}
                    onChange={(e, p) => setPage(p)}
                    color="primary"
                    sx={{ '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 700 } }}
                />
            </Box>
        </Box>
    );
};

export default AuditLogs;
