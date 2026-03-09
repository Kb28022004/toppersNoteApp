import React from "react";
import { Box, Typography, alpha, useTheme, Divider } from "@mui/material";

const SuperAdminDashboardCart = ({ title, image, number }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 250,
        borderRadius: 4,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(10px)',
        p: 3,
        height: '100%',
        transition: 'all 0.3s ease',
        cursor: 'default',
        "&:hover": {
          transform: 'translateY(-4px)',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`
        }
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mb: 2
        }}
      >
        {title}
      </Typography>

      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img src={image} alt={title} style={{ width: "40px", height: "40px", objectFit: 'contain' }} />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: 'primary.main',
            letterSpacing: -1
          }}
        >
          {number}
        </Typography>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboardCart;
