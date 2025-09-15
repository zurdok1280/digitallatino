import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, TrendingUp, AlertTriangle, Zap, Target, DollarSign, Settings, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CampaignAdjustmentsProps {
  campaignData: {
    title: string;
    artist: string;
    status: string;
    daysLeft: number;
    budget: string;
    streams: string;
    roi: string;
  };
}

export function CampaignAdjustments({ campaignData }: CampaignAdjustmentsProps) {
  const { toast } = useToast();
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState<"automatic" | "manual">("automatic");
  const [manualConfig, setManualConfig] = useState({
    platforms: ["tiktok"],
    countries: ["mexico"],
    cities: ["ciudad-de-mexico"],
    duration: 30,
    budget: 649
  });
  
  const adjustments = {
    timeRemaining: campaignData.daysLeft,
    totalDuration: 30,
    currentPerformance: "Excelente", 
    momentum: "Alto",
    riskLevel: campaignData.daysLeft <= 7 ? "Alto" : campaignData.daysLeft <= 14 ? "Medio" : "Bajo",
    projectedLoss: campaignData.daysLeft <= 7 ? "45-60%" : "25-40%",
    extensions: [
      {
        id: "boost-7",
        name: "Extensión Boost 7 días",
        price: 299,
        description: "Mantén el momentum por 7 días más",
        benefits: ["+15% más streams", "+8 playlists nuevas", "Análisis extendido"],
        projected: {
          streams: "+425K",
          roi: "+85%",
          playlists: "+12"
        }
      },
      {
        id: "power-14", 
        name: "Extensión Power 14 días",
        price: 499,
        description: "Máximo impulso por 2 semanas adicionales",
        benefits: ["+35% más streams", "+18 playlists nuevas", "Soporte dedicado"],
        projected: {
          streams: "+890K",
          roi: "+165%", 
          playlists: "+25"
        },
        popular: true
      },
      {
        id: "ultimate-30",
        name: "Extensión Ultimate 30 días", 
        price: 899,
        description: "Ciclo completo adicional para maximizar resultados",
        benefits: ["+75% más streams", "+35 playlists nuevas", "Campaña en radio"],
        projected: {
          streams: "+1.8M",
          roi: "+280%",
          playlists: "+50"
        }
      }
    ]
  };

  const progressPercentage = ((30 - campaignData.daysLeft) / 30) * 100;

  const handleExtensionSelect = (extensionId: string) => {
    setSelectedExtension(extensionId);
    const extension = adjustments.extensions.find(ext => ext.id === extensionId);
    toast({
      title: "Extensión Seleccionada",
      description: `Has seleccionado: ${extension?.name}`
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto": return "text-red-600 bg-red-50 border-red-200";
      case "Medio": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Bajo": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado actual de la campaña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            ⏰ Estado Actual de la Campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{adjustments.timeRemaining}</div>
              <p className="text-sm text-blue-600">Días Restantes</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{adjustments.currentPerformance}</div>
              <p className="text-sm text-green-600">Performance</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{adjustments.momentum}</div>
              <p className="text-sm text-purple-600">Momentum</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progreso de Campaña</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {30 - campaignData.daysLeft} de 30 días completados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conclusiones del análisis de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            📊 Conclusiones del Análisis de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mejor plataforma detectada */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                🚀 Plataforma más eficiente
              </h4>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-green-800 text-lg">TikTok</span>
                  <Badge className="bg-green-600 text-white shadow-medium">Mejor ROI</Badge>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>$0.18 por stream (23% más eficiente)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>CTR: 2.22% (superior al promedio)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Mayor engagement de audiencia joven</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mejor país detectado */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                🌍 País más rentable
              </h4>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-blue-800 text-lg">México</span>
                  <Badge className="bg-blue-600 text-white shadow-medium">Líder</Badge>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>45% de tu audiencia total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>$0.19 costo por stream (competitivo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Alta resonancia cultural</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mejor ciudad detectada */}
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                🏙️ Ciudad con mejor conversión
              </h4>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-orange-800 text-lg">Ciudad de México</span>
                  <Badge className="bg-orange-600 text-white shadow-medium">Top</Badge>
                </div>
                <div className="space-y-2 text-sm text-orange-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>245K streams generados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Conversión: 3.4% (sobresaliente)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Centro urbano de mayor impacto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta de riesgo */}
      {adjustments.riskLevel !== "Bajo" && (
        <Alert className={getRiskColor(adjustments.riskLevel)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Riesgo de Pérdida de Tracción:</strong> {" "}
            Tu campaña está por finalizar y podrías perder {adjustments.projectedLoss} del momentum actual. 
            {adjustments.riskLevel === "Alto" && " ¡Actúa ahora para mantener el crecimiento!"}
          </AlertDescription>
        </Alert>
      )}

      {/* Extensión - Modo Automático vs Manual */}
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            🎯 Extensión de Campaña - 30 Días
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Elige cómo configurar tu extensión de campaña
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={configMode} onValueChange={(value) => setConfigMode(value as "automatic" | "manual")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="automatic" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Automático
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="automatic" className="space-y-6">
              {/* Resumen de optimización automática */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-primary/20 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">🚀</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-2">Configuración Optimizada Automáticamente</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hemos configurado la extensión perfecta basada en tu campaña más exitosa:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white/70 rounded-lg border">
                        <div className="font-bold text-green-600">TikTok</div>
                        <div className="text-xs text-green-700">Mejor ROI detectado</div>
                        <div className="text-xs font-semibold">85% del presupuesto</div>
                      </div>
                      <div className="text-center p-3 bg-white/70 rounded-lg border">
                        <div className="font-bold text-blue-600">México</div>
                        <div className="text-xs text-blue-700">45% de tu audiencia</div>
                        <div className="text-xs font-semibold">Enfoque principal</div>
                      </div>
                      <div className="text-center p-3 bg-white/70 rounded-lg border">
                        <div className="font-bold text-orange-600">CDMX</div>
                        <div className="text-xs text-orange-700">Mayor conversión</div>
                        <div className="text-xs font-semibold">3.4% CTR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del paquete automático */}
              <div className="border-2 border-primary/20 rounded-xl p-6 bg-gradient-to-br from-white to-primary/5">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Extensión Premium Optimizada</h3>
                    <p className="text-muted-foreground">Configuración inteligente basada en tu mejor performance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-1">$649</div>
                    <div className="text-sm text-muted-foreground line-through">$899</div>
                    <Badge className="bg-success text-white">28% OFF</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">✨</span>
                      Incluye Todo:
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        30 días de campaña extendida
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Enfoque automático en TikTok México
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Targeting en Ciudad de México
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        +35 playlists curatoriales
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Soporte dedicado 24/7
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Reportes avanzados semanales
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">📊</span>
                      Proyección Garantizada:
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-success/10 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Streams Adicionales:</span>
                          <span className="font-bold text-success text-lg">+1.2M</span>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">ROI Esperado:</span>
                          <span className="font-bold text-primary text-lg">+185%</span>
                        </div>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Nuevos Oyentes:</span>
                          <span className="font-bold text-accent text-lg">+340K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground">🎯 Configuración Lista</h4>
                      <p className="text-sm text-muted-foreground">
                        No necesitas configurar nada. Activamos automáticamente tu mejor estrategia.
                      </p>
                    </div>
                    <Button size="lg" className="bg-gradient-primary text-white shadow-glow hover:shadow-float hover:scale-105 transition-all duration-300">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Activar Extensión
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              {/* Configuración manual */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange/20 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-2">Configuración Manual Personalizada</h4>
                    <p className="text-sm text-muted-foreground">
                      Personaliza tu extensión de campaña con tus propios parámetros.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selección de plataformas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">🚀 Plataformas</h4>
                  <div className="space-y-3">
                    {[
                      { id: "tiktok", name: "TikTok", desc: "Mejor ROI - $0.18/stream", recommended: true },
                      { id: "instagram", name: "Instagram", desc: "Buena conversión - $0.22/stream" },
                      { id: "spotify", name: "Spotify", desc: "Audiencia leal - $0.25/stream" },
                      { id: "youtube", name: "YouTube", desc: "Alcance global - $0.20/stream" }
                    ].map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox 
                          id={platform.id}
                          checked={manualConfig.platforms.includes(platform.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setManualConfig(prev => ({
                                ...prev,
                                platforms: [...prev.platforms, platform.id]
                              }));
                            } else {
                              setManualConfig(prev => ({
                                ...prev,
                                platforms: prev.platforms.filter(p => p !== platform.id)
                              }));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <label htmlFor={platform.id} className="font-medium cursor-pointer">
                              {platform.name}
                            </label>
                            {platform.recommended && (
                              <Badge className="bg-success text-white text-xs">Recomendado</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{platform.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selección de países */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">🌍 Países</h4>
                  <div className="space-y-3">
                    {[
                      { id: "mexico", name: "México", desc: "45% de tu audiencia", recommended: true },
                      { id: "colombia", name: "Colombia", desc: "18% de tu audiencia" },
                      { id: "argentina", name: "Argentina", desc: "12% de tu audiencia" },
                      { id: "chile", name: "Chile", desc: "8% de tu audiencia" }
                    ].map((country) => (
                      <div key={country.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox 
                          id={country.id}
                          checked={manualConfig.countries.includes(country.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setManualConfig(prev => ({
                                ...prev,
                                countries: [...prev.countries, country.id]
                              }));
                            } else {
                              setManualConfig(prev => ({
                                ...prev,
                                countries: prev.countries.filter(c => c !== country.id)
                              }));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <label htmlFor={country.id} className="font-medium cursor-pointer">
                              {country.name}
                            </label>
                            {country.recommended && (
                              <Badge className="bg-success text-white text-xs">Mejor ROI</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{country.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ciudades principales */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">🏙️ Ciudades Principales (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "ciudad-de-mexico", name: "Ciudad de México", conversion: "3.4%" },
                    { id: "guadalajara", name: "Guadalajara", conversion: "2.8%" },
                    { id: "monterrey", name: "Monterrey", conversion: "2.6%" },
                    { id: "bogota", name: "Bogotá", conversion: "2.4%" },
                    { id: "medellin", name: "Medellín", conversion: "2.2%" },
                    { id: "buenos-aires", name: "Buenos Aires", conversion: "2.1%" }
                  ].map((city) => (
                    <div key={city.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50">
                      <Checkbox 
                        id={city.id}
                        checked={manualConfig.cities.includes(city.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setManualConfig(prev => ({
                              ...prev,
                              cities: [...prev.cities, city.id]
                            }));
                          } else {
                            setManualConfig(prev => ({
                              ...prev,
                              cities: prev.cities.filter(c => c !== city.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={city.id} className="text-sm font-medium cursor-pointer">
                          {city.name}
                        </label>
                        <p className="text-xs text-muted-foreground">CTR: {city.conversion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duración y presupuesto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">⏱️ Duración</h4>
                  <Select value={manualConfig.duration.toString()} onValueChange={(value) => 
                    setManualConfig(prev => ({ ...prev, duration: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días - $299</SelectItem>
                      <SelectItem value="14">14 días - $499</SelectItem>
                      <SelectItem value="30">30 días - $649 (Recomendado)</SelectItem>
                      <SelectItem value="60">60 días - $1,199</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">💰 Presupuesto Estimado</h4>
                  <div className="p-3 bg-primary/10 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">${manualConfig.budget}</div>
                    <p className="text-sm text-muted-foreground">Basado en tu selección</p>
                  </div>
                </div>
              </div>

              {/* Proyección manual */}
              <div className="border-2 border-orange/20 rounded-xl p-6 bg-gradient-to-br from-white to-orange/5">
                <h3 className="text-xl font-bold text-foreground mb-4">📊 Tu Configuración Personalizada</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Streams Proyectados:</span>
                      <span className="font-bold text-success">+{Math.round(manualConfig.duration * 40)}K</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ROI Estimado:</span>
                      <span className="font-bold text-primary">+{Math.round(manualConfig.duration * 6)}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Playlists:</span>
                      <span className="font-bold text-accent">+{Math.round(manualConfig.duration * 1.2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-foreground">🎯 Configuración Lista</h4>
                    <p className="text-sm text-muted-foreground">
                      Tu extensión personalizada de {manualConfig.duration} días está configurada.
                    </p>
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-glow hover:shadow-float hover:scale-105 transition-all duration-300">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Activar por ${manualConfig.budget}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Estadísticas de urgencia */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">⚡ ¿Por qué extender ahora?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-xl font-bold text-red-600">67%</div>
              <p className="text-xs text-red-700">De las campañas pierden tracción al finalizar</p>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-xl font-bold text-orange-600">2-3x</div>
              <p className="text-xs text-orange-700">Más caro relanzar una campaña</p>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-xl font-bold text-green-600">85%</div>
              <p className="text-xs text-green-700">De éxito con extensiones inmediatas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}