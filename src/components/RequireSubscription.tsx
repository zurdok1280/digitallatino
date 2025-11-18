import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const RequireSubscription = () => {
  const { user, token } = useAuth();
  const location = useLocation();

  
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  
  if (!user) {
     return null; 
  }

  // filter. If the user isnt premium, return to payment
  if (user.role === 'PENDING_PAYMENT' || user.role === 'UNVERIFIED') {
    return <Navigate to="/payment" replace />;
  }

 // if the user is premiun, see all
  return <Outlet />;
};