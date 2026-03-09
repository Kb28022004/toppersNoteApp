import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  styled,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";
import topperLogo from "../assets/topperNotsIcon.png";

const drawerWidth = 260;

const Sidebar = ({ openSidebar, setOpenSidebar, dashboardItems }) => {
  const isMobile = useMediaQuery("(max-width:1200px)");
  const { pathname } = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const handleToggleSubMenu = (title) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderNavItem = (item, isSub = false) => {
    const hasSubItems = item.subItems?.length > 0;
    const isOpen = openSubMenus[item.title];
    const isSelected = pathname.includes(item.navigate);

    return (
      <React.Fragment key={item.title}>
        <ListItem
          component={hasSubItems ? "div" : NavLink}
          to={hasSubItems ? undefined : `/superAdmin/${item.navigate}`}
          onClick={hasSubItems ? () => handleToggleSubMenu(item.title) : (isMobile ? () => setOpenSidebar(false) : undefined)}
          sx={{
            py: 1.5,
            px: 3,
            cursor: "pointer",
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            width: 'auto',
            color: isSelected ? "primary.main" : "text.secondary",
            bgcolor: isSelected && !hasSubItems ? "rgba(59, 130, 246, 0.1)" : "transparent",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.03)",
              color: "text.primary",
            },
            transition: "all 0.2s",
            textDecoration: 'none'
          }}
        >
          <ListItemIcon sx={{
            minWidth: 40,
            color: isSelected ? "primary.main" : "inherit"
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title || item.subTitle}
            primaryTypographyProps={{
              variant: "body2",
              fontWeight: isSelected ? 600 : 500,
              fontSize: '0.9rem'
            }}
          />
          {hasSubItems && (isOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>

        {hasSubItems && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              {item.subItems.map((subItem) => {
                const isSubSelected = pathname.includes(subItem.navigate);
                return (
                  <ListItem
                    key={subItem.subTitle}
                    component={NavLink}
                    to={`/superAdmin/${subItem.navigate}`}
                    onClick={isMobile ? () => setOpenSidebar(false) : undefined}
                    sx={{
                      py: 1,
                      px: 3,
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      width: 'auto',
                      color: isSubSelected ? "primary.main" : "text.secondary",
                      bgcolor: isSubSelected ? "rgba(59, 130, 246, 0.1)" : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        color: "text.primary",
                      },
                      textDecoration: 'none'
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 35,
                      color: isSubSelected ? "primary.main" : "inherit"
                    }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', border: '2px solid currentColor' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={subItem.subTitle}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: isSubSelected ? 600 : 500,
                        fontSize: '0.85rem'
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={openSidebar}
      onClose={() => setOpenSidebar(false)}
      sx={{
        width: openSidebar ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          transform: !openSidebar && !isMobile ? `translateX(-${drawerWidth}px)` : 'none',
          transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out",
        },
      }}
    >
      <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src={topperLogo}
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", letterSpacing: -0.5 }}>
            Topper<span style={{ color: '#3b82f6' }}>Notes</span>
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setOpenSidebar(false)}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ px: 2, mb: 2 }}>
        <Typography variant="overline" sx={{ px: 2, color: 'text.disabled', fontWeight: 700, fontSize: '0.7rem' }}>
          MAIN MENU
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {dashboardItems.map((item) => renderNavItem(item))}
      </List>

      <Box sx={{ mt: 'auto', p: 3 }}>
        <Box sx={{
          bgcolor: 'rgba(59, 130, 246, 0.05)',
          p: 2,
          borderRadius: 3,
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Super Admin Access
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
            Logged in as Main Admin. Full system control enabled.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

