import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export const RequireSubscription = () => {
  const { user, token } = useAuth();


  //case 1: guest without token
  if (!token) {
    return <Outlet />;
  }

  
  if (!user) {
     return null; 
  }

  //case 2: User login but pending payment
  if (user.role === 'PENDING_PAYMENT') {
    return <Navigate to="/payment" replace />;
  }

  //user premium 
  return <Outlet />;
};