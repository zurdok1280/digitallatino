import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CampaignActivationOverlayProps {
  title: string;
  description: string;
}

export function CampaignActivationOverlay({ title, description }: CampaignActivationOverlayProps) {
  const navigate = useNavigate();

  const handleActivateCampaign = () => {
    navigate('/campaign');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-background relative">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-muted/50 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para acceder a esta función necesitas activar una campaña activa.
            </p>
            
            <Button className="w-full" size="lg" onClick={handleActivateCampaign}>
              <Sparkles className="w-4 h-4 mr-2" />
              Activar Campaña
            </Button>
            
            <Button variant="outline" className="w-full" onClick={handleBackToDashboard}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}