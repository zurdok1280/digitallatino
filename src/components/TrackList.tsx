import { SpotifyTrack } from '@/types/spotify';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { RippleButton } from '@/components/ui/ripple-button';
import { Waveform } from '@/components/ui/waveform';
import { Play, Clock, TrendingUp, Star, Music, Zap } from 'lucide-react';

interface TrackListProps {
  tracks: SpotifyTrack[];
  onTrackSelect: (track: SpotifyTrack) => void;
  selectedTrack?: SpotifyTrack | null;
  loading?: boolean;
}

export function TrackList({ tracks, onTrackSelect, selectedTrack, loading }: TrackListProps) {
  if (loading) {
    return (
      <Card className="p-6 bg-gradient-subtle border-border/50 shadow-glass">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-1/3" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!tracks.length) {
    return (
      <Card className="p-8 bg-gradient-card border-border text-center">
        <div className="text-muted-foreground">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>Busca un artista para ver sus canciones</p>
        </div>
      </Card>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 70) return 'text-success';
    if (popularity >= 40) return 'text-accent';
    return 'text-muted-foreground';
  };

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 80) return { variant: 'premium' as const, icon: <Star className="w-3 h-3" />, text: 'Top Hit' };
    if (popularity >= 60) return { variant: 'popular' as const, icon: <TrendingUp className="w-3 h-3" />, text: 'Popular' };
    if (popularity >= 40) return { variant: 'info' as const, icon: <Music className="w-3 h-3" />, text: 'Trending' };
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Canciones encontradas</h3>
        <span className="text-sm text-muted-foreground">{tracks.length} resultados</span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {tracks.map((track, index) => {
          const isSelected = selectedTrack?.id === track.id;
          const popularityBadge = getPopularityBadge(track.popularity);
          
          return (
            <div
              key={track.id}
              className={`
                group p-4 rounded-xl transition-all duration-300 cursor-pointer animate-stagger-fade backdrop-blur-sm
                ${isSelected 
                  ? 'bg-primary/10 border border-primary/30 shadow-glow hover:shadow-float scale-[1.02]' 
                  : 'bg-background/50 hover:bg-background/70 border border-transparent hover:border-border/50 hover:shadow-medium hover:scale-[1.01]'
                }
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onTrackSelect(track)}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/20 shadow-subtle group-hover:shadow-medium transition-all duration-300">
                    {track.album.images[0]?.url ? (
                      <img 
                        src={track.album.images[0].url} 
                        alt={track.album.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Play Button Overlay with Waveform */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                      <div className="text-white/60 text-xs">
                        <Waveform isPlaying={false} bars={4} height={8} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {popularityBadge && (
                    <div className="absolute -top-2 -right-2">
                      <StatusBadge 
                        variant={popularityBadge.variant} 
                        size="sm"
                        icon={popularityBadge.icon}
                      >
                        {popularityBadge.text}
                      </StatusBadge>
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground/80 truncate">
                    {track.album.name}
                  </p>
                </div>

                {/* Track Stats */}
                <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(track.duration_ms)}</span>
                  </div>
                  
                  <ProgressRing 
                    progress={track.popularity} 
                    size={32} 
                    strokeWidth={2}
                    showValue={false}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Select Button */}
                <div className="flex-shrink-0">
                  <RippleButton
                    size="sm"
                    variant={isSelected ? "premium" : "ghost"}
                    className={`
                      transition-all duration-300 font-medium
                      ${isSelected 
                        ? 'shadow-glow animate-pulse-glow' 
                        : 'hover:shadow-medium hover:scale-105'
                      }
                    `}
                  >
                    {isSelected ? (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Seleccionada
                      </>
                    ) : (
                      'Seleccionar'
                    )}
                  </RippleButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}