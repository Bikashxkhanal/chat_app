import { type JSX } from "react";
import { createBrowserRouter, RouterProvider, Navigate, useNavigate, useLocation, Outlet } from "react-router-dom";
import "./App.css";
import Login from "./components/auth/login";
import PreSignup from "./components/auth/presignup";
import Signup from "./components/auth/signup";
import type { PreSignupState } from "./types/auth.types";
import Sidebar from "./components/dashboard/sidebar";

function LoginRoute(): JSX.Element {
  const navigate = useNavigate();
  return (
    <Login
      onSuccess={() => {
        // TODO: navigate into the actual app / chat dashboard
        console.log("Logged in!");
      }}
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
  
  // Use React Router's native state tracking instead of window.history
  const state = location.state as PreSignupState | null;

  if (!state) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <Signup
      preSignupState={state}
      onSuccess={() => navigate("/login")}
    />
  );
}

// 1. Create the router configuration with children
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/signup",
    // We wrap signup paths in a simple layout block so they can branch out naturally
    element: <Outlet />, 
    children: [
      {
        index: true, // Handles exactly "/signup"
        element: <PreSignupRoute />,
      },
      {
        path: "create-password", // Handles "/signup/create-password"
        element: <SignupRoute />,
      },
    ],
  },
  { 
    path : '/messages', 
    element : <Sidebar />

  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

// 2. Render using RouterProvider
function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;