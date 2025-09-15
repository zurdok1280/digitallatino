import { TrendingUp, Users, Zap, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ModernHero() {
  const metrics = [
    {
      icon: TrendingUp,
      value: "2.5M+",
      label: "Streams Generados",
      color: "text-emerald-600"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Artistas Activos",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      value: "99.9%",
      label: "Uptime",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 px-6">
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Plataforma Profesional</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Impulsa tu música
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              al siguiente nivel
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Crea campañas promocionales profesionales para tus canciones con métricas precisas y diseños que convierten.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-primary hover:shadow-float text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-glow group">
              <span className="flex items-center gap-2">
                Comenzar Gratis
                <Music className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </span>
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glass">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
          {metrics.map((metric, index) => (
            <Card 
              key={metric.label}
              className="bg-gradient-glass backdrop-blur-sm border border-white/20 shadow-glass p-6 hover:shadow-float transition-all duration-300 hover:scale-105"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-white/20 to-white/5 ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}