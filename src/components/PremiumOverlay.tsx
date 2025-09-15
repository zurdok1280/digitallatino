import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, TrendingUp, BarChart3, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumOverlayProps {
  title: string;
  description: string;
}

export function PremiumOverlay({ title, description }: PremiumOverlayProps) {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // TODO: Integrar con Stripe cuando esté listo
    console.log('Redirect to Stripe subscription');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const features = [
    {
      icon: BarChart3,
      title: "Charts Completos",
      description: "Acceso a todos los rankings por país y región",
      tier: "premium"
    },
    {
      icon: TrendingUp,
      title: "Analytics Básicos",
      description: "Métricas generales de artistas y canciones",
      tier: "premium"
    },
    {
      icon: Users,
      title: "Datos de Audiencia",
      description: "Información demográfica básica",
      tier: "premium"
    },
    {
      icon: Zap,
      title: "Actualizaciones Diarias",
      description: "Datos actualizados cada 24 horas",
      tier: "premium"
    }
  ];

  const campaignFeatures = [
    "Dashboard Completo",
    "Analytics en Tiempo Real", 
    "Datos Demográficos Avanzados",
    "Reportes de Revenue",
    "Pitch con curadores de playlist verificadas",
    "Promoción en Redes Sociales",
    "Acceso a Charts Premium",
    "Soporte Personalizado"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-primary/10 to-background relative">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-muted/50 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-2xl bg-background/90 backdrop-blur-sm border-accent/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Desbloquea {title}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Two Options Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Premium Option */}
              <div className="border border-accent/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-3">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Premium</h3>
                  <div className="text-2xl font-bold text-foreground mb-1">$14.99</div>
                  <div className="text-sm text-muted-foreground">USD/mes</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{feature.title}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSubscribe}
                  className="w-full bg-gradient-primary hover:shadow-glow text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Suscribirse Premium
                </button>
              </div>

              {/* Campaign Option */}
              <div className="border-2 border-cta-primary/30 rounded-xl p-6 bg-gradient-to-br from-cta-primary/5 to-orange-500/5 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cta-primary to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                    MÁS COMPLETO
                  </span>
                </div>
                
                <div className="text-center mb-4 pt-2">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-cta-primary to-orange-500 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white font-bold">🚀</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Campaña Personalizada</h3>
                  <div className="text-sm text-muted-foreground mb-2">Incluye Premium + Servicios</div>
                  <div className="text-lg font-bold text-foreground">Desde $750</div>
                  <div className="text-sm text-muted-foreground">USD por campaña</div>
                </div>
                
                <div className="space-y-2 mb-6">
                  {campaignFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/campaign')}
                  className="w-full bg-gradient-to-r from-cta-primary to-orange-500 hover:shadow-glow text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Crear Campaña
                </button>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                ¿No estás seguro? La campaña personalizada incluye todo lo de Premium y mucho más
              </p>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground" 
              onClick={handleBackToDashboard}
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}