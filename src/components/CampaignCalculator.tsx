import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/social-icons';
import { CampaignMetrics, GenreDefaults, SpotifyArtist } from '@/types/spotify';
import { Calculator, TrendingUp, Users, MousePointer, Edit3, Calendar, DollarSign, Music, Plus, Minus, MapPin, UserCheck, Search, X, Check, ChevronsUpDown } from 'lucide-react';
import { loadLatamCities, buildCitiesIndex, searchCitiesLocal, searchCitiesRemote, type CityEntry } from '@/lib/citySearch';
import { ensureSpotifyToken, searchSpotifyArtistsAPI, searchITunesArtistsAPI } from '@/lib/spotify';

interface CampaignCalculatorProps {
  onMetricsChange: (metrics: CampaignMetrics & { days: number; platforms: string[]; locations?: string[]; artists?: string[] }) => void;
}

const GENRE_DEFAULTS: Record<string, GenreDefaults> = {
  latin: { label: 'Música Latina', baseCPC: 0.15, baseCPA: 0.85, scalingFactor: 0.92 },
  reggaeton: { label: 'Reggaetón', baseCPC: 0.12, baseCPA: 0.75, scalingFactor: 0.90 },
  regional: { label: 'Regional Mexicano', baseCPC: 0.18, baseCPA: 0.95, scalingFactor: 0.94 },
  pop: { label: 'Pop Latino', baseCPC: 0.20, baseCPA: 1.10, scalingFactor: 0.95 },
};

const SOCIAL_PLATFORMS = {
  facebook: { label: 'Facebook', icon: FacebookIcon },
  instagram: { label: 'Instagram', icon: InstagramIcon },
  tiktok: { label: 'TikTok', icon: TikTokIcon },
};

// Comprehensive list of Latin American countries + Spain (for country mode)
const COUNTRIES = [
  { id: 'mexico', name: 'México', flag: '🇲🇽' },
  { id: 'colombia', name: 'Colombia', flag: '🇨🇴' },
  { id: 'argentina', name: 'Argentina', flag: '🇦🇷' },
  { id: 'peru', name: 'Perú', flag: '🇵🇪' },
  { id: 'venezuela', name: 'Venezuela', flag: '🇻🇪' },
  { id: 'chile', name: 'Chile', flag: '🇨🇱' },
  { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨' },
  { id: 'bolivia', name: 'Bolivia', flag: '🇧🇴' },
  { id: 'paraguay', name: 'Paraguay', flag: '🇵🇾' },
  { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾' },
  { id: 'costa_rica', name: 'Costa Rica', flag: '🇨🇷' },
  { id: 'panama', name: 'Panamá', flag: '🇵🇦' },
  { id: 'nicaragua', name: 'Nicaragua', flag: '🇳🇮' },
  { id: 'honduras', name: 'Honduras', flag: '🇭🇳' },
  { id: 'el_salvador', name: 'El Salvador', flag: '🇸🇻' },
  { id: 'guatemala', name: 'Guatemala', flag: '🇬🇹' },
  { id: 'cuba', name: 'Cuba', flag: '🇨🇺' },
  { id: 'dominican_republic', name: 'República Dominicana', flag: '🇩🇴' },
  { id: 'puerto_rico', name: 'Puerto Rico', flag: '🇵🇷' },
  { id: 'spain', name: 'España', flag: '🇪🇸' },
  { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸' },
  { id: 'brazil', name: 'Brasil', flag: '🇧🇷' },
];

// Local fallback artist search (static list) when Spotify no está conectado
// Local fallback artist data
const LOCAL_ARTISTS: SpotifyArtist[] = [
  // Reggaetón & Urban Latino
  { id: 'bad_bunny', name: 'Bad Bunny', images: [], external_urls: { spotify: '' } },
  { id: 'karol_g', name: 'Karol G', images: [], external_urls: { spotify: '' } },
  { id: 'j_balvin', name: 'J Balvin', images: [], external_urls: { spotify: '' } },
  { id: 'maluma', name: 'Maluma', images: [], external_urls: { spotify: '' } },
  { id: 'ozuna', name: 'Ozuna', images: [], external_urls: { spotify: '' } },
  { id: 'anuel_aa', name: 'Anuel AA', images: [], external_urls: { spotify: '' } },
  { id: 'daddy_yankee', name: 'Daddy Yankee', images: [], external_urls: { spotify: '' } },
  { id: 'nicky_jam', name: 'Nicky Jam', images: [], external_urls: { spotify: '' } },
  { id: 'arcangel', name: 'Arcángel', images: [], external_urls: { spotify: '' } },
  { id: 'farruko', name: 'Farruko', images: [], external_urls: { spotify: '' } },
  { id: 'wisin', name: 'Wisin', images: [], external_urls: { spotify: '' } },
  { id: 'yandel', name: 'Yandel', images: [], external_urls: { spotify: '' } },
  { id: 'don_omar', name: 'Don Omar', images: [], external_urls: { spotify: '' } },
  // Pop Latino & Mainstream
  { id: 'rosalia', name: 'Rosalía', images: [], external_urls: { spotify: '' } },
  { id: 'sebastian_yatra', name: 'Sebastián Yatra', images: [], external_urls: { spotify: '' } },
  { id: 'camilo', name: 'Camilo', images: [], external_urls: { spotify: '' } },
  { id: 'manuel_turizo', name: 'Manuel Turizo', images: [], external_urls: { spotify: '' } },
  { id: 'rauw_alejandro', name: 'Rauw Alejandro', images: [], external_urls: { spotify: '' } },
  { id: 'myke_towers', name: 'Myke Towers', images: [], external_urls: { spotify: '' } },
  { id: 'feid', name: 'Feid', images: [], external_urls: { spotify: '' } },
  { id: 'becky_g', name: 'Becky G', images: [], external_urls: { spotify: '' } },
  { id: 'aitana', name: 'Aitana', images: [], external_urls: { spotify: '' } },
  { id: 'danna_paola', name: 'Danna Paola', images: [], external_urls: { spotify: '' } },
  { id: 'tini', name: 'TINI', images: [], external_urls: { spotify: '' } },
  // Regional Mexicano
  { id: 'peso_pluma', name: 'Peso Pluma', images: [], external_urls: { spotify: '' } },
  { id: 'grupo_frontera', name: 'Grupo Frontera', images: [], external_urls: { spotify: '' } },
  { id: 'christian_nodal', name: 'Christian Nodal', images: [], external_urls: { spotify: '' } },
  { id: 'banda_ms', name: 'Banda MS', images: [], external_urls: { spotify: '' } },
  { id: 'calibre_50', name: 'Calibre 50', images: [], external_urls: { spotify: '' } },
  { id: 'la_adictiva', name: 'La Adictiva', images: [], external_urls: { spotify: '' } },
  { id: 'eslabon_armado', name: 'Eslabón Armado', images: [], external_urls: { spotify: '' } },
  { id: 'fuerza_regida', name: 'Fuerza Regida', images: [], external_urls: { spotify: '' } },
  // Rock & Alternative en Español
  { id: 'mana', name: 'Maná', images: [], external_urls: { spotify: '' } },
  { id: 'soda_stereo', name: 'Soda Stereo', images: [], external_urls: { spotify: '' } },
  { id: 'heroes_del_silencio', name: 'Héroes del Silencio', images: [], external_urls: { spotify: '' } },
  { id: 'jarabe_de_palo', name: 'Jarabe de Palo', images: [], external_urls: { spotify: '' } },
  { id: 'cafe_tacvba', name: 'Café Tacvba', images: [], external_urls: { spotify: '' } },
  // Clásicos & Salsa
  { id: 'marc_anthony', name: 'Marc Anthony', images: [], external_urls: { spotify: '' } },
  { id: 'victor_manuelle', name: 'Víctor Manuelle', images: [], external_urls: { spotify: '' } },
  { id: 'gilberto_santa_rosa', name: 'Gilberto Santa Rosa', images: [], external_urls: { spotify: '' } },
  { id: 'la_india', name: 'La India', images: [], external_urls: { spotify: '' } },
  { id: 'willie_colon', name: 'Willie Colón', images: [], external_urls: { spotify: '' } },
  // Internacionales Populares
  { id: 'taylor_swift', name: 'Taylor Swift', images: [], external_urls: { spotify: '' } },
  { id: 'ed_sheeran', name: 'Ed Sheeran', images: [], external_urls: { spotify: '' } },
  { id: 'billie_eilish', name: 'Billie Eilish', images: [], external_urls: { spotify: '' } },
  { id: 'dua_lipa', name: 'Dua Lipa', images: [], external_urls: { spotify: '' } },
  { id: 'ariana_grande', name: 'Ariana Grande', images: [], external_urls: { spotify: '' } },
  { id: 'the_weeknd', name: 'The Weeknd', images: [], external_urls: { spotify: '' } },
  { id: 'drake', name: 'Drake', images: [], external_urls: { spotify: '' } },
  { id: 'post_malone', name: 'Post Malone', images: [], external_urls: { spotify: '' } },
];

const searchLocalArtistsSync = (query: string): SpotifyArtist[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const qn = q.normalize('NFD').replace(/[^a-z0-9\s]/g, '').replace(/[\u0300-\u036f]/g, '');
  const filtered = LOCAL_ARTISTS.filter((artist) => {
    const name = artist.name.toLowerCase();
    const namen = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes(q) || namen.includes(qn);
  });
  filtered.sort((a, b) => {
    const aExact = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bExact = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aExact - bExact || a.name.localeCompare(b.name);
  });
  return filtered.slice(0, 8);
};

const searchLocalArtists = async (query: string): Promise<SpotifyArtist[]> => {
  return Promise.resolve(searchLocalArtistsSync(query));
};

export function CampaignCalculator({ onMetricsChange }: CampaignCalculatorProps) {
  const [dailyBudget, setDailyBudget] = useState(50);
  const [days, setDays] = useState(30);
  const [genre, setGenre] = useState('latin');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<SpotifyArtist[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [locationTargetType, setLocationTargetType] = useState<'countries' | 'cities'>('countries');
  
  // Location autocomplete states
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  
  // Artist search states
  const [artistOpen, setArtistOpen] = useState(false);
  const [artistSearch, setArtistSearch] = useState('');
  const [spotifyArtists, setSpotifyArtists] = useState<SpotifyArtist[]>([]);
  const spotifyArtistCache = React.useRef<Map<string, SpotifyArtist[]>>(new Map());
  const itunesArtistCache = React.useRef<Map<string, SpotifyArtist[]>>(new Map());
  const latestArtistQueryRef = React.useRef('');

  // Cities data and search index
  const [citiesData, setCitiesData] = useState<{ cities: CityEntry[]; searchIndex: any }>({ cities: [], searchIndex: null });
  const [cityResults, setCityResults] = useState<CityEntry[]>([]);
  const [isCitySearching, setIsCitySearching] = useState(false);
  const latestCityQueryRef = React.useRef('');

  // Load cities data on mount
  useEffect(() => {
    const cities = loadLatamCities();
    const { fuse, byId } = buildCitiesIndex(cities);
    setCitiesData({ cities, searchIndex: { fuse, byId } });
    setCityResults(cities.slice(0, 8));
  }, []);

  // Debounced city search (local sync first, then remote cached)
  useEffect(() => {
    const q = locationSearch.trim();
    latestCityQueryRef.current = q;

    if (!q) {
      setIsCitySearching(false);
      setCityResults(citiesData.cities.slice(0, 8));
      return;
    }

    // Local first (instant)
    const local = searchCitiesLocal(q, citiesData.searchIndex?.fuse, citiesData.cities.length ? citiesData.cities : undefined);
    setCityResults(local);

    // If we already have enough results, skip remote
    if (local.length >= 8) {
      setIsCitySearching(false);
      return;
    }

    setIsCitySearching(true);
    const t = setTimeout(async () => {
      const remote = await searchCitiesRemote(q);
      if (latestCityQueryRef.current !== q) return; // stale
      // Merge unique
      const seen = new Set(local.map((c) => c.id));
      const merged = [...local];
      for (const r of remote) {
        if (!seen.has(r.id) && merged.length < 8) merged.push(r);
      }
      setCityResults(merged);
      setIsCitySearching(false);
    }, 200);

    return () => clearTimeout(t);
  }, [locationSearch, citiesData]);

  // Debounced search for artists - local first (instant), then Spotify/iTunes with cache
  useEffect(() => {
    const q = artistSearch.trim();
    latestArtistQueryRef.current = q;
    if (q.length < 1) {
      setSpotifyArtists([]);
      return;
    }

    // Local first (sync)
    const local = searchLocalArtistsSync(q);
    setSpotifyArtists(local);

    const key = q.toLowerCase();
    const timer = setTimeout(async () => {
      // Try Spotify (if token)
      try {
        const token = ensureSpotifyToken();
        if (token) {
          let results = spotifyArtistCache.current.get(key);
          if (!results) {
            results = await searchSpotifyArtistsAPI(q);
            spotifyArtistCache.current.set(key, results);
          }
          if (latestArtistQueryRef.current === q && results.length > 0) {
            setSpotifyArtists(results);
            return;
          }
        }
      } catch {}

      // Try iTunes
      try {
        let itunes = itunesArtistCache.current.get(key);
        if (!itunes) {
          itunes = await searchITunesArtistsAPI(q);
          itunesArtistCache.current.set(key, itunes);
        }
        if (latestArtistQueryRef.current === q && itunes.length > 0) {
          setSpotifyArtists(itunes);
          return;
        }
      } catch {}

      // If neither returned and no local results
      if (latestArtistQueryRef.current === q && local.length === 0) {
        setSpotifyArtists([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [artistSearch]);

  // Metrics calculator
  const calculateMetrics = (budget: number, duration: number, selectedGenre: string, platforms: string[]): CampaignMetrics => {
    const platformMultiplier = platforms.length;
    const totalBudget = budget * duration * platformMultiplier;
    const genreData = GENRE_DEFAULTS[selectedGenre];

    const scaleFactor = Math.pow(genreData.scalingFactor, Math.log10(totalBudget / 100));
    const cpc = genreData.baseCPC * scaleFactor;
    const cpa = genreData.baseCPA * scaleFactor;

    const clicks = Math.floor(totalBudget / cpc);
    const conversions = Math.floor(clicks * 0.12);
    const streams = Math.floor(conversions * 0.85);

    return { cpc, cpa, clicks, conversions, streams, totalBudget };
  };

  // Location handlers
  const handleLocationAdd = (location: any) => {
    const locationId = location.id;
    if (!selectedLocations.includes(locationId)) {
      setSelectedLocations(prev => [...prev, locationId]);
    }
    setLocationSearch('');
    setLocationOpen(false);
  };

  const handleLocationRemove = (locationId: string) => {
    setSelectedLocations(prev => prev.filter(l => l !== locationId));
  };

  // Artist handlers
  const handleArtistAdd = (artist: SpotifyArtist) => {
    if (!selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists(prev => [...prev, artist]);
    }
    setArtistSearch('');
    setArtistOpen(false);
  };

  const handleArtistRemove = (artistId: string) => {
    setSelectedArtists(prev => prev.filter(a => a.id !== artistId));
  };

  const handleBudgetIncrease = () => {
    const newBudget = Math.min(dailyBudget + 5, 1000);
    setDailyBudget(newBudget);
    const metrics = calculateMetrics(newBudget, days, genre, selectedPlatforms);
    onMetricsChange({ ...metrics, days, platforms: selectedPlatforms, locations: selectedLocations, artists: selectedArtists.map(a => a.name) });
  };

  const handleBudgetDecrease = () => {
    const newBudget = Math.max(dailyBudget - 5, 25);
    setDailyBudget(newBudget);
    const metrics = calculateMetrics(newBudget, days, genre, selectedPlatforms);
    onMetricsChange({ ...metrics, days, platforms: selectedPlatforms, locations: selectedLocations, artists: selectedArtists.map(a => a.name) });
  };

  const handleDaysIncrease = () => {
    const newDays = Math.min(days + 1, 90);
    setDays(newDays);
    const metrics = calculateMetrics(dailyBudget, newDays, genre, selectedPlatforms);
    onMetricsChange({ ...metrics, days: newDays, platforms: selectedPlatforms, locations: selectedLocations, artists: selectedArtists.map(a => a.name) });
  };

  const handleDaysDecrease = () => {
    const newDays = Math.max(days - 1, 30);
    setDays(newDays);
    const metrics = calculateMetrics(dailyBudget, newDays, genre, selectedPlatforms);
    onMetricsChange({ ...metrics, days: newDays, platforms: selectedPlatforms, locations: selectedLocations, artists: selectedArtists.map(a => a.name) });
  };

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre);
    const metrics = calculateMetrics(dailyBudget, days, newGenre, selectedPlatforms);
    onMetricsChange({ ...metrics, days, platforms: selectedPlatforms, locations: selectedLocations, artists: selectedArtists.map(a => a.name) });
  };

  const handlePlatformToggle = (platform: string) => {
    let newPlatforms: string[];
    if (selectedPlatforms.includes(platform)) {
      // Don't allow deselecting if it's the only platform selected
      if (selectedPlatforms.length === 1) return;
      newPlatforms = selectedPlatforms.filter(p => p !== platform);
    } else {
      newPlatforms = [...selectedPlatforms, platform];
    }
    setSelectedPlatforms(newPlatforms);
    const metrics = calculateMetrics(dailyBudget, days, genre, newPlatforms);
    onMetricsChange({ ...metrics, days, platforms: newPlatforms, locations: selectedLocations, artists: selectedArtists.map(a => a.name) });
  };

  const metrics = calculateMetrics(dailyBudget, days, genre, selectedPlatforms);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Enviar datos iniciales al cargar el componente con métricas ejemplo
  React.useEffect(() => {
    // Métricas iniciales específicas para mostrar resultados atractivos desde el primer paso
    const initialMetrics = {
      cpc: 0.136,
      cpa: 0.77,
      clicks: 11030,
      conversions: 1460,
      streams: 1124,
      totalBudget: dailyBudget * days * selectedPlatforms.length
    };
    onMetricsChange({ 
      ...initialMetrics, 
      days, 
      platforms: selectedPlatforms,
      locations: selectedLocations,
      artists: selectedArtists.map(a => a.name)
    });
  }, []);

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Configuración de Campaña</h3>
          <p className="text-sm text-muted-foreground">Configura tu campaña en 4 pasos simples</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
              step <= currentStep 
                ? 'bg-primary border-primary text-white' 
                : 'bg-background border-muted text-muted-foreground'
            }`}>
              <span className="text-sm font-semibold">{step}</span>
            </div>
            <div className="flex-1 mx-2">
              <div className="text-xs font-medium mb-1">
                {step === 1 && 'Presupuesto'}
                {step === 2 && 'Plataformas'}
                {step === 3 && 'Ubicación'}
                {step === 4 && 'Audiencia'}
              </div>
              <div className={`h-1 rounded-full ${
                step <= currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            </div>
          </div>
        ))}
      </div>

      <TooltipProvider>
        {/* Paso 1: Presupuesto y Duración */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Paso 1: Define tu presupuesto</h4>
              <p className="text-sm text-muted-foreground mb-6">Configura cuánto quieres invertir y por cuánto tiempo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Presupuesto Diario</Label>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    EDITABLE
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg p-4">
                  <button 
                    onClick={handleBudgetDecrease}
                    className="w-8 h-8 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors"
                    disabled={dailyBudget <= 25}
                  >
                    <Minus className="w-4 h-4 text-primary" />
                  </button>
                  <div className="flex items-center gap-1 min-w-[80px] justify-center">
                    <span className="text-sm text-muted-foreground">$</span>
                    <span className="text-2xl font-bold text-foreground">{dailyBudget}</span>
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                  <button 
                    onClick={handleBudgetIncrease}
                    className="w-8 h-8 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors"
                    disabled={dailyBudget >= 1000}
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <p className="text-xs text-primary font-medium text-center">Recomendado: $75-$200</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Duración (días)</Label>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    EDITABLE
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg p-4">
                  <button 
                    onClick={handleDaysDecrease}
                    className="w-8 h-8 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors"
                    disabled={days <= 30}
                  >
                    <Minus className="w-4 h-4 text-primary" />
                  </button>
                  <div className="min-w-[60px] text-center">
                    <span className="text-2xl font-bold text-foreground">{days}</span>
                  </div>
                  <button 
                    onClick={handleDaysIncrease}
                    className="w-8 h-8 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors"
                    disabled={days >= 90}
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <p className="text-xs text-primary font-medium text-center">Recomendado: 30-60 días</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium">Género Musical</Label>
                </div>
                <Select value={genre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="border-2 hover:border-primary/50 focus:border-primary transition-colors h-12">
                    <SelectValue placeholder="Selecciona género" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {Object.entries(GENRE_DEFAULTS).map(([key, value]) => (
                      <SelectItem key={key} value={key} className="hover:bg-muted">
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground text-center">Afecta el costo por clic (CPC)</p>
              </div>
            </div>

            {/* Métricas de Rendimiento Esperado - Mostrar desde el primer paso */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 rounded-2xl p-6 mt-6">
              <div className="text-center mb-4">
                <h5 className="text-lg font-semibold text-green-800 mb-2">📊 Resultados Esperados</h5>
                <p className="text-sm text-green-600">Con estos parámetros, tu campaña podría generar:</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 rounded-lg p-4 text-center border border-white/40">
                  <MousePointer className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">CPC</div>
                  <div className="text-lg font-bold text-foreground">${metrics.cpc.toFixed(3)} USD</div>
                </div>

                <div className="bg-white/60 rounded-lg p-4 text-center border border-white/40">
                  <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">CPA</div>
                  <div className="text-lg font-bold text-foreground">${metrics.cpa.toFixed(2)} USD</div>
                </div>

                <div className="bg-white/60 rounded-lg p-4 text-center border border-white/40">
                  <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">Clicks</div>
                  <div className="text-lg font-bold text-foreground">{metrics.clicks.toLocaleString()}</div>
                </div>

                <div className="bg-white/60 rounded-lg p-4 text-center border border-white/40">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground mb-1">Streams</div>
                  <div className="text-lg font-bold text-green-700">{metrics.streams.toLocaleString()}</div>
                </div>
              </div>

              <div className="text-center mt-4 p-3 bg-white/40 rounded-lg">
                <div className="text-xl font-bold text-green-800">
                  ${metrics.totalBudget.toLocaleString()} USD
                </div>
                <div className="text-sm text-green-600">
                  Inversión total • {metrics.conversions.toLocaleString()} conversiones estimadas
                </div>
              </div>

              {/* Disclaimer Legal */}
              <div className="text-center mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 leading-relaxed">
                  <strong>Disclaimer:</strong> Las métricas mostradas son estimaciones basadas en el rendimiento promedio de campañas previas y pueden variar según múltiples factores del mercado. Digital Latino proporciona servicios de promoción musical y marketing digital. No vendemos ni garantizamos streams directos, sino que optimizamos la visibilidad de tu música a través de estrategias promocionales profesionales.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep} className="px-6">
                Continuar <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: Plataformas */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Paso 2: Elige tus plataformas</h4>
              <p className="text-sm text-muted-foreground mb-6">Selecciona dónde quieres promocionar tu música</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
                  <div key={key} className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                    selectedPlatforms.includes(key) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`} onClick={() => handlePlatformToggle(key)}>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={key}
                        checked={selectedPlatforms.includes(key)}
                        onCheckedChange={() => handlePlatformToggle(key)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <platform.icon size={20} />
                        <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                          {platform.label}
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="text-sm">
                  <span className="font-semibold text-foreground">
                    Plataformas seleccionadas: {selectedPlatforms.length} = {selectedPlatforms.length}x presupuesto
                  </span>
                  <br />
                  <span className="text-muted-foreground">
                    El presupuesto se multiplica automáticamente por cada plataforma adicional
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                ← Atrás
              </Button>
              <Button onClick={nextStep} className="px-6">
                Continuar <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Ubicación Target */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Paso 3: Elegir target</h4>
              <p className="text-sm text-muted-foreground mb-6">Escribe las ubicaciones donde quieres promocionar tu música</p>
            </div>

            {/* Selector de tipo de ubicación */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setLocationTargetType('countries')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  locationTargetType === 'countries'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted text-muted-foreground hover:border-primary/50'
                }`}
              >
                Países
              </button>
              <button
                onClick={() => setLocationTargetType('cities')}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  locationTargetType === 'cities'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted text-muted-foreground hover:border-primary/50'
                }`}
              >
                Ciudades
              </button>
            </div>

            {/* Autocomplete input for locations */}
            <div className="space-y-3">
              <h5 className="font-medium text-foreground">
                {locationTargetType === 'countries' ? 'Buscar países:' : 'Buscar ciudades:'}
              </h5>
              
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between h-12"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 opacity-50" />
                      <span className="text-muted-foreground">
                        {locationTargetType === 'countries' ? 'Buscar países...' : 'Buscar ciudades...'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder={locationTargetType === 'countries' ? 'Escribe el nombre del país...' : 'Escribe el nombre de la ciudad...'}
                      value={locationSearch}
                      onValueChange={setLocationSearch}
                    />
                    <CommandEmpty>{isCitySearching ? 'Buscando…' : 'No se encontraron ubicaciones.'}</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {locationTargetType === 'countries' ? (
                          <>
                            {COUNTRIES
                              .filter((country) => country.name.toLowerCase().includes(locationSearch.toLowerCase()))
                              .slice(0, 8)
                              .map((country) => (
                                <CommandItem
                                  key={country.id}
                                  value={`${country.name}`}
                                  onSelect={() => handleLocationAdd(country)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="font-medium">{country.name}</span>
                                    <Check
                                      className={`ml-auto h-4 w-4 ${
                                        selectedLocations.includes(country.id) ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                  </div>
                                </CommandItem>
                              ))}

                            {locationSearch.trim().length > 0 &&
                              COUNTRIES.filter((c) => c.name.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 &&
                              cityResults.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={`${city.name} ${city.country}`}
                                  onSelect={() => handleLocationAdd(city)}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <span className="font-medium">{city.name}</span>
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({city.country})
                                      </span>
                                    </div>
                                    <Check
                                      className={`ml-auto h-4 w-4 ${
                                        selectedLocations.includes(city.id) ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                          </>
                        ) : (
                          cityResults.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={`${city.name} ${city.country}`}
                              onSelect={() => handleLocationAdd(city)}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <span className="font-medium">{city.name}</span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({city.country})
                                  </span>
                                </div>
                                <Check
                                  className={`ml-auto h-4 w-4 ${
                                    selectedLocations.includes(city.id) ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected locations */}
              {selectedLocations.length > 0 && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-foreground">Ubicaciones seleccionadas:</h6>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((locationId) => {
                      let location = null;
                      
                      if (locationTargetType === 'countries') {
                        location = COUNTRIES.find(c => c.id === locationId);
                      } else {
                        location = citiesData.searchIndex?.byId?.get(locationId) || 
                                   citiesData.cities.find(c => c.id === locationId);
                      }
                      
                      if (!location) return null;
                      
                      return (
                        <Badge key={locationId} variant="secondary" className="flex items-center gap-2">
                          {locationTargetType === 'countries' && (location as any).flag && (
                            <span className="text-sm">{(location as any).flag}</span>
                          )}
                          {locationTargetType === 'cities' && (
                            <MapPin className="h-3 w-3" />
                          )}
                          <span>{location.name}</span>
                          <X 
                            className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => handleLocationRemove(locationId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="text-sm">
                <span className="font-semibold text-foreground">
                  {locationTargetType === 'countries' ? 'Países' : 'Ciudades'} seleccionadas: {selectedLocations.length}
                </span>
                <br />
                <span className="text-muted-foreground">
                  Tu campaña se mostrará solo en las ubicaciones seleccionadas
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                ← Atrás
              </Button>
              <Button onClick={nextStep} className="px-6" disabled={selectedLocations.length === 0}>
                Continuar <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        )}

        {/* Paso 4: Artistas Similares */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Paso 4: Elegir artistas similares</h4>
              <p className="text-sm text-muted-foreground mb-6">Busca artistas de Spotify para hacer targeting a su audiencia</p>
            </div>

            {/* Spotify artist search */}
            <div className="space-y-3">
              <h5 className="font-medium text-foreground">Buscar artistas en Spotify:</h5>
              
              <Popover open={artistOpen} onOpenChange={setArtistOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={artistOpen}
                    className="w-full justify-between h-12"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 opacity-50" />
                      <span className="text-muted-foreground">
                        Buscar artistas en Spotify...
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Escribe el nombre del artista..."
                      value={artistSearch}
                      onValueChange={setArtistSearch}
                    />
                    <CommandEmpty>
                      {artistSearch.trim().length < 1 
                        ? "Escribe para buscar artistas" 
                        : "No se encontraron artistas"}
                    </CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {spotifyArtists.map((artist) => (
                          <CommandItem
                            key={artist.id}
                            value={artist.name}
                            onSelect={() => handleArtistAdd(artist)}
                          >
                            <div className="flex items-center gap-2">
                              <Music className="h-4 w-4 text-spotify" />
                              <span className="font-medium">{artist.name}</span>
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  selectedArtists.find(a => a.id === artist.id) ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected artists */}
              {selectedArtists.length > 0 && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-foreground">Artistas seleccionados:</h6>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtists.map((artist) => (
                      <Badge key={artist.id} variant="secondary" className="flex items-center gap-2">
                        <Music className="h-3 w-3 text-spotify" />
                        <span>{artist.name}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
                          onClick={() => handleArtistRemove(artist.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="text-sm">
                <span className="font-semibold text-foreground">
                  Artistas seleccionados: {selectedArtists.length}
                </span>
                <br />
                <span className="text-muted-foreground">
                  Tu campaña se mostrará a fans de estos artistas (opcional)
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                ← Atrás
              </Button>
              <Button onClick={nextStep} className="px-6">
                Revisar <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        )}

        {/* Paso 5: Resumen y Lanzamiento */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Paso 5: Lanza tu campaña</h4>
              <p className="text-sm text-muted-foreground mb-6">Revisa los detalles y confirma tu campaña</p>
            </div>

            {/* Metrics Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background/50 rounded-lg p-4 text-center border">
                <MousePointer className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">CPC</div>
                <div className="text-lg font-bold text-foreground">${metrics.cpc.toFixed(3)} USD</div>
              </div>

              <div className="bg-background/50 rounded-lg p-4 text-center border">
                <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">CPA</div>
                <div className="text-lg font-bold text-foreground">${metrics.cpa.toFixed(2)} USD</div>
              </div>

              <div className="bg-background/50 rounded-lg p-4 text-center border">
                <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">Clicks</div>
                <div className="text-lg font-bold text-foreground">{metrics.clicks.toLocaleString()}</div>
              </div>

              <div className="bg-background/50 rounded-lg p-4 text-center border">
                <TrendingUp className="w-5 h-5 text-spotify mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">Streams</div>
                <div className="text-lg font-bold text-foreground">{metrics.streams.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  ${metrics.totalBudget.toLocaleString()} USD
                </div>
                <div className="text-sm text-muted-foreground">
                  Presupuesto total • {metrics.conversions.toLocaleString()} conversiones estimadas
                </div>
              </div>
            </div>

            {/* Resumen adicional */}
            <div className="space-y-4">
              <div className="p-4 bg-background/50 rounded-lg border">
                <h5 className="font-medium text-foreground mb-2">Resumen de targeting:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ubicaciones:</span>
                    <div className="font-medium text-foreground">{selectedLocations.length} seleccionadas</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Artistas similares:</span>
                    <div className="font-medium text-foreground">{selectedArtists.length} seleccionados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Legal Final */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Información Legal:</strong> Las proyecciones de streams, clicks y conversiones son estimaciones basadas en el rendimiento histórico de campañas similares y pueden variar significativamente. Los resultados dependen de factores como la calidad del contenido, competencia del mercado, timing y tendencias musicales actuales. Digital Latino ofrece servicios profesionales de marketing musical y promoción digital. No garantizamos números específicos de reproducciones ni vendemos streams artificiales.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                ← Atrás
              </Button>
              <Button size="lg" className="px-8 bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                🚀 Lanzar Campaña
              </Button>
            </div>
          </div>
        )}
      </TooltipProvider>
    </Card>
  );
}