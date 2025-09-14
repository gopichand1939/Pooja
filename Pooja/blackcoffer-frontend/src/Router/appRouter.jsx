// src/Router/appRouter.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../Pages/Login";
import ForgotPassword from "../Pages/ForgotPassword";
import ErrorPage from "../Pages/ErrorPage";
import MainLayout from "../Components/Layout/MainLayout";
import DashboardPage from "../Pages/DashboardPage";
import DataExplorer from "../Pages/DataExplorer";
import Insights from "../Pages/Insights";
import Events from "../Pages/Events";
import SettingsPage from "../Pages/Settings";
import ProfilePage from "../Pages/Profile"; // make this file (below)
import ProtectRoute from "../Router/ProtectRoute";

const appRouter = createBrowserRouter([
  { path: "/", element: <Login />, errorElement: <ErrorPage /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },

  {
    path: "/body",
    element: (
      <ProtectRoute>
        <MainLayout />
      </ProtectRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "explorer", element: <DataExplorer /> },
      { path: "insights", element: <Insights /> },
      { path: "events", element: <Events /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  { path: "*", element: <ErrorPage /> },
]);

export default appRouter;
