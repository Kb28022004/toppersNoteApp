import React, { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// Layouts and Pages
import SuperAdminDashboard from "../dashboard/SuperAdminDashboard";
const Dashboard = lazy(() => import("../pages/superAdmin/Dashboard"));
const SendOtp = lazy(() => import("../pages/superAdmin/SendOtp"));
const Login = lazy(() => import("../pages/superAdmin/Login"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const VerifyOTP = lazy(() => import("../pages/superAdmin/VerifyOTP"));
const ProfileSetup = lazy(() => import("../pages/superAdmin/ProfileSetup"));
const PendingToppers = lazy(() => import("../pages/superAdmin/Toppers/PendingToppers"));
const ApprovedToppers = lazy(() => import("../pages/superAdmin/Toppers/ApprovedToppers"));
const RejectedToppers = lazy(() => import("../pages/superAdmin/Toppers/RejectedToppers"));
const PendingNotes = lazy(() => import("../pages/superAdmin/Notes/PendingNotes"));
const ApprovedNotes = lazy(() => import("../pages/superAdmin/Notes/ApprovedNotes"));
const RejectedNotes = lazy(() => import("../pages/superAdmin/Notes/RejectedNotes"));
const ReviewNote = lazy(() => import("../pages/superAdmin/Notes/ReviewNote"));
const PayoutManagement = lazy(() => import("../pages/superAdmin/Payouts/PayoutManagement"));

import {
  GuestOnly,
  RequireAuth,
} from "./ProtectedRoute";

const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: "#14171d" }}>
    <CircularProgress />
  </Box>
);

const AppRoute = () => {
  const routes = [
    {
      path: "/",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage />
        </Suspense>
      )
    },
    {
      path: "/login",
      element: (
        <GuestOnly>
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        </GuestOnly>
      ),
    },
    {
      path: "/send-otp",
      element: (
        <GuestOnly>
          <Suspense fallback={<LoadingFallback />}>
            <SendOtp />
          </Suspense>
        </GuestOnly>
      ),
    },
    {
      path: "/verify-otp",
      element: (
        <GuestOnly>
          <Suspense fallback={<LoadingFallback />}>
            <VerifyOTP />
          </Suspense>
        </GuestOnly>
      ),
    },

    {
      path: "/setup-profile",
      element: (
        <RequireAuth >
          <Suspense fallback={<LoadingFallback />}>
            <ProfileSetup />
          </Suspense>
        </RequireAuth>
      ),
    },
    // Super Admin Routes
    {
      path: "/superAdmin",
      element: (
        <RequireAuth>
          <SuperAdminDashboard />
        </RequireAuth>
      ),
      children: [
        {
          path: "",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          path: "toppers/pending",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PendingToppers />
            </Suspense>
          )
        },
        {
          path: "toppers/approved",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ApprovedToppers />
            </Suspense>
          )
        },
        {
          path: "toppers/rejected",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <RejectedToppers />
            </Suspense>
          )
        },
        {
          path: "notes/pending",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PendingNotes />
            </Suspense>
          )
        },
        {
          path: "notes/approved",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ApprovedNotes />
            </Suspense>
          )
        },
        {
          path: "notes/rejected",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <RejectedNotes />
            </Suspense>
          )
        },
        {
          path: "notes/review/:id",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ReviewNote />
            </Suspense>
          )
        },
        {
          path: "payouts",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PayoutManagement />
            </Suspense>
          )
        },
      ],
    },
  ];

  return useRoutes(routes);
};

export default AppRoute;
