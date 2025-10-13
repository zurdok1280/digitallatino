import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, Star, Plus, Minus, Search, Music, Crown, Play, Pause, Trophy, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LatinAmericaMap } from "@/components/LatinAmericaMap";
import { SpotifyTrack } from "@/types/spotify";
import { useAuth } from "@/hooks/useAuth";
import { digitalLatinoApi, Country, Format, City, Song } from "@/lib/api";
// Import album covers
import { Backdrop, CircularProgress, Fab } from '@mui/material';
import teddySwimsCover from "@/assets/covers/teddy-swims-lose-control.jpg";
import badBunnyCover from "@/assets/covers/bad-bunny-monaco.jpg";
import karolGCover from "@/assets/covers/karol-g-si-antes.jpg";
import shaboozeyCover from "@/assets/covers/shaboozey-bar-song.jpg";
import sabrinaCarpenterCover from "@/assets/covers/sabrina-carpenter-espresso.jpg";
import pesoPlumaCover from "@/assets/covers/peso-pluma-la-bebe.jpg";
import taylorSwiftCover from "@/assets/covers/taylor-swift-fortnight.jpg";
import eminemCover from "@/assets/covers/eminem-tobey.jpg";
import chappellRoanCover from "@/assets/covers/chappell-roan-good-luck.jpg";
import billieEilishCover from "@/assets/covers/billie-eilish-birds.jpg";
import { time } from "console";
import { useApiWithLoading } from '@/hooks/useApiWithLoading';

// Datos actualizados con artistas reales de 2024
const demoRows = [
  {
    rk: 1,
    artists: "Teddy Swims",
    song: "Lose Control",
    coverUrl: teddySwimsCover,
    artistImageUrl: "",
    score: 98,
    movement: "SAME", // "UP", "DOWN", "SAME", "NEW", "RE-ENTRY"
    campaignDescription: "Campaña integral de promoción musical con duración de 30 días que incluye pitch con curadores de playlists verificadas, campañas publicitarias en Facebook, TikTok e Instagram, y análisis detallado de performance para maximizar el alcance de tu canción.",
    spotify_streams_total: 24181969,
    tiktok_views_total: 5648611,
    youtube_video_views_total: 2484375,
    youtube_short_views_total: 617455,
    shazams_total: 27031,
    soundcloud_stream_total: 17153,
    pan_streams: 0,
    audience_total: 37633256,
    spins_total: 6038
  }
];

// Completar hasta el top 40
const extendedDemoRows = [...demoRows, ...demoRows];

// Agregar más entradas para llegar a 40
for (let i = 16; i <= 40; i++) {
  const covers = [teddySwimsCover, badBunnyCover, karolGCover, shaboozeyCover, sabrinaCarpenterCover, pesoPlumaCover, taylorSwiftCover, eminemCover, chappellRoanCover, billieEilishCover];
  const artists = ["Miley Cyrus", "Harry Styles", "Ariana Grande", "The Weeknd", "Drake", "Post Malone", "Rihanna", "Ed Sheeran", "Bruno Mars", "Adele"];
  const tracks = ["Flowers", "As It Was", "positions", "Blinding Lights", "God's Plan", "Circles", "Umbrella", "Shape of You", "Uptown Funk", "Hello"];


}

// El array final con 40 entradas
const allDemoRows = extendedDemoRows;

interface PlatformChipProps {
  label: string;
  rank: number;
}

function PlatformChip({ label, rank }: PlatformChipProps) {
  const getLogoEmoji = (platform: string) => {
    const logos = {
      Spotify: "🟢",
      TikTok: "⚫",
      YouTube: "🔴",
      Shazam: "🔵",
      Pandora: "🟦",
      SoundCloud: "🟠"
    };
    return logos[platform as keyof typeof logos] || "🎵";
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/70 backdrop-blur-sm px-3 py-1 shadow-sm">
      <span className="text-sm">{getLogoEmoji(label)}</span>
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <span className="ml-1 text-xs text-gray-400 filter blur-[1px] select-none">#{rank}</span>
    </div>
  );
}

interface BlurBlockProps {
  title: string;
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

function BlurBlock({ title, children, onNavigate }: BlurBlockProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/40 backdrop-blur-sm p-4 shadow-md">
      <h4 className="mb-3 text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
        <span className="text-lg">📊</span> {title}
      </h4>
      <div className="relative overflow-hidden rounded-xl">
        {/* Contenido específico y tentador */}
        <div className="relative z-0 py-2">
          {children}
          {/* Datos específicos que generan curiosidad */}
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-100/60 rounded">
              <span className="text-xs text-gray-700">Artista Similar:</span>
              <span className="text-xs font-bold text-green-600">+892% streams</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-100/60 rounded">
              <span className="text-xs text-gray-700">Campaña 30 días:</span>
              <span className="text-xs font-bold text-blue-600">$2.4M revenue</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-100/60 rounded">
              <span className="text-xs text-gray-700">Nuevos fans:</span>
              <span className="text-xs font-bold text-purple-600">145,823</span>
            </div>
          </div>
        </div>

        {/* Sin blur para mostrar el dashboard hermoso */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-transparent to-background/5" />

        {/* Unlock overlay compacto con colores Digital Latino */}

      </div>
    </div>
  );
}

interface MovementIndicatorProps {
  movement: string;
  lastWeek: string | number;
  currentRank: number;
}

function MovementIndicator({ movement, lastWeek, currentRank }: MovementIndicatorProps) {
  if (movement === "NEW") {
    return (
      <div className="flex items-center justify-center">
        <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-md">
          NEW
        </span>
      </div>
    );
  }

  if (movement === "RE-ENTRY") {
    return (
      <div className="flex items-center justify-center">
        <span className="rounded-full bg-gradient-to-r from-slate-500 to-gray-600 px-3 py-1 text-xs font-bold text-white shadow-md">
          RE-ENTRY
        </span>
      </div>
    );
  }

  if (movement === "UP") {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-1">
          <ChevronUp className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  if (movement === "DOWN") {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-full p-1">
          <ChevronDown className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  return <div className="w-4 h-4"></div>; // Same placeholder
}

interface ExpandRowProps {
  row: Song;
  onPromote: () => void;
}

function ExpandRow({ row, onPromote }: ExpandRowProps) {
  return (
    <div className="mt-4 border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4 animate-fade-in relative overflow-visible">
      {/* Blurred Content */}
      <div className="blur-sm pointer-events-none">
        {/* Compact Billboard-style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">

          {/* Debut Position */}
          <div className="bg-black border border-green-500 rounded-xl p-3 text-center">
            <div className="text-xs text-green-400 font-bold mb-1 uppercase tracking-wide">Debut Position</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{row.rk}</div>
            <div className="text-xs text-gray-400">Debut Chart Date</div>
            <div className="text-xs text-white">01/15/24</div>
          </div>

          {/* Peak Position */}
          <div className="bg-black border border-green-500 rounded-xl p-3 text-center">
            <div className="text-xs text-green-400 font-bold mb-1 uppercase tracking-wide">Peak Position</div>
            <div className="text-3xl font-bold text-green-400 mb-1">{row.rk}</div>
            <div className="text-xs text-gray-400">Peak Chart Date</div>
            <div className="text-xs text-white">02/08/24</div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-black border border-green-500 rounded-xl p-3">
            <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Platform Rankings</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">🟢 Spotify:</span>
                <span className="text-white font-bold">#{row.spotify_streams_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">⚫ TikTok:</span>
                <span className="text-white font-bold">#{row.tiktok_views_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">🔴 YouTube:</span>
                <span className="text-white font-bold">#{row.youtube_video_views_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">🔵 Shazam:</span>
                <span className="text-white font-bold">#{row.shazams_total}</span>
              </div>
            </div>
          </div>

          {/* Awards & Share */}
          <div className="bg-black border border-green-500 rounded-xl p-3">
            <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Awards</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-500 rounded-full p-1">
                <span className="text-white text-xs">↗</span>
              </div>
              <span className="text-white text-xs">Gains In Performance</span>
            </div>
            <div className="text-xs text-green-400 font-bold mb-1 uppercase tracking-wide">Share</div>
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-green-600 rounded border border-green-500 flex items-center justify-center">
                <span className="text-white text-xs">f</span>
              </div>
              <div className="w-6 h-6 bg-green-600 rounded border border-green-500 flex items-center justify-center">
                <span className="text-white text-xs">X</span>
              </div>
              <div className="w-6 h-6 bg-green-600 rounded border border-green-500 flex items-center justify-center">
                <span className="text-white text-xs">🔗</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Markets - Horizontal compact display */}
        <div className="mb-4 bg-black border border-green-500/30 rounded-xl p-3">
          <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Top Markets Performance</div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
            {/*  {row.topCountries.slice(0, 5).map((country, index) => (
              <div key={country} className="flex justify-between items-center bg-white/5 rounded p-2">
                <span className="text-gray-400">{index === 0 ? '🇺🇸' : index === 1 ? '🇲🇽' : index === 2 ? '🇨🇴' : index === 3 ? '🇦🇷' : '🇨🇱'} {country.split(' ')[0]}</span>
                <span className="text-green-400 font-bold">{34 - (index * 6)}%</span>
              </div>
            ))} */}
          </div>
        </div>

        {/* Detailed Analytics Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-black border border-green-500/30 rounded-xl p-3">
            <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Revenue Analytics</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Streams:</span>
                <span className="text-white font-bold">2.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue:</span>
                <span className="text-green-400 font-bold">$8,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RPM:</span>
                <span className="text-white font-bold">$3.51</span>
              </div>
            </div>
          </div>

          <div className="bg-black border border-green-500/30 rounded-xl p-3">
            <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Growth Metrics</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Weekly Growth:</span>
                <span className="text-green-400 font-bold">+234%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Listeners:</span>
                <span className="text-white font-bold">45.2K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Retention:</span>
                <span className="text-white font-bold">68%</span>
              </div>
            </div>
          </div>

          <div className="bg-black border border-green-500/30 rounded-xl p-3">
            <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Demographic Data</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Age 18-24:</span>
                <span className="text-white font-bold">42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Age 25-34:</span>
                <span className="text-white font-bold">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Male/Female:</span>
                <span className="text-white font-bold">48/52</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Overlay - Digital Latino, sin oscurecer ni blur */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-gradient-to-br from-background/90 to-background/85 border border-primary/20 rounded-2xl shadow-2xl max-w-md mx-4">
          <div className="mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔓</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              Desbloquea Analytics Completos
            </h3>
            <p className="text-muted-foreground text-sm">
              Accede a métricas detalladas, datos demográficos y herramientas profesionales de promoción
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
            <div className="flex items-center gap-2 text-primary">
              <span>✓</span>
              <span>Dashboard Completo</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span>✓</span>
              <span>Analytics en Tiempo Real</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span>✓</span>
              <span>Datos Demográficos</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span>✓</span>
              <span>Reportes de Revenue</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span>✓</span>
              <span>Pitch con Curadores</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span>✓</span>
              <span>Promoción en Redes</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={onPromote}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-full font-bold text-base transition-all hover:shadow-lg hover:scale-105"
            >
              🚀 Comprar Campaña
            </button>
            <p className="text-xs text-muted-foreground">
              ROI Promedio: <strong className="text-primary">+{row.score}%</strong> • Cancela en cualquier momento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Spotify API configuration  
const DEFAULT_CLIENT_ID = '5001fe1a36c8442781282c9112d599ca';
const SPOTIFY_CONFIG = {
  client_id: DEFAULT_CLIENT_ID,
  redirect_uri: window.location.origin,
  scope: 'user-read-private user-read-email',
};

interface SearchResultProps {
  track: SpotifyTrack;
  onSelect: (track: SpotifyTrack) => void;
}

function SearchResult({ track, onSelect }: SearchResultProps) {
  const handleClick = () => {
    onSelect(track);
  };

  return (
    <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm">
      <div className="flex items-center gap-4" onClick={handleClick}>
        <div className="relative">
          <img
            src={track.album.images[0]?.url}
            alt={track.album.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 mb-1">{track.name}</h3>
          <p className="text-sm text-slate-600 mb-2">{track.artists.map(artist => artist.name).join(', ')}</p>
          <p className="text-xs text-slate-500">{track.album.name}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800"
        >
          Ver Campaña
        </Button>
      </div>
    </Card>
  );
}

export default function Charts() {
  const { loading, callApi } = useApiWithLoading();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Spotify search state
  const [searchQuery, setSearchQuery] = useState('');     //Aislar
  const [accessToken, setAccessToken] = useState<string | null>(null); //Aislar
  const [isConnected, setIsConnected] = useState(false); //Aislar

  // Countries API state
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('2'); // USA ID = 2 por defecto

  // Formats API state
  const [formats, setFormats] = useState<Format[]>([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('0'); // General ID = 0 por defecto

  // Cities API state
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState('0'); // All ID = 0 por defecto

  // Charts API state
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [selectedSong, setSelectedSong] = useState('2'); // USA ID = 2 por defecto

  // Period API state
  const [selectedPeriod, setSelectedPeriod] = useState('C'); // Current por defecto 

  const [showGenreOverlay, setShowGenreOverlay] = useState(false);
  const [showCrgOverlay, setShowCrgOverlay] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [chartSearchQuery, setChartSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dropdown state keyboard navigation
  const [openDropdown, setOpenDropdown] = useState<'country' | 'format' | 'city' | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const filteredSongs = useMemo(() => {
    console.log('Filtrando canciones...', chartSearchQuery, songs.length);

    // Si no hay query de búsqueda, devolver todas las canciones
    if (!chartSearchQuery.trim()) {
      return songs;
    }
    const query = chartSearchQuery.toLowerCase().trim();
    return songs.filter(song => {
      const songMatch = song.song?.toLowerCase().includes(query) ||
        song.label?.toLowerCase().includes(query);
      const artistMatch = song.artists?.toLowerCase().includes(query);

      return songMatch || artistMatch;
    });
  }, [songs, chartSearchQuery]);

  // Función para alternar la visibilidad de la barra de búsqueda
  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setChartSearchQuery('');
    }
  };

  // Enfocar el input cuando se muestra la barra
  useEffect(() => {
    if (showSearchBar) {
      const searchInput = document.querySelector('input[placeholder="Buscar artista o canción en los charts..."]') as HTMLInputElement;
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  }, [showSearchBar]);

  // Función para filtrar opciones basado en la búsqueda
  const getFilteredOptions = (options: any[], searchQuery: string, type: 'country' | 'format' | 'city') => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase().trim();
    return options.filter(option => {
      if (type === 'country') {
        return option.country_name?.toLowerCase().includes(query) ||
          option.country?.toLowerCase().includes(query) ||
          option.description?.toLowerCase().includes(query);
      } else if (type === 'format') {
        return option.format?.toLowerCase().includes(query);
      } else if (type === 'city') {
        return option.city_name?.toLowerCase().includes(query);
      }
      return false;
    });
  };

  // Función para manejar la selección
  const handleOptionSelect = (value: string, type: 'country' | 'format' | 'city') => {
    if (type === 'country') {
      setSelectedCountry(value);
    } else if (type === 'format') {
      setSelectedFormat(value);
    } else if (type === 'city') {
      setSelectedCity(value);
    }
    setOpenDropdown(null);
    setDropdownSearch('');
  };

  // Efecto para manejar la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setDropdownSearch('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  //Debouncing para limitar las busquedas por API al usuario
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  }
  // Usar el hook de debounce con 300ms de delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);




  // Check for existing Spotify connection
  useEffect(() => {
    const savedToken = window.localStorage.getItem('spotify_access_token');
    const tokenExpiry = window.localStorage.getItem('spotify_token_expiry');

    if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      setAccessToken(savedToken);
      setIsConnected(true);
    }
  }, []);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await digitalLatinoApi.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los países. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoadingCountries(false);
    }

  };
  //ESTE FETCH PARA ASIGNAR EL PERIOD
  const fetchSongs = async () => {
    const data = await callApi(async () => {
      if (!selectedCountry) {
        setSongs([]);
        return;
      }

      try {
        setLoadingSongs(true);
        if (Number.isNaN(selectedCity)) setSelectedCity('0');
        const response = await digitalLatinoApi.getChartDigital(parseInt(selectedFormat), parseInt(selectedCountry), (selectedPeriod), parseInt(selectedCity));
        setSongs(response.data);

      } catch (error) {
        console.error('Error fetching songs:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las canciones. Intenta de nuevo.",
          variant: "destructive"
        });
        setSongs([]);
      } finally {
        setLoadingSongs(false);
      }
    });
  };

  // Fetch countries from API
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch formats when country changes
  useEffect(() => {
    const fetchFormats = async () => {
      if (!selectedFormat) {
        setFormats([]);
        return;
      }

      try {
        setLoadingFormats(true);
        const response = await digitalLatinoApi.getFormatsByCountry(parseInt(selectedCountry));
        setFormats(response.data);

        // Set General as default if available, otherwise set first format
        const generalFormat = response.data.find(format => format.format.toLowerCase() === 'general');
        if (generalFormat) {
          setSelectedFormat(generalFormat.id.toString());
        } else if (response.data.length > 0) {
          setSelectedFormat(response.data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching formats:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los géneros. Intenta de nuevo.",
          variant: "destructive"
        });
        setFormats([]);
      } finally {
        setLoadingFormats(false);
      }
    };

    fetchFormats();
  }, [selectedCountry, toast]);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) {
        setCities([]);
        setSelectedCity('0');
        return;
      }

      try {
        setLoadingCities(true);
        const response = await digitalLatinoApi.getCitiesByCountry(parseInt(selectedCountry));
        setCities(response.data);
        setSelectedCity('0'); // Reset to "All" when country changes
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las ciudades. Intenta de nuevo.",
          variant: "destructive"
        });
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedCountry, toast]);


  // Fetch Songs when country changes
  useEffect(() => {


    fetchSongs();
  }, [selectedCountry, selectedFormat, selectedCity, selectedPeriod, toast]);

  /*
  useEffect(() => {
    console.log('Run spotify api to update images for each song ' +accessToken); 
    const updateSongsWithImages = async () => {
      const updatedSongs = await Promise.all(
        songs.map(async song => {
          try {
            // ✅ Extraer el ID del track desde la URL
            //const idMatch = song.url.match(/track\/([a-zA-Z0-9]+)/);
            //if (!idMatch) return song;

            const spotifyId = song.spotify_id;//idMatch[1];

            // ✅ Llamada a la API de Spotify
            const res = await fetch(
              `https://api.spotify.com/v1/tracks/${spotifyId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` }
              }
            );
            const data = await res.json();

            // ✅ Devolver el objeto Song con la portada en avatar
            return { ...song, avatar: data.album.images[0].url };
          } catch (err) {
            console.error("Error con la canción:", song.song, err);
            return song; // Devolver igual en caso de error
          }
        })
      );
      console.log('Update image for each song'); 
      setSongs(updatedSongs);
    };

    updateSongsWithImages();
  }, [selectedSong, toast] );
  */

  /* // Fetch Songs when format changes
  useEffect(() => {
    console.log("start loading chart :" + selectedFormat);
    if (selectedFormat !== '0') {
      const fetchSongs = async () => {
        if (!selectedCountry) {
          setSongs([]);
          return;
        }

        try {
          setLoadingSongs(true);
          if (Number.isNaN(selectedFormat)) setSelectedFormat('0');
          const response = await digitalLatinoApi.getChartDigital(parseInt(selectedFormat), parseInt(selectedCountry), "C", 0);
          setSongs(response.data);

        } catch (error) {
          console.error('Error fetching songs:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las canciones. Intenta de nuevo.",
            variant: "destructive"
          });
          setSongs([]);
        } finally {
          setLoadingSongs(false);
        }
      };

      fetchSongs();
    }

  }, [selectedFormat, toast]); */



  // Handle Spotify OAuth callback
  useEffect(() => {
    const handleSpotifyCallback = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      const expiresIn = params.get('expires_in');
      const state = params.get('state');
      const storedState = window.localStorage.getItem('spotify_auth_state');

      if (token && state === storedState) {
        const expiryTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);

        window.localStorage.setItem('spotify_access_token', token);
        window.localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        window.localStorage.removeItem('spotify_auth_state');

        setAccessToken(token);
        setIsConnected(true);
        console.log('Spotify connected, token saved.', token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        toast({
          title: "Conectado exitosamente",
          description: "Ya puedes buscar artistas en Spotify."
        });
      }
    };

    handleSpotifyCallback();
  }, [toast]);

  // Connect to Spotify with OAuth
  const connectToSpotify = () => {
    console.log('connectToSpotify called');
    // Generate a random state for security
    const state = Math.random().toString(36).substring(2, 15);
    window.localStorage.setItem('spotify_auth_state', state);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', DEFAULT_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', window.location.origin);
    authUrl.searchParams.append('scope', SPOTIFY_CONFIG.scope);
    authUrl.searchParams.append('state', state);

    console.log('Redirecting to Spotify auth:', authUrl.toString());
    // Open Spotify auth in the same window
    window.location.href = authUrl.toString();
  };

  const toggleRow = (index: number) => {
    console.log('Toggling row:', index);
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handlePromote = (artist: string, track: string, coverUrl?: string, artistImageUrl?: string) => {
    const params = new URLSearchParams({
      artist,
      track,
      ...(coverUrl && { coverUrl }),
      ...(artistImageUrl && { artistImageUrl })
    });

    navigate(`/campaign?${params.toString()}`);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedCity(''); // Reset city when country changes
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setShowGenreOverlay(true);
    setSelectedCountry(e.target.value);
    setSelectedCity('0'); // Reset city when country changes
    // Resetear el select a su valor inicial
    //e.target.selectedIndex = 0;

  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);

    if (cityId && cityId !== '0') {
      // Find the selected city object
      const selectedCityObj = cities.find(city => city.id.toString() === cityId);
      const cityName = selectedCityObj?.city_name || '';
      // Redirect to campaign with the selected city
      //navigate(`/campaign?city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(selectedCountry)}`);
      setSelectedCity(cityId);
    }
  };

  const handleCrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    setShowCrgOverlay(true);
    // Resetear el select a su valor inicial
    e.target.selectedIndex = 0;
  };

  /* const handlePlayPreview = useCallback((trackRank: number, audioUrl: string) => {
    console.log('handlePlayPreview called for rank:', audioUrl);
    if (currentlyPlaying === trackRank) {
      // Pausar audio actual
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentlyPlaying(null);
    } else {
      // Pausar cualquier audio que esté reproduciéndose
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Crear nuevo audio (simulado para demo)
      const audio = new Audio();
      // En producción aquí usarías la URL real del preview de Spotify
      // audio.src = audioUrl;

      // Para demo, simular reproducción
      audioRef.current = audio;
      setCurrentlyPlaying(trackRank);

      // Simular que el audio termina después de 30 segundos
      setTimeout(() => {
        setCurrentlyPlaying(null);
        audioRef.current = null;
      }, 30000);
    }
  }, [currentlyPlaying]); */


  const handlePlayPreview = useCallback((trackRank: number, audioUrl: string) => {
    console.log("handlePlayPreview called for:", trackRank, audioUrl);

    // Si la misma canción está sonando, pausar y limpiar
    if (currentlyPlaying === trackRank) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // reinicia a inicio
        audioRef.current = null;
      }
      setCurrentlyPlaying(null);
      return;
    }

    // Si hay una canción sonando, detenerla
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Crear y reproducir nueva canción
    const audio = new Audio(audioUrl); // aquí se asigna la URL real del MP3
    audioRef.current = audio;

    // Cuando termine el audio, limpiar estado
    audio.addEventListener("ended", () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    // Intentar reproducir (algunos navegadores requieren interacción de usuario)
    audio.play().then(() => {
      setCurrentlyPlaying(trackRank);
    }).catch((err) => {
      console.error("Error al reproducir el audio:", err);
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

  }, [currentlyPlaying]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-300/15 to-gray-400/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-slate-400/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gray-300/10 to-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header para usuarios loggeados habilitar despues del login */}
      {/*
      {user && (
        <div className="relative z-10 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h2 className="font-bold text-green-800">
                  {user.email === 'garciafix4@gmail.com' ? '🎯 Demo Exclusivo Activo' : '🎵 Acceso Premium Desbloqueado'}
                </h2>
                <p className="text-sm text-green-600">
                  {user.email === 'garciafix4@gmail.com'
                    ? 'Tienes acceso completo + estadísticas de campaña en tiempo real'
                    : `Top 40 completo desbloqueado • ${user.email}`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-green-700">Top 40 Completo</div>
              <div className="text-xs text-green-600">Todos los géneros</div>
            </div>
          </div>
        </div>
      )}*/}


      <div className="relative z-10 mx-auto max-w-6xl px-4 py-2">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-0 border-b border-white/20 pb-6 bg-white/60 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-lg relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-slate-400 to-blue-500 rounded-2xl opacity-15 blur-lg"></div>
              </div>
            </div>
          </div>

          {/* Filtros Profesionales */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 relative z-30">
            {/* Filtro por País/Región */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-pink-600 uppercase tracking-wide flex items-center gap-2">
                <span>🌎</span> País/Región
              </label>
              <select
                className="w-full rounded-2xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-800 shadow-lg focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={loadingCountries}
              >
                {loadingCountries ? (
                  <option value="">Cargando países...</option>
                ) : (
                  <>
                    <option value="">Selecciona un país</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id.toString()}>
                        {country.country || country.description} ({country.country_name})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Filtro por Género */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                <span>📊</span> Género
              </label>
              <select
                className="w-full rounded-2xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-800 shadow-lg focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                disabled={loadingFormats || !selectedCountry}
              >
                {loadingFormats ? (
                  <option value="">Cargando géneros...</option>
                ) : !selectedCountry ? (
                  <option value="">Selecciona un país primero</option>
                ) : (
                  <>
                    {formats.map((format) => (
                      <option key={format.id} value={format.id.toString()}>
                        {format.format}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>


            {/* Filtro por Ciudad */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-2">
                <span>🏙️</span> Ciudad Target
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(openDropdown === 'city' ? null : 'city');
                    setDropdownSearch('');
                  }}
                  className="w-full rounded-2xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-800 shadow-lg focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-left flex justify-between items-center"
                  disabled={loadingCities || !selectedCountry}
                >
                  <span className="truncate">
                    {loadingCities ? 'Cargando...' :
                      !selectedCountry ? 'Selecciona país primero' :
                        selectedCity !== '0' && cities.length > 0
                          ? cities.find(c => c.id.toString() === selectedCity)?.city_name || 'Todas las ciudades'
                          : 'Todas las ciudades'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'city' && cities.length > 0 && (
                  <div className="absolute z-[9999] mt-1 w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-60 overflow-hidden transform translate-z-0 will-change-transform">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar ciudad..."
                          className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {/* Opción "Todas las ciudades" */}
                      <button
                        onClick={() => handleOptionSelect('0', 'city')}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-orange-50 transition-colors ${selectedCity === '0'
                          ? 'bg-orange-100 text-orange-700 font-semibold'
                          : 'text-gray-700'
                          }`}
                      >
                        🎯 Todas las ciudades
                      </button>

                      {getFilteredOptions(cities, dropdownSearch, 'city').map((city) => (
                        <button
                          key={city.id}
                          onClick={() => handleOptionSelect(city.id.toString(), 'city')}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-orange-50 transition-colors ${selectedCity === city.id.toString()
                            ? 'bg-orange-100 text-orange-700 font-semibold'
                            : 'text-gray-700'
                            }`}
                        >
                          🎯 {city.city_name}
                        </button>
                      ))}

                      {getFilteredOptions(cities, dropdownSearch, 'city').length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No se encontraron ciudades
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filtro por Periodo Musical */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-purple-600 uppercase tracking-wide flex items-center gap-2">
                <span>⏰</span> Periodo Musical
              </label>
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-800 shadow-lg focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 cursor-pointer"
                >
                  <option value="N">🎵 Todos los periodos</option>
                  <option value="C">🟢 Current - Novedades</option>
                  <option value="R">🟡 Recurrent - 1-3 años</option>
                  <option value="G">🟠 Gold - Más de 3 años</option>
                </select>
              </div>
            </div>
          </div>
        </div>



        {/* Lista de Charts */}
        <div className="mb-8 flex flex-col gap-6 border-b border-white/20 pb-6 bg-white/60 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-lg relative">
          {/* Fab button de MUI para buscar */}
          <div className="absolute -top-4 -right-4 z-20">
            <Fab
              size="medium"
              color="primary"
              aria-label="search"
              onClick={toggleSearchBar}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',

              }}
            >
              {showSearchBar ? (
                <Minus className="w-6 h-6 text-white" />
              ) : (
                <Search className="w-6 h-6 text-white" />
              )}
            </Fab>
          </div>

          <div className="space-y-0.5">
            {/* Buscador dentro de charts funcional */}
            {showSearchBar && (
              <div className="mb-6 animate-in fade-in duration-300">
                <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-blue-500" />
                    <input
                      type="text"
                      placeholder="Buscar artista o canción en los charts..."
                      className="flex-1 bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-sm font-medium text-slate-800"
                      value={chartSearchQuery}
                      onChange={(e) => setChartSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {chartSearchQuery && (
                      <button
                        onClick={() => setChartSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Limpiar búsqueda"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Contador de resultados */}
                  {chartSearchQuery && (
                    <div className="mt-2 text-xs text-slate-600 flex justify-between items-center px-1">
                      <span className="font-medium">
                        {filteredSongs.length} de {songs.length} canciones encontradas
                      </span>
                      {filteredSongs.length === 0 && (
                        <span className="text-orange-600 font-medium">
                          No hay resultados
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lista de caciones filtradas */}
            {loadingSongs ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-slate-600">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Cargando canciones...
                </div>
              </div>
            ) : filteredSongs.length === 0 && chartSearchQuery ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  No hay canciones que coincidan con "<strong>{chartSearchQuery}</strong>"
                </p>
                <button
                  onClick={() => setChartSearchQuery('')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas las canciones
                </button>
              </div>
            ) : (
              filteredSongs.map((row, index) => (
                <div
                  key={`${row.cs_song}-${index}`}
                  className="group bg-white/50 backdrop-blur-lg rounded-2xl shadow-md border border-white/30 overflow-hidden hover:shadow-lg hover:bg-white/60 transition-all duration-300 hover:scale-[1.005]"
                >
                  <div className="grid grid-cols-9 items-center gap-3 px-6 py-2">
                    {/* Rank */}
                    <div className="col-span-1 flex items-center gap-2">
                      <div className="relative group/rank">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 to-gray-300/40 rounded-lg blur-sm group-hover/rank:blur-md transition-all"></div>
                        <div className="relative bg-white/95 backdrop-blur-sm border border-white/70 rounded-lg w-11 h-11 flex items-center justify-center shadow-sm group-hover/rank:shadow-md transition-all">
                          <span className="text-lg font-bold bg-gradient-to-br from-slate-700 to-gray-800 bg-clip-text text-transparent">
                            {row.rk}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="relative group-hover:scale-105 transition-transform">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                        <div className="relative">
                          <Avatar className="relative h-14 w-14 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                            <AvatarImage
                              src={row.spotifyid}
                              alt={row.spotifyid}
                              className="rounded-lg object-cover"
                            />
                            <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-sm">
                              {row.artists.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(row.rk, `https://audios.monitorlatino.com/Iam/${row.entid}.mp3`);
                              }}
                              className="w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg"
                              aria-label={`Reproducir preview de ${row.cs_song}`}
                            >
                              {currentlyPlaying === row.rk ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3 ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 truncate group-hover:text-purple-600 transition-colors leading-tight">
                          {row.song}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 truncate">
                          {row.artists}
                        </p>
                      </div>
                    </div>

                    {/* Digital Score */}
                    <div className="col-span-2 text-right">
                      <div className="relative bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-2.5 shadow-sm group-hover:shadow-md group-hover:bg-white/90 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wide">Score</span>
                          </div>
                          <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold bg-gradient-to-br from-slate-800 to-gray-900 bg-clip-text text-transparent">
                            {row.score}
                          </div>
                          <button
                            onClick={() => toggleRow(index)}
                            className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-white/50 text-slate-600 p-1 rounded-lg text-xs transition-all duration-200 hover:scale-105 shadow-sm ml-2"
                          >
                            {expandedRows.has(index) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedRows.has(index) && (
                    <div className="bg-white/30 backdrop-blur-sm px-8 pb-6">
                      <ExpandRow
                        row={row}
                        onPromote={() => handlePromote(row.artists, row.song, row.avatar, row.url)}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        {/* Sección para mostrar más del Top 10 - Solo si NO está autenticado */}
        {!user && (
          <div className="mt-8 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/50 rounded-3xl p-8 shadow-lg">
            <div className="text-center space-y-6">
              <div className="flex justify-center items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    ¿Quieres ver más allá del Top 10?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Accede a rankings completos y métricas avanzadas
                  </p>
                </div>
              </div>

              {/* Canciones borrosas simulando contenido bloqueado */}
              <div className="grid gap-2 opacity-50 pointer-events-none">
                {[
                  { rank: 11, artist: "Rauw Alejandro", track: "Touching The Sky", streams: "2.1M" },
                  { rank: 12, artist: "Anuel AA", track: "Mcgregor", streams: "1.9M" },
                  { rank: 13, artist: "J Balvin", track: "Doblexxó", streams: "1.8M" }
                ].map((song) => (
                  <div key={song.rank} className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{song.rank}</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-700">{song.track}</div>
                      <div className="text-sm text-gray-500">{song.artist}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">{song.streams}</div>
                  </div>
                ))}
              </div>

              {/* Dos ofertas principales con la misma jerarquía */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Oferta 1: Charts Completos */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Trophy className="w-6 h-6 text-purple-600" />
                      <span className="font-bold text-purple-800 text-lg">Ver Top 40 Completo</span>
                    </div>
                    <p className="text-sm text-purple-600 mb-4">
                      Accede a rankings completos y estadísticas avanzadas
                    </p>

                    {/* Precio */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">$</span>
                        </div>
                        <span className="font-bold text-amber-800 text-sm">Oferta Limitada</span>
                      </div>
                      <div className="text-center">
                        <span className="line-through text-amber-600 text-sm">$49 USD/mes</span>
                        <span className="ml-2 text-xl font-bold text-amber-800">$14.99 USD/mes</span>
                        <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">70% OFF</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      Acceder Ahora
                    </Button>
                  </div>
                </div>

                {/* Oferta 2: Campaña Promocional */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Zap className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-green-800 text-lg">Campaña Promocional</span>
                    </div>
                    <p className="text-sm text-green-600 mb-4">
                      Incluye pitching, promociones en redes sociales, analytics avanzados y reportes en tiempo real
                    </p>

                    {/* Precio */}
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">🚀</span>
                        </div>
                        <span className="font-bold text-green-800 text-sm">Promoción Profesional</span>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-green-800">Desde $750 USD</span>
                        <span className="text-sm text-green-600 block">campaña completa</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Crear Campaña
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Definición del Score Digital */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">
                ¿Qué es el Score Digital?
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                El <strong>Score Digital</strong> es una métrica del 1 al 100 que evalúa el nivel de exposición de una canción basado en streams, playlists, engagement social y distribución geográfica.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">0-25: Baja</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">26-50: Media</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">51-75: Alta</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">76-100: Máxima</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        !user && (showGenreOverlay || showCrgOverlay) && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">
                {showGenreOverlay ? 'Filtros por Género' : 'Filtros por Plataforma'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Esta función es parte de las herramientas avanzadas. Activa una campaña para desbloquearla.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-2">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-bold text-foreground">Premium</div>
                    <div className="text-xs text-muted-foreground mb-1">Solo Charts & Analytics</div>
                    <div className="text-sm font-bold text-foreground">$14.99/mes</div>
                  </div>

                  <button
                    onClick={() => {
                      // TODO: Integrar con Stripe cuando esté listo
                      console.log('Redirect to premium subscription');
                      setShowGenreOverlay(false);
                      setShowCrgOverlay(false);
                    }}
                    className="w-full bg-gradient-primary text-white px-4 py-2 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 text-sm"
                  >
                    Suscribirse
                  </button>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-cta-primary/30 rounded-xl p-4 text-center relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cta-primary to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      INCLUYE TODO
                    </span>
                  </div>

                  <div className="w-8 h-8 mx-auto bg-gradient-to-r from-cta-primary to-orange-500 rounded-full flex items-center justify-center mb-2 mt-1">
                    <span className="text-white font-bold text-sm">🚀</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-bold text-foreground">Campaña Completa</div>
                    <div className="text-xs text-muted-foreground mb-1">Premium + Promoción</div>
                    <div className="text-sm font-bold text-foreground">Desde $750</div>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/campaign');
                      setShowGenreOverlay(false);
                      setShowCrgOverlay(false);
                    }}
                    className="w-full bg-gradient-to-r from-cta-primary to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 text-sm"
                  >
                    Crear Campaña
                  </button>
                </div>
              </div>
              <button onClick={() => { setShowGenreOverlay(false); setShowCrgOverlay(false); }} className="w-full px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm">
                Cerrar
              </button>
            </div>
          </div>
        )
      }
      {/* Overlay global mientras se carga */}
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div >
  );
}