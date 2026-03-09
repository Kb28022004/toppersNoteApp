import React from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Reusable FilterBar component for Admin Dashboards
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback for filter changes
 * @param {String} props.search - Current search value
 * @param {Function} props.onSearchChange - Callback for search input
 * @param {Array} props.fields - Array of field definitions 
 *    e.g. [{ name: 'expertiseClass', label: 'Class', type: 'select', options: [...] }, { name: 'subject', label: 'Subject', type: 'text' }]
 * @param {String} props.searchPlaceholder - Placeholder for search bar
 */
const FilterBar = ({
    filters,
    onFilterChange,
    search,
    onSearchChange,
    fields = [],
    searchPlaceholder = "Search records...",
    sx = {}
}) => {
    return (
        <Grid container spacing={2} sx={{ mb: 4, ...sx }}>
            {/* Search Bar (Usually occupied 1/3 of the width) */}
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    placeholder={searchPlaceholder}
                    size="small"
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />,
                    }}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 , width:"350px"}}
                />
            </Grid>

            {/* Dynamic Filter Fields */}
            {fields.map((field) => (
                <Grid item xs={6} md={field.width || 2} key={field.name}>
                    {field.type === 'select' ? (
                        <FormControl fullWidth size="small">
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                                name={field.name}
                                value={filters[field.name] || ''}
                                label={field.label}
                                onChange={onFilterChange}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2,width:"200px" }}
                            >
                                <MenuItem value="">{`All ${field.label}s`}</MenuItem>
                                {field.options.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <TextField
                            fullWidth
                            name={field.name}
                            label={field.label}
                            size="small"
                            value={filters[field.name] || ''}
                            onChange={onFilterChange}
                            sx={{ bgcolor: 'background.paper', borderRadius: 2,width:"200px" }}
                        />
                    )}
                </Grid>
            ))}
        </Grid>
    );
};

export default FilterBar;
