import React, { memo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Box,
    Typography,
    LinearProgress,
    alpha,
    useTheme
} from '@mui/material';

const DataTable = ({
    columns,
    data,
    isLoading,
    isFetching,
    pagination,
    onPageChange,
    onRowsPerPageChange,
    noDataMessage = "No data found",
    noDataIcon: NoDataIcon,
    sx = {}
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%', ...sx }}>
            {isFetching && !isLoading && (
                <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />
            )}

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    overflow: 'hidden'
                }}
            >
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.05) }}>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    sx={{
                                        fontWeight: 800,
                                        color: 'text.secondary',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        py: 2,
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ py: 12, textAlign: 'center' }}>
                                    <LinearProgress sx={{ width: '240px', mx: 'auto', mb: 2, borderRadius: 1 }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        Fetching system records...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : !data || data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ py: 12, textAlign: 'center' }}>
                                    <Box sx={{ opacity: 0.15, mb: 1.5 }}>
                                        {NoDataIcon && <NoDataIcon sx={{ fontSize: 48 }} />}
                                    </Box>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {noDataMessage}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => (
                                <TableRow
                                    key={row._id || index}
                                    hover
                                    sx={{
                                        "&:last-child td": { border: 0 },
                                        "& td": {
                                            py: 2.5,
                                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                                            color: 'text.primary',
                                            fontSize: '0.875rem'
                                        },
                                        "&:hover": {
                                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                                        }
                                    }}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            {column.render ? column.render(row) : (row[column.id] || '—')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && (
                <Box sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 1,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.05)
                }}>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={pagination.total || 0}
                        rowsPerPage={pagination.limit || 10}
                        page={(pagination.page || 1) - 1}
                        onPageChange={(e, newPage) => onPageChange(newPage + 1)}
                        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                        sx={{
                            color: "text.secondary",
                            border: 'none',
                            ".MuiTablePagination-selectIcon": { color: "text.secondary" },
                            ".MuiTablePagination-actions": { color: "text.secondary" }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default memo(DataTable);

