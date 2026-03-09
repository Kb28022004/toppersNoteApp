import {
  IconButton,
  styled,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Badge,
  alpha
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  PersonOutline as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Header = ({ setOpenSidebar, openSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};

  // ✅ Dynamic Title based on route
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] || "overview";

  const getPageTitle = () => {
    const titles = {
      'dashboard': 'System Overview',
      'pending': 'Pending Verification',
      'approved': 'Approved List',
      'rejected': 'Rejected List',
      'payouts': 'Payout Management',
      'reports': 'Analytics & Reports',
    };

    return titles[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <HeaderContainer>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={() => setOpenSidebar(!openSidebar)}
          sx={{ color: "text.secondary", bgcolor: "rgba(255,255,255,0.03)" }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
          {getPageTitle()}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 3 } }}>
        <Tooltip title="Notifications">
          <IconButton sx={{ color: "text.secondary" }}>
            <Badge badgeContent={4} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <ProfileTile onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar
            sx={{
              width: 35,
              height: 35,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 700
            }}
          >
            {userDetails?.firstName?.charAt(0) || "A"}
          </Avatar>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {userDetails?.firstName || "Admin"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: 'block', mt: -0.5 }}>
              Super Admin
            </Typography>
          </Box>
          <ArrowDownIcon sx={{ color: "text.disabled", fontSize: 20 }} />
        </ProfileTile>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 220,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              borderRadius: 3,
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{userDetails?.fullName || "Administrator"}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{userDetails?.email || "admin@toppernotes.com"}</Typography>
          </Box>
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 0.5 }} />

          <MenuItem component={NavLink} to="/superAdmin/profile" sx={{ py: 1, gap: 1.5 }}>
            <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem>

          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 0.5 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1, gap: 1.5, color: 'error.main', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Logout Information</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </HeaderContainer>
  );
};

export default Header;

const HeaderContainer = styled("header")(({ theme }) => ({
  height: 80,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  backdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 10,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ProfileTile = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "4px 8px 4px 4px",
  borderRadius: 40,
  cursor: "pointer",
  transition: "all 0.2s",
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.primary.main,
  },
}));

