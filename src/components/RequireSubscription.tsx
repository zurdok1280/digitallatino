import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export const RequireSubscription = () => {
  const { user, token } = useAuth();


  //case 1: guest without token
  if (!token) {
    return <Outlet />;
  }

  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Verificando suscripción...</p>
        </div>
      </div>
    );
  }

  //case 2: User login but pending payment
  if (user.role === 'PENDING_PAYMENT') {
    return <Navigate to="/payment" replace />;
  }

  //user premium or artist
  return <Outlet />;
};