// components/ui/expand-row-artist.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { digitalLatinoApi, SongsArtist } from "@/lib/api";
import { Backdrop, CircularProgress } from '@mui/material';
import { Play, Pause } from "lucide-react";

interface ExpandRowArtistProps {
    artist: {
        spotifyid?: string;
        artist: string;
        rk: number;
    };
    selectedCountry: string;
    isExpanded: boolean;
}

export function ExpandRowArtist({ artist, selectedCountry, isExpanded }: ExpandRowArtistProps) {
    const { toast } = useToast();
    const [songs, setSongs] = useState<SongsArtist[]>([]);
    const [loadingSongs, setLoadingSongs] = useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isExpanded && artist.spotifyid && selectedCountry) {
            fetchArtistSongs();
        }
    }, [isExpanded, artist.spotifyid, selectedCountry]);

    const fetchArtistSongs = async () => {
        if (!artist.spotifyid) return;

        try {
            setLoadingSongs(true);
            const response = await digitalLatinoApi.getSongsArtist(
                artist.spotifyid,
                parseInt(selectedCountry)
            );
            setSongs(response.data || []);
        } catch (error) {
            console.error('Error fetching artist songs:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canciones del artista.",
                variant: "destructive"
            });
        } finally {
            setLoadingSongs(false);
        }
    };

    const handlePlayPreview = (trackId: number, audioUrl?: string) => {
        if (!audioUrl) return;

        if (currentlyPlaying === trackId) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            setCurrentlyPlaying(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
            setCurrentlyPlaying(null);
            audioRef.current = null;
        });

        audio.play().then(() => {
            setCurrentlyPlaying(trackId);
        }).catch((err) => {
            console.error("Error al reproducir el audio:", err);
            setCurrentlyPlaying(null);
            audioRef.current = null;
        });
    };

    const formatStreams = (streams: number): string => {
        if (streams >= 1000000) {
            return (streams / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (streams >= 1000) {
            return (streams / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return streams.toString();
    };

    if (loadingSongs) {
        return (
            <div className="mt-4 border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4">
                <Backdrop open={true} sx={{ color: '#fff', zIndex: 10, position: 'absolute' }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-slate-600">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Cargando canciones de {artist.artist}...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="text-lg">🎵</span>
                Canciones de {artist.artist}
            </h4>

            {songs.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                    No se encontraron canciones para este artista.
                </div>
            ) : (
                <div className="space-y-2">
                    {songs.map((song, index) => (
                        <div
                            key={song.fk_track}
                            className="flex items-center gap-4 p-3 bg-white/30 rounded-lg border border-white/50"
                        >
                            {/* Play Button */}
                            <button
                                onClick={() => handlePlayPreview(song.fk_track, `https://example.com/audio/${song.fk_track}.mp3`)} // Reemplaza con la URL real del audio
                                className="w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg flex-shrink-0"
                                aria-label={`Reproducir preview de ${song.spotifyid}`}
                            >
                                {currentlyPlaying === song.fk_track ? (
                                    <Pause className="w-3 h-3" />
                                ) : (
                                    <Play className="w-3 h-3 ml-0.5" />
                                )}
                            </button>

                            {/* Song Image */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={song.image_url || '/placeholder-artist.png'}
                                    alt={song.spotifyid || 'Canción'}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Song Info */}
                            <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-slate-800 truncate">
                                    {song.spotifyid || `Canción ${index + 1}`}
                                </h5>
                                <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                                    <span>ISRC: {song.isrc || 'N/A'}</span>
                                    <span>Score: {song.score}</span>
                                    {song.release_date && (
                                        <span>Lanzamiento: {new Date(song.release_date).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>

                            {/* Streams */}
                            <div className="text-right flex-shrink-0">
                                <div className="text-sm font-bold text-slate-800">
                                    {formatStreams(song.spotify_streams)}
                                </div>
                                <div className="text-xs text-slate-500">streams</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {songs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/30">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                        <span>Total de canciones: {songs.length}</span>
                        <span>Streams totales: {formatStreams(songs.reduce((total, song) => total + song.spotify_streams, 0))}</span>
                    </div>
                </div>
            )}
        </div>
    );
}