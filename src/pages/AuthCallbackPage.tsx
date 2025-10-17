
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
 
  const { login } = useAuth(); 

  useEffect(() => {
    
    const token = searchParams.get('token');

    if (token) {
     
      login(token);
      
     
      navigate('/payment', { replace: true });

    } else {
      
      navigate('/login?error=auth_failed', { replace: true });
    }
  }, [searchParams, navigate, login]);

  
  return (
      <div className="flex items-center justify-center h-screen">
          <div>Procesando autenticación...</div>
      </div>
  );
};

export default AuthCallbackPage;