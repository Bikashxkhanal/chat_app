import { type JSX } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import "./App.css";
import Login from "./components/auth/login";
import PreSignup from "./components/auth/presignup";
import Signup from "./components/auth/signup";
import type { PreSignupState } from "./types/auth.types";
import DashboardPage from "./page/dashboard";
import SettingsPage from "./page/settings";
import { AuthProvider } from "./context/authContext";
import { ThemeProvider } from "./context/themeContext";
import { LocalStorage } from "./utils";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = LocalStorage.get("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RootLayout(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  );
}

function LoginRoute(): JSX.Element {
  const navigate = useNavigate();
  const token = LocalStorage.get("accessToken");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Login
      onSuccess={() => navigate("/dashboard")}
      onSignupClick={() => navigate("/signup")}
    />
  );
}

function PreSignupRoute(): JSX.Element {
  const navigate = useNavigate();
  return (
    <PreSignup
      onVerified={(state: PreSignupState) => {
        navigate("/signup/create-password", { state });
      }}
      onLoginClick={() => navigate("/login")}
    />
  );
}

function SignupRoute(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PreSignupState | null;

  if (!state) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <Signup preSignupState={state} onSuccess={() => navigate("/login")} />
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/login",
        element: <LoginRoute />,
      },
      {
        path: "/signup",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <PreSignupRoute />,
          },
          {
            path: "create-password",
            element: <SignupRoute />,
          },
        ],
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);

function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
