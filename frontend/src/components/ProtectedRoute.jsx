import { Navigate } from "react-router-dom";

import Loader from "./Loader.jsx";
import { useAuth } from "../services/auth.jsx";

export default function ProtectedRoute({
  children,
  roles,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}