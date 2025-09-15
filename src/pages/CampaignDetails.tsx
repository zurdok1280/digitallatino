import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle } from "lucide-react";
import { CampaignResults } from "@/components/CampaignResults";
import { PlaylistResults } from "@/components/PlaylistResults";
import { CampaignAnalytics } from "@/components/CampaignAnalytics";
import { CampaignAdjustments } from "@/components/CampaignAdjustments";
import badBunnyMonaco from "@/assets/covers/bad-bunny-monaco.jpg?url";
import karolGSiAntes from "@/assets/covers/karol-g-si-antes.jpg?url";
import pesoPlumaBebe from "@/assets/covers/peso-pluma-la-bebe.jpg?url";

// Portadas importadas correctamente con ?url (arriba)

// Datos mock de campaña basados en los parámetros
const getCampaignData = (artist?: string, track?: string) => {
  // Datos por defecto o según el artista
  const campaigns = {
    "Bad Bunny": {
      title: "Monaco",
      artist: "Bad Bunny",
      cover: badBunnyMonaco,
      status: "activa",
      daysLeft: 12,
      budget: "$1,500",
      streams: "2,847,293",
      roi: "340%"
    },
    "Karol G": {
      title: "Si Antes Te Hubiera Conocido",
      artist: "Karol G", 
      cover: karolGSiAntes,
      status: "activa",
      daysLeft: 8,
      budget: "$800",
      streams: "1,245,891",
      roi: "280%"
    },
    "Peso Pluma": {
      title: "La Bebé (Remix)",
      artist: "Peso Pluma",
      cover: pesoPlumaBebe,
      status: "activa", 
      daysLeft: 25,
      budget: "$2,000",
      streams: "892,456",
      roi: "195%"
    }
  };

  return campaigns[artist as keyof typeof campaigns] || campaigns["Bad Bunny"];
};

export default function CampaignDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const artist = searchParams.get('artist') || "Bad Bunny";
  const track = searchParams.get('track') || "Monaco";
  
  const campaignData = getCampaignData(artist, track);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <Card className="bg-gradient-to-r from-primary/5 to-blue/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={campaignData.cover}
                    alt={campaignData.title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <CardTitle className="text-2xl text-foreground">
                      {campaignData.title}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground">{campaignData.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className={campaignData.status === 'activa' ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                    {campaignData.status === 'activa' ? (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Activa
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completada
                      </>
                    )}
                  </Badge>
                  
                  {campaignData.status === 'activa' && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{campaignData.daysLeft}</div>
                      <p className="text-xs text-muted-foreground">días restantes</p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{campaignData.streams}</div>
                  <p className="text-xs text-muted-foreground">Total Streams</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{campaignData.roi}</div>
                  <p className="text-xs text-muted-foreground">ROI Actual</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{campaignData.budget}</div>
                  <p className="text-xs text-muted-foreground">Presupuesto</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">127</div>
                  <p className="text-xs text-muted-foreground">Playlists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas principales */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm border rounded-xl p-1 shadow-lg h-16">
            <TabsTrigger 
              value="results" 
              className="flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full"
            >
              <span className="text-lg">📊</span>
              <span className="leading-none">Resultados de Campaña</span>
            </TabsTrigger>
            <TabsTrigger 
              value="playlists" 
              className="flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full"
            >
              <span className="text-lg">🎵</span>
              <span className="leading-none">Resultados de Playlists</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full"
            >
              <span className="text-lg">📈</span>
              <span className="leading-none">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="adjustments" 
              className="flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all h-full"
            >
              <span className="text-lg">⚙️</span>
              <span className="leading-none">Ajustar Campaña</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <CampaignResults campaignData={campaignData} />
          </TabsContent>

          <TabsContent value="playlists">
            <PlaylistResults campaignData={campaignData} />
          </TabsContent>

          <TabsContent value="analytics">
            <CampaignAnalytics campaignData={campaignData} />
          </TabsContent>

          <TabsContent value="adjustments">
            <CampaignAdjustments campaignData={campaignData} />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}