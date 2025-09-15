import { forwardRef, useState, useRef, useEffect } from 'react';
import { SpotifyTrack } from '@/types/spotify';

interface CampaignPreviewProps {
  track: SpotifyTrack | null;
  title?: string;
  backgroundType?: 'album' | 'artist' | 'custom';
  customBackground?: string;
  isBlurred?: boolean;
  autoPlay?: boolean;
}

export const CampaignPreview = forwardRef<HTMLDivElement, CampaignPreviewProps>(
  ({ track, title = '', backgroundType = 'album', customBackground, isBlurred = false, autoPlay = true }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlayFailed, setAutoPlayFailed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getPreviewUrl = () => {
      if (track?.preview_url) {
        return track.preview_url;
      }
      return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    };

    // Auto-play effect
    useEffect(() => {
      if (autoPlay && track && track.preview_url) {
        const playAuto = async () => {
          try {
            const previewUrl = getPreviewUrl();
            if (!previewUrl) return;

            // Create audio element if it doesn't exist
            if (!audioRef.current) {
              audioRef.current = new Audio(previewUrl);
              audioRef.current.volume = 0.7; // Set volume a bit lower for auto-play
              audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
              });
            }

            // Try to play automatically
            await audioRef.current.play();
            setIsPlaying(true);
            setAutoPlayFailed(false);
          } catch (error) {
            // Auto-play blocked by browser
            console.log('Auto-play blocked by browser policy:', error);
            setAutoPlayFailed(true);
            setIsPlaying(false);
          }
        };

        // Small delay to ensure component is mounted
        const timeoutId = setTimeout(playAuto, 500);
        return () => clearTimeout(timeoutId);
      }
    }, [track, autoPlay]);

    const togglePlayPause = () => {
      const previewUrl = getPreviewUrl();
      if (!previewUrl) return;

      if (!audioRef.current) {
        audioRef.current = new Audio(previewUrl);
        audioRef.current.volume = 0.7;
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.log('Error playing audio:', error);
          setAutoPlayFailed(true);
        });
        setIsPlaying(true);
        setAutoPlayFailed(false);
      }
    };

    const handleSpotifyClick = () => {
      if (track?.external_urls?.spotify) {
        window.open(track.external_urls.spotify, '_blank');
      }
    };

    const getBackgroundStyle = () => {
      let backgroundImage = '';
      
      if (backgroundType === 'custom' && customBackground) {
        backgroundImage = customBackground;
      } else if (backgroundType === 'album' && track?.album?.images?.[0]?.url) {
        backgroundImage = track.album.images[0].url;
      } else if (backgroundType === 'artist' && track?.album?.images?.[0]?.url) {
        backgroundImage = track.album.images[0].url;
      }
      
      if (backgroundImage) {
        return {
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      
      return {
        background: 'linear-gradient(135deg, hsl(var(--accent) / 0.3), hsl(var(--primary) / 0.2))',
      };
    };

    const cover = track?.album?.images?.[0]?.url;
    const artistNames = track?.artists?.map((a) => a.name).join(', ') || 'Artista';

    return (
      <div
        ref={ref}
        className="w-[320px] h-[568px] rounded-2xl overflow-hidden relative mx-auto"
      >
        {/* Background Layer with Blur */}
        <div 
          className={`absolute inset-0 ${isBlurred ? 'blur-md' : ''}`}
          style={getBackgroundStyle()}
        ></div>
        
        {/* Content Layer */}
        <div className="relative z-10 h-full flex flex-col text-white">
          {/* Instagram-like Header with Digital Latino branding */}
          <div className="flex items-center justify-between p-3 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/lovable-uploads/b600ff15-6d9b-4b3d-8755-fb53150ce8be.png" 
                  alt="Digital Latino" 
                  className="w-9 h-9 rounded-full object-contain bg-white/90 p-1 border border-white/30"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-white">digitallatino</p>
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-xs text-white/70">Promocionado</p>
              </div>
            </div>
            <button className="p-1">
              <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
              </svg>
            </button>
          </div>

          {/* Custom Title (only if provided) */}
          {title && (
            <div className="px-4 py-2">
              <p className="text-sm text-white/90 font-medium">{title}</p>
            </div>
          )}

          {/* Cover */}
          <div className="px-4 flex-1 flex items-center justify-center">
            <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black/20">
              {cover ? (
                <img
                  src={cover}
                  alt={`Portada del álbum de ${artistNames} - ${track?.name ?? ''}`}
                  className="w-48 h-48 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-white/40 text-sm">
                  Sin portada
                </div>
              )}
              
              {/* Auto-play indicator */}
              {isPlaying && !autoPlayFailed && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  ▶ Auto
                </div>
              )}
              
              {/* Auto-play failed indicator */}
              {autoPlayFailed && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  👆 Toca para reproducir
                </div>
              )}
              
              {/* Play Triangle Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlayPause}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all ${
                  autoPlayFailed 
                    ? 'bg-orange-500/80 hover:bg-orange-600/80 animate-bounce' 
                    : isPlaying 
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-white/10 hover:bg-white/20'
                }`}>
                  {isPlaying ? (
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-white"></div>
                      <div className="w-1 h-4 bg-white"></div>
                    </div>
                  ) : (
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Track info & CTA */}
          <div className="p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="text-center mb-4">
              <h3 className="font-bold text-xl line-clamp-2 mb-1">
                {track?.name || 'Tu nueva canción'}
              </h3>
              <p className="text-sm text-white/80 line-clamp-1 mb-2">{artistNames}</p>
              <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                <span>🎵</span>
                <span>Disponible ahora</span>
                <span>🎵</span>
              </div>
            </div>

            <button
              onClick={handleSpotifyClick}
              className="w-full px-4 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold text-sm transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              aria-label="Escuchar en Spotify"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              ESCUCHAR AHORA
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CampaignPreview.displayName = 'CampaignPreview';
