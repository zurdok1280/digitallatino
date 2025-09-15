import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Clock, CheckCircle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Importar las portadas como módulos ES6
import badBunnyMonaco from "@/assets/covers/bad-bunny-monaco.jpg?url";
import karolGSiAntes from "@/assets/covers/karol-g-si-antes.jpg?url";
import pesoPlumaBebe from "@/assets/covers/peso-pluma-la-bebe.jpg?url";
import sabrinaCarpenterEspresso from "@/assets/covers/sabrina-carpenter-espresso.jpg?url";
import shaboozeyBarSong from "@/assets/covers/shaboozey-bar-song.jpg?url";
import taylorSwiftFortnight from "@/assets/covers/taylor-swift-fortnight.jpg?url";

// Datos de ejemplo de campañas del usuario
const campaignsData = {
  active: [
    {
      id: "1",
      title: "Monaco",
      artist: "Bad Bunny",
      cover: badBunnyMonaco,
      status: "activa",
      daysLeft: 12,
      budget: "$1,500",
      streams: "2,847,293",
      roi: "340%"
    },
    {
      id: "2", 
      title: "Si Antes Te Hubiera Conocido",
      artist: "Karol G",
      cover: karolGSiAntes,
      status: "activa",
      daysLeft: 8,
      budget: "$800",
      streams: "1,245,891",
      roi: "280%"
    },
    {
      id: "3",
      title: "La Bebé (Remix)",
      artist: "Peso Pluma",
      cover: pesoPlumaBebe, 
      status: "activa",
      daysLeft: 25,
      budget: "$2,000",
      streams: "892,456",
      roi: "195%"
    }
  ],
  expired: [
    {
      id: "4",
      title: "Espresso", 
      artist: "Sabrina Carpenter",
      cover: sabrinaCarpenterEspresso,
      status: "completada",
      endDate: "2024-12-15",
      budget: "$1,200",
      totalStreams: "3,456,789",
      finalROI: "420%"
    },
    {
      id: "5",
      title: "A Bar Song (Tipsy)",
      artist: "Shaboozey", 
      cover: shaboozeyBarSong,
      status: "completada",
      endDate: "2024-11-28",
      budget: "$900",
      totalStreams: "2,198,765",
      finalROI: "290%"
    },
    {
      id: "6",
      title: "Fortnight",
      artist: "Taylor Swift",
      cover: taylorSwiftFortnight,
      status: "completada", 
      endDate: "2024-10-20",
      budget: "$1,800",
      totalStreams: "5,234,567",
      finalROI: "380%"
    }
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Simular búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    toast({
      title: "Buscando canción...",
      description: `Iniciando búsqueda para "${searchQuery}"`
    });
    
    // Redirigir a Campaign con query de búsqueda
    navigate(`/campaign?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleCampaignClick = (campaign: any) => {
    if (campaign.status === "activa") {
      // Redirigir a página de detalles de campaña con las 4 pestañas
      navigate(`/campaign-details?artist=${encodeURIComponent(campaign.artist)}&track=${encodeURIComponent(campaign.title)}&coverUrl=${encodeURIComponent(campaign.cover)}`);
    } else {
      // Mostrar resumen de campaña completada - también puede ir a detalles
      navigate(`/campaign-details?artist=${encodeURIComponent(campaign.artist)}&track=${encodeURIComponent(campaign.title)}&coverUrl=${encodeURIComponent(campaign.cover)}&status=completed`);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bienvenido de nuevo, {user.email?.split('@')[0]} 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Selecciona tu campaña o busca una nueva canción
          </p>
        </div>

        {/* Buscador */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-2 border-primary/20">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar artista o canción (ej: arelys henao)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg bg-white/50 border-2 border-muted/30 focus:border-primary/50"
                />
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="px-8 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pestañas de Campañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Vistas previamente
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                {campaignsData.active.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expiradas
              <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-800">
                {campaignsData.expired.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Campañas Activas */}
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignsData.active.map((campaign) => (
                <Card 
                  key={campaign.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 border-green-200 hover:border-green-300"
                  onClick={() => handleCampaignClick(campaign)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-green-500 text-white">
                        <Play className="w-3 h-3 mr-1" />
                        Activa
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-800 text-white">
                        {campaign.daysLeft} días restantes
                      </Badge>
                    </div>
                    
                    <div className="flex gap-4">
                      {/* Portada del álbum */}
                      <div className="flex-shrink-0">
                        <img 
                          src={campaign.cover}
                          alt={campaign.title}
                          className="w-20 h-20 rounded-xl object-cover shadow-lg"
                        />
                      </div>
                      
                      {/* Información de la campaña */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-bold text-xl text-green-600 mb-1 group-hover:text-green-700 transition-colors">
                            {campaign.title}
                          </h3>
                          <p className="text-gray-600 text-lg">{campaign.artist}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-500 text-sm">Presupuesto:</span>
                            <div className="font-bold text-lg text-gray-900">{campaign.budget}</div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">ROI:</span>
                            <div className="font-bold text-lg text-green-600">{campaign.roi}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500 text-sm">Streams:</span>
                            <div className="font-bold text-lg text-blue-600">{campaign.streams}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campañas Expiradas */}
          <TabsContent value="expired">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaignsData.expired.map((campaign) => (
                <Card 
                  key={campaign.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300"
                  onClick={() => handleCampaignClick(campaign)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completada
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-800 text-white">
                        <Calendar className="w-3 h-3 mr-1" />
                        {campaign.endDate}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-4">
                      {/* Portada del álbum */}
                      <div className="flex-shrink-0">
                        <img 
                          src={campaign.cover}
                          alt={campaign.title}
                          className="w-20 h-20 rounded-xl object-cover shadow-lg"
                        />
                      </div>
                      
                      {/* Información de la campaña */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-bold text-xl text-gray-700 mb-1 group-hover:text-gray-800 transition-colors">
                            {campaign.title}
                          </h3>
                          <p className="text-gray-600 text-lg">{campaign.artist}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-500 text-sm">Presupuesto:</span>
                            <div className="font-bold text-lg text-gray-900">{campaign.budget}</div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">ROI Final:</span>
                            <div className="font-bold text-lg text-blue-600">{campaign.finalROI}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500 text-sm">Total Streams:</span>
                            <div className="font-bold text-lg text-purple-600">{campaign.totalStreams}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats rápidas */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {campaignsData.active.length}
              </div>
              <p className="text-sm text-green-600">Campañas Activas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {campaignsData.expired.length}
              </div>
              <p className="text-sm text-blue-600">Completadas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">
                5.2M+
              </div>
              <p className="text-sm text-purple-600">Total Streams</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">
                312%
              </div>
              <p className="text-sm text-orange-600">ROI Promedio</p>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}