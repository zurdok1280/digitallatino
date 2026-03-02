import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const RequireAdmin = () => {
  const { user } = useAuth();
  
  // Revisamos si hay un token en el almacenamiento directamente
  const hasToken = localStorage.getItem('authToken');

  // Si no hay 'user' en el estado todavía, PERO sí hay un token guardado,
  // significa que React apenas está cargando los datos. Le pedimos que espere un milisegundo para intentar cargar el usuario desde el token.
  if (!user && hasToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Si ya cargó y definitivamente no hay usuario, o su rol NO es ADMIN, lo devolvemos
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Si todo está en orden y es ADMIN, lo dejamos pasar
  return <Outlet />;
};