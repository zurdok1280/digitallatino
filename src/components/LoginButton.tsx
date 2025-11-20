import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '@/hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

export function LoginButton() {
  const { user, logout, showLoginDialog, setShowLoginDialog } = useAuth();
  //const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSignOut = () => {
    toast.info("Cerrando sesión...");
    setTimeout(async () => {
      await logout();
    }, 500)
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          Hola, {user.name || 'Usuario'}
        </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="text-sm font-bold">{user.name || 'Usuario'}</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/mi-cuenta">
                <User className="mr-2 h-4 w-4" />
                <span>Mi cuenta</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowLoginDialog(true)}
        className="
          relative h-9 px-6 rounded-full 
          bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 
          text-white font-medium text-sm
          border-0 shadow-lg shadow-purple-500/25
          hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105
          active:scale-95
          transition-all duration-300 ease-out
          before:absolute before:inset-0 before:rounded-full 
          before:bg-gradient-to-r before:from-purple-500 before:via-blue-500 before:to-purple-600 
          before:opacity-0 before:transition-opacity before:duration-300
          hover:before:opacity-100
          overflow-hidden
          group
        "
      >
        <span className="relative z-10 flex items-center gap-2">
          <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span className="transition-all duration-300">Login/Sign in</span>
        </span>
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acceso a miembros</DialogTitle>
          </DialogHeader>
          <LoginForm onClose={() => setShowLoginDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}