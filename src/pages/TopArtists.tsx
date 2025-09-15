import { PremiumOverlay } from '@/components/PremiumOverlay';
import { ArtistStatsDemo } from '@/components/ArtistStatsDemo';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, PlayCircle, Star } from 'lucide-react';

// Datos de demo para artistas
const demoArtists = [
  {
    name: "Bad Bunny",
    track: "Monaco",
    coverUrl: "/src/assets/covers/bad-bunny-monaco.jpg",
    monthlyListeners: "74.2M",
    rank: 1,
    score: 98,
    growth: "+12%"
  },
  {
    name: "Karol G", 
    track: "Si Antes Te Hubiera Conocido",
    coverUrl: "/src/assets/covers/karol-g-si-antes.jpg",
    monthlyListeners: "45.8M",
    rank: 2,
    score: 94,
    growth: "+8%"
  },
  {
    name: "Peso Pluma",
    track: "La Bebé (Remix)",
    coverUrl: "/src/assets/covers/peso-pluma-la-bebe.jpg",
    monthlyListeners: "32.1M", 
    rank: 3,
    score: 89,
    growth: "+25%"
  }
];

export default function TopArtists() {
  // Siempre mostrar Premium Overlay - las campañas solo aparecen en Dashboard
  return (
    <PremiumOverlay 
      title="Top Artists"
      description="Explora los artistas más escuchados y tendencias del momento"
    />
  );
}