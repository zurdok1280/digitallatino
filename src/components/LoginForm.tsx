import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Sparkles, Music, Phone } from 'lucide-react';
import { PasswordStrength } from './PasswordStrength';
import { useState, useEffect } from 'react';

interface LoginFormProps {
  onClose: () => void;
}

export function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://security.digital-latino.com/api/auth/login', {
        method: 'POST',
        headers: {

          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar sesión.');
      }

      const data = await response.json();
      login(data.token);

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      onClose();
    } catch (error: unknown) {
      let errorMessage = "Ocurrió un error desconocido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://security.digital-latino.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear cuenta');
      }
      const data = await response.json();
      toast({
        title: "¡Cuenta creada!",
        description: data.message,
      });
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setConfirmPassword('');
      onClose();
      toast({
        title: "Verifica tu email",
        description: "¡Revisa tu bandeja de entrada para continuar!",
      });

    }
    catch (error: unknown) {
      let errorMessage = "Ocurrió un error desconocido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error al crear cuenta",
        description: errorMessage,
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };


  const isSignUpDisabled =
    loading ||
    password.length < 10 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password) ||
    password !== confirmPassword;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <img
          src="/lovable-uploads/4e68bccf-80d3-468a-9ffe-3f3aee0bffdd.png"
          alt="Digital Latino"
          className="h-8 mx-auto"
        />
        <p className="text-muted-foreground text-sm mt-2">
          Accede a tu cuenta para gestionar tus campañas musicales
        </p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
          <TabsTrigger
            value="signin"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Iniciar Sesión
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Crear Cuenta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-0">
          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100">
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Iniciando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Iniciar Sesión
                  </div>
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="signup" className="mt-0">
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 border border-blue-100">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signup-firstname" className="text-sm font-medium text-gray-700">
                  Nombre
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nombre"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-lastname" className="text-sm font-medium text-gray-700">
                  Apellidos
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Apellidos"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">
                  Teléfono (Opcional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tu número de teléfono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 h-12 bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <PasswordStrength password_string={password} />
              {/* Error message if passwords do not match*/}
              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isSignUpDisabled}
              >

                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Crear Cuenta
                  </div>
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Al crear una cuenta, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}