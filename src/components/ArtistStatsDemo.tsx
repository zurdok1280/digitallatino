import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, PlayCircle, Globe, Calendar, DollarSign } from "lucide-react";

interface ArtistStatsDemoProps {
  artistName: string;
  trackName: string;
  coverUrl: string;
}

export function ArtistStatsDemo({ artistName, trackName, coverUrl }: ArtistStatsDemoProps) {
  // Datos de demo para la cuenta garciafix4@gmail.com
  const campaignStats = {
    totalStreams: "2,847,293",
    monthlyListeners: "485,621", 
    playlistPlacements: 127,
    socialFollowers: "34,892",
    revenueGenerated: "$8,456",
    campaignROI: "340%",
    topCountries: [
      { country: "México", percentage: 45, streams: "1,281,281" },
      { country: "Estados Unidos", percentage: 28, streams: "797,242" },
      { country: "Colombia", percentage: 15, streams: "427,094" },
      { country: "España", percentage: 12, streams: "341,676" }
    ],
    campaignProgress: {
      daysElapsed: 18,
      totalDays: 30,
      percentage: 60
    },
    platformStats: [
      { platform: "Spotify", streams: "1,846,521", growth: "+284%" },
      { platform: "YouTube Music", streams: "456,891", growth: "+198%" },
      { platform: "Apple Music", streams: "543,881", growth: "+156%" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header con info del artista */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img 
              src={coverUrl} 
              alt={trackName}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <CardTitle className="text-lg text-green-800">
                Campaña Activa: {artistName}
              </CardTitle>
              <p className="text-green-600 font-medium">{trackName}</p>
              <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                Día {campaignStats.campaignProgress.daysElapsed} de {campaignStats.campaignProgress.totalDays}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Progreso de Campaña</span>
              <span className="text-sm font-semibold text-green-800">{campaignStats.campaignProgress.percentage}%</span>
            </div>
            <Progress value={campaignStats.campaignProgress.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <PlayCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-600">{campaignStats.totalStreams}</div>
            <p className="text-xs text-muted-foreground">Total Streams</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-600">{campaignStats.monthlyListeners}</div>
            <p className="text-xs text-muted-foreground">Oyentes Mensuales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-600">{campaignStats.revenueGenerated}</div>
            <p className="text-xs text-muted-foreground">Ingresos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-600">{campaignStats.campaignROI}</div>
            <p className="text-xs text-muted-foreground">ROI Campaña</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Países Top
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaignStats.topCountries.map((country, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{country.country}</span>
                  <span className="text-sm text-muted-foreground">{country.streams} streams</span>
                </div>
                <Progress value={country.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaignStats.platformStats.map((platform, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{platform.platform}</div>
                  <div className="text-sm text-muted-foreground">{platform.streams} streams</div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {platform.growth}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultados destacados */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">🏆 Logros de la Campaña</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎵</span>
                <span className="text-sm font-medium">Playlists Verificadas: {campaignStats.playlistPlacements}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <span className="text-sm font-medium">Seguidores Nuevos: {campaignStats.socialFollowers}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span className="text-sm font-medium">Crecimiento: +284% en Spotify</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-sm font-medium">ROI: {campaignStats.campaignROI} en 18 días</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}