import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Users, PlayCircle, DollarSign, Calendar, Instagram, Music, Facebook, Twitter, Youtube } from "lucide-react";

interface CampaignResultsProps {
  campaignData: {
    title: string;
    artist: string;
    status: string;
    daysLeft?: number;
    budget: string;
    streams: string;
    roi: string;
  };
}

export function CampaignResults({ campaignData }: CampaignResultsProps) {
  const platformResults = {
    instagram: {
      reach: "721,543",
      impressions: "4,832,156",
      spotifyClicks: "89,234",
      ctr: "1.85%"
    },
    tiktok: {
      reach: "593,829",
      impressions: "3,284,927",
      spotifyClicks: "72,891",
      ctr: "2.22%"
    },
    facebook: {
      reach: "386,291",
      impressions: "2,194,573",
      spotifyClicks: "45,763",
      ctr: "2.08%"
    }
  };

  const topCountries = [
    { country: "México", percentage: 45, listeners: "831,281", cities: ["Ciudad de México: 245K", "Guadalajara: 128K", "Monterrey: 97K"] },
    { country: "Estados Unidos", percentage: 28, listeners: "517,242", cities: ["Los Angeles: 156K", "Miami: 89K", "New York: 73K"] },
    { country: "Colombia", percentage: 15, listeners: "277,094", cities: ["Bogotá: 98K", "Medellín: 67K", "Cali: 45K"] },
    { country: "España", percentage: 12, listeners: "221,676", cities: ["Madrid: 87K", "Barcelona: 65K", "Valencia: 32K"] }
  ];

  const demographics = {
    age18_24: 35,
    age25_34: 28,
    age35_44: 22,
    age45_plus: 15
  };

  const PlatformCard = ({ platform, data, icon, color }: { 
    platform: string; 
    data: any; 
    icon: React.ReactNode; 
    color: string 
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold capitalize">{platform}</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`bg-gradient-to-r ${color} border-opacity-30`}>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-xl font-bold">{data.reach}</div>
            <p className="text-xs opacity-80">Alcance</p>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${color} border-opacity-30`}>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-xl font-bold">{data.impressions}</div>
            <p className="text-xs opacity-80">Impresiones</p>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${color} border-opacity-30`}>
          <CardContent className="p-4 text-center">
            <Music className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-xl font-bold">{data.spotifyClicks}</div>
            <p className="text-xs opacity-80">Clics a Spotify</p>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${color} border-opacity-30`}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-xl font-bold">{data.ctr}</div>
            <p className="text-xs opacity-80">CTR</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumen General de Campaña</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">1,847,293</div>
              <p className="text-sm text-muted-foreground">Alcance Total</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">12,456,789</div>
              <p className="text-sm text-muted-foreground">Impresiones Totales</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">245,091</div>
              <p className="text-sm text-muted-foreground">Clics a Spotify</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{campaignData.roi}</div>
              <p className="text-sm text-muted-foreground">ROI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados por plataforma */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Resultados por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                TikTok
              </TabsTrigger>
              <TabsTrigger value="facebook" className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="instagram" className="mt-6">
              <PlatformCard 
                platform="instagram" 
                data={platformResults.instagram}
                icon={<Instagram className="w-5 h-5 text-pink-500" />}
                color="from-pink-50 to-pink-100 border-pink-200"
              />
            </TabsContent>
            
            <TabsContent value="tiktok" className="mt-6">
              <PlatformCard 
                platform="tiktok" 
                data={platformResults.tiktok}
                icon={<PlayCircle className="w-5 h-5 text-gray-800" />}
                color="from-gray-50 to-gray-100 border-gray-200"
              />
            </TabsContent>
            
            <TabsContent value="facebook" className="mt-6">
              <PlatformCard 
                platform="facebook" 
                data={platformResults.facebook}
                icon={<Facebook className="w-5 h-5 text-blue-600" />}
                color="from-blue-50 to-blue-100 border-blue-200"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rendimiento geográfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌍 Por País
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map((country, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{country.country}</span>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">{country.listeners} oyentes</span>
                      <div className="text-sm font-semibold">{country.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={country.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏙️ Por Ciudad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map((country, index) => (
                <div key={index} className="space-y-2">
                  <div className="font-medium text-sm">{country.country}:</div>
                  <div className="ml-2 space-y-1">
                    {country.cities.map((city, cityIndex) => (
                      <div key={cityIndex} className="text-sm text-muted-foreground flex justify-between">
                        <span>{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demografía por edades */}
      <Card>
        <CardHeader>
          <CardTitle>👥 Demografía por Edades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{demographics.age18_24}%</div>
              <p className="text-sm text-muted-foreground">18-24 años</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{demographics.age25_34}%</div>
              <p className="text-sm text-muted-foreground">25-34 años</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{demographics.age35_44}%</div>
              <p className="text-sm text-muted-foreground">35-44 años</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{demographics.age45_plus}%</div>
              <p className="text-sm text-muted-foreground">45+ años</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}