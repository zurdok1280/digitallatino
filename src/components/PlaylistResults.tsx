import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, Users, PlayCircle, Headphones, Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

interface PlaylistResultsProps {
  campaignData: {
    title: string;
    artist: string;
  };
}

export function PlaylistResults({ campaignData }: PlaylistResultsProps) {
  const playlistData = {
    totalPlaylists: 127,
    activeAdditions: 89,
    pendingReviews: 23,
    rejections: 15,
    totalFollowers: "2,847,293",
    avgPlaylistSize: "12,456",
    topGenrePlaylists: 45,
    spotifyEditorial: 8,
    userGenerated: 119,
    playlists: [
      {
        name: "Reggaeton Hits 2024 🔥 Los Más Sonados",
        curator: "B&W Music Perú",
        curatorAvatar: "/lovable-uploads/544b8d7c-17e6-4c56-be22-6cb146932d26.png",
        followers: "64.480",
        status: "added",
        position: 31,
        totalSongs: 486,
        streams: "245,891",
        type: "editorial",
        addedDate: "Hace 4 meses",
        rating: 5,
        review: "Es una balada de desamor en la que Julián Álvarez nos recuerda el peso de la soledad tras una pérdida. Con su voz profunda y su característico estilo norteño, canta sobre ese vacío que queda cuando ya no hay nadie a su lado, pero también sobre la fortaleza que queda al aceptar esa realidad.",
        playlistCover: "/src/assets/covers/bad-bunny-monaco.jpg"
      },
      {
        name: "De Todo Un Poco 2025 🎵 Buena música variada del hoy y del ayer",
        curator: "Gate",
        curatorAvatar: "/lovable-uploads/b600ff15-6d9b-4b3d-8755-fb53150ce8be.png",
        followers: "232.392",
        status: "added", 
        position: 91,
        totalSongs: 486,
        streams: "189,456",
        type: "editorial",
        addedDate: "Hace 4 meses",
        rating: 4,
        review: "Excelente track para nuestra playlist variada. Gran calidad musical y muy buena producción.",
        playlistCover: "/src/assets/covers/karol-g-si-antes.jpg"
      },
      {
        name: "Club Hits 2025 🌟 Pop Hits & Party Anthems",
        curator: "SSL Music",
        curatorAvatar: "/lovable-uploads/544b8d7c-17e6-4c56-be22-6cb146932d26.png",
        followers: "430.195",
        status: "added",
        position: 12,
        totalSongs: 89,
        streams: "156,782",
        type: "editorial",
        addedDate: "Hace 5 meses",
        rating: 4,
        review: "Clean flow",
        playlistCover: "/src/assets/covers/sabrina-carpenter-espresso.jpg"
      },
      {
        name: "Camilo Éxitos 🔥 Camilo Mix",
        curator: "dunk.vibes",
        curatorAvatar: "/lovable-uploads/b600ff15-6d9b-4b3d-8755-fb53150ce8be.png", 
        followers: "31.481",
        status: "added",
        position: 35,
        totalSongs: 96,
        streams: "89,234",
        type: "user",
        addedDate: "Hace 5 meses",
        rating: 4,
        review: "Perfecta para la colección de Camilo. Gran adición!",
        playlistCover: "/src/assets/covers/peso-pluma-la-bebe.jpg"
      },
      {
        name: "Yabancı Pop 2025 - En İyi Yabancı Hit Şarkılar",
        curator: "RITIX",
        curatorAvatar: "/lovable-uploads/544b8d7c-17e6-4c56-be22-6cb146932d26.png",
        followers: "27.048", 
        status: "added",
        position: 21,
        totalSongs: 498,
        streams: "67,891",
        type: "user",
        addedDate: "Hace 5 meses",
        rating: 5,
        review: "Mükemmel! Bu şarkı playlistimize çok uydu. Teşekkürler!",
        playlistCover: "/src/assets/covers/taylor-swift-fortnight.jpg"
      },
      {
        name: "Make Up & Skincare Playlist 💄",
        curator: "VM",
        curatorAvatar: "/lovable-uploads/b600ff15-6d9b-4b3d-8755-fb53150ce8be.png",
        followers: "8.272",
        status: "added",
        position: 94,
        totalSongs: 252,
        streams: "45,123",
        type: "user", 
        addedDate: "Hace 5 meses",
        rating: 3,
        review: "Buena para el ambiente de la playlist. Gracias por la submission.",
        playlistCover: "/src/assets/covers/chappell-roan-good-luck.jpg"
      },
      {
        name: "TIK TOK TRENDING SONGS 🔥",
        curator: "AZ MUSIC ®",
        curatorAvatar: "/lovable-uploads/544b8d7c-17e6-4c56-be22-6cb146932d26.png",
        followers: "1.140",
        status: "added",
        position: 4,
        totalSongs: 732,
        streams: "123,567", 
        type: "user",
        addedDate: "Hace 5 meses",
        rating: 5,
        review: "Perfect for TikTok vibes! This will definitely trend. Amazing track!",
        playlistCover: "/src/assets/covers/billie-eilish-birds.jpg"
      },
      {
        name: "Perreo Intenso 🔥 Reggaeton Duro",
        curator: "Topsify",
        curatorAvatar: "/lovable-uploads/b600ff15-6d9b-4b3d-8755-fb53150ce8be.png",
        followers: "567.891",
        status: "pending",
        position: null,
        totalSongs: 234,
        streams: "0",
        type: "playlist",
        addedDate: "Hace 2 semanas",
        rating: null,
        review: null,
        playlistCover: "/src/assets/covers/eminem-tobey.jpg"
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <span className="w-4 h-4 text-red-500">✕</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'added':
        return <Badge className="bg-green-100 text-green-800">Agregada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{playlistData.activeAdditions}</div>
            <p className="text-sm text-green-600">Agregadas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{playlistData.totalFollowers}</div>
            <p className="text-sm text-blue-600">Total Seguidores</p>
          </CardContent>
        </Card>
      </div>

      {/* Feed de playlists estilo social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎵 Feed de Playlists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {playlistData.playlists.map((playlist, index) => (
              <div key={index} className="border-b border-muted/30 pb-6 last:border-b-0">
                
                {/* Header con fecha y estado */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>{playlist.addedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-green-500" />
                    <ThumbsDown className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-red-500" />
                    <Star className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-yellow-500" />
                  </div>
                </div>

                {/* Rating si existe */}
                {playlist.rating && (
                  <div className="mb-3">
                    {renderStars(playlist.rating)}
                  </div>
                )}

                {/* Review/comentario del curator */}
                {playlist.review && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-foreground italic">"{playlist.review}"</p>
                  </div>
                )}

                {/* Información principal de la playlist */}
                <div className="flex gap-4">
                  {/* Portada de la playlist */}
                  <img 
                    src={playlist.playlistCover}
                    alt={playlist.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  
                  {/* Información de la playlist */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">Playlist</span>
                          {playlist.type === 'editorial' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Editorial
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                          {playlist.name}
                        </h4>
                        
                        {/* Métricas de la playlist */}
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-2">
                          <div>
                            <span className="block">Canciones</span>
                            <span className="font-semibold text-foreground">{playlist.totalSongs}</span>
                          </div>
                          {playlist.position && (
                            <div>
                              <span className="block">Posición</span>
                              <span className="font-semibold text-foreground">{playlist.position}</span>
                            </div>
                          )}
                          <div>
                            <span className="block">Seguidores</span>
                            <span className="font-semibold text-foreground">{playlist.followers}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información del curator */}
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right text-xs">
                          <div className="text-muted-foreground">Playlister</div>
                          <div className="font-semibold text-foreground">{playlist.curator}</div>
                          <div className="text-muted-foreground">{playlist.followers} Seguidores</div>
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={playlist.curatorAvatar} alt={playlist.curator} />
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                            {playlist.curator.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    
                    {/* Estado y streams */}
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(playlist.status)}
                      {playlist.status === 'added' && (
                        <span className="text-xs text-muted-foreground">
                          {playlist.streams} streams generados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}