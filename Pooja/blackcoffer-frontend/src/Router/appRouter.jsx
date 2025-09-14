// src/Router/appRouter.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../Pages/Login";
import ForgotPassword from "../Pages/ForgotPassword";
import ErrorPage from "../Pages/ErrorPage";
import MainLayout from "../Components/Layout/MainLayout";
import DashboardPage from "../Pages/DashboardPage";
// add the data explorer import (create this page if missing)
import DataExplorer from "../Pages/DataExplorer";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },
  {
    path: "/body",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "explorer", element: <DataExplorer /> }, // <-- new route for /body/explorer
      // add other child routes here
    ],
  },
  // optional global fallback
  { path: "*", element: <ErrorPage /> },
]);

export default appRouter;
