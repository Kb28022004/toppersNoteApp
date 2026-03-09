import React from 'react';
import { Chip, alpha } from '@mui/material';

const StatusChip = ({ status }) => {
    const getStatusColor = (s) => {
        switch (s?.toUpperCase()) {
            case 'APPROVED':
            case 'SUCCESS':
            case 'COMPLETED':
                return '#10b981'; // Emerald
            case 'PENDING':
            case 'UNDER_REVIEW':
            case 'IN_PROGRESS':
                return '#f59e0b'; // Amber
            case 'REJECTED':
            case 'FAILED':
            case 'CANCELLED':
                return '#ef4444'; // Rose
            default:
                return '#64748b'; // Slate
        }
    };

    const color = getStatusColor(status);

    return (
        <Chip
            label={status?.replace('_', ' ')}
            size="small"
            sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 1.5,
                border: `1px solid ${alpha(color, 0.2)}`
            }}
        />
    );
};

export default StatusChip;
