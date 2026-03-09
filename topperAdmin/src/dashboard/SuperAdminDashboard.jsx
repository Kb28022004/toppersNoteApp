import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  PieChart as PieChartIcon,
  Payment as PayoutIcon,
  PendingActions as PendingIcon,

  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Person as ProfileIcon
} from '@mui/icons-material';

import { Box, useTheme, styled } from "@mui/material";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardMainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const SuperAdminDashboard = () => {
  const [openSidebar, setOpenSidebar] = useState(true);

  const dashboardItems = [
    {
      title: "Dashboard",
      icon: <DashboardIcon />,
      navigate: ".",
    },
    {
      title: "Toppers",
      icon: <PeopleIcon />,
      navigate: "toppers/pending",
      subItems: [
        {
          subTitle: "Pending Requests",
          navigate: "toppers/pending",
          icon: <PendingIcon sx={{ fontSize: '1rem' }} />,
        },
        {
          subTitle: "Approved Toppers",
          navigate: "toppers/approved",
          icon: <ApprovedIcon sx={{ fontSize: '1rem' }} />,
        },
        {
          subTitle: "Rejected Toppers",
          navigate: "toppers/rejected",
          icon: <RejectedIcon sx={{ fontSize: '1rem' }} />,
        },
      ],
    },
    {
      title: "Notes",
      icon: <DescriptionIcon />,
      navigate: "notes/pending",
      subItems: [
        {
          subTitle: "Pending Notes",
          navigate: "notes/pending",
          icon: <PendingIcon sx={{ fontSize: '1rem' }} />,
        },
        {
          subTitle: "Approved Notes",
          navigate: "notes/approved",
          icon: <ApprovedIcon sx={{ fontSize: '1rem' }} />,
        },
        {
          subTitle: "Rejected Notes",
          navigate: "notes/rejected",
          icon: <RejectedIcon sx={{ fontSize: '1rem' }} />,
        },
      ],
    },
    {
      title: "Payouts",
      icon: <PayoutIcon />,
      navigate: "payouts",
    },
    {
      title: "Reports",
      icon: <PieChartIcon />,
      navigate: "reports",
    },
    {
      title: "Profile",
      icon: <ProfileIcon />,
      navigate: "profile",
    },


  ];


  return (
    <DashboardMainContainer>
      <Sidebar dashboardItems={dashboardItems} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <ContentWrapper>
        <Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} content='ADMIN +' />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}
        >
          <Outlet />
        </Box>
      </ContentWrapper>
    </DashboardMainContainer>
  );
};

export default SuperAdminDashboard;