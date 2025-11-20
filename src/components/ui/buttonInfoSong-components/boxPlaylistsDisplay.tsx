import React, { useState, useEffect } from "react";
import { Box, FormControl, Select, MenuItem, Typography, Paper, CircularProgress, Chip, Stack, } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { digitalLatinoApi, TopPlaylists } from "@/lib/api";

export interface BoxPlaylistsDisplayProps {
    csSong: number;
}

// Definir los tipos de playlist
const playlistTypes = [
    { id: 0, name: "Todas las Playlists", value: "General" },
    { id: 1, name: "Editorial", value: "Editorial" },
    { id: 2, name: "Chart", value: "Chart" },
    { id: 4, name: "Listener", value: "Listener" },
    { id: 5, name: "Personalized", value: "Personalized" },
    { id: 6, name: "Artist Radio", value: "Artist Radio" },
    { id: 7, name: "Artist Mix", value: "Artist-mix-reader" },
];

// Función para formatear números de seguidores
const formatFollowers = (followers: number): string => {
    if (followers >= 1000000) {
        return (followers / 1000000).toFixed(1) + 'M';
    } else if (followers >= 1000) {
        return (followers / 1000).toFixed(1) + 'K';
    }
    return followers.toString();
};

// Función para obtener color del rank
const getRankColor = (rank: number): string => {
    switch (rank) {
        case 1: return "#FFD700"; // Oro
        case 2: return "#C0C0C0"; // Plata
        case 3: return "#CD7F32"; // Bronce
        default: return "#6C63FF"; // Morado
    }
};

export default function BoxPlaylistsDisplay({ csSong }: BoxPlaylistsDisplayProps) {
    const [playlists, setPlaylists] = useState<TopPlaylists[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<number>(0);

    // Función para obtener datos de playlists
    const fetchPlaylists = async (typeId: number) => {
        if (!csSong) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await digitalLatinoApi.getTopPlaylists(csSong, typeId);

            setPlaylists(response.data);
        } catch (err) {
            console.error('Error fetching playlists:', err);
            setError("No se pudieron cargar las playlists");
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar datos cuando cambia el tipo seleccionado
    useEffect(() => {
        fetchPlaylists(selectedType);
    }, [csSong, selectedType]);

    const handleTypeChange = (event: any) => {
        setSelectedType(event.target.value);
    };

    const handleOpenPlaylist = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <Box
                sx={{
                    border: "1px solid #E0E0E0",
                    borderRadius: "12px",
                    p: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    backgroundColor: "white",
                    mb: 3,
                    width: '100%',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#6C63FF" }} />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#6C63FF",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Top Playlists
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} sx={{ color: "#6C63FF" }} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    border: "1px solid #ffcdd2",
                    borderRadius: "12px",
                    p: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffebee",
                    mb: 3,
                    width: '100%',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#d32f2f" }} />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#d32f2f",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Top Playlists
                    </Typography>
                </Box>
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                p: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                backgroundColor: "white",
                mb: 3,
                width: '100%',
            }}
        >
            {/* Header con selector de tipo */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                    width: '100%',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: "#6C63FF" }} />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#6C63FF",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Top Playlists
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                        value={selectedType}
                        onChange={handleTypeChange}
                        sx={{
                            fontSize: "0.85rem",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                        }}
                    >
                        {playlistTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                                {type.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Contenedor con scrollbar - MÁXIMO 5 VISIBLES */}
            <Box
                sx={{
                    width: '100%',
                    maxHeight: '550px', // Altura para mostrar ~5 playlists
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#c1c1c1',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: '#a8a8a8',
                        }
                    },
                    // Scrollbar para Firefox
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#c1c1c1 #f1f1f1',
                }}
            >
                {playlists.map((playlist) => (
                    <Paper
                        key={playlist.spotify_id}
                        elevation={1}
                        sx={{
                            p: 2,
                            borderRadius: "12px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e0e0e0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                backgroundColor: "#ffffff",
                            },
                            mb: 2,
                            width: '100%',
                            flexShrink: 0, // Evita que se compriman
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            {/* Artwork y Rank */}
                            <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                <Box
                                    component="img"
                                    src={playlist.artwork}
                                    alt={playlist.playlist_name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        backgroundColor: '#6C63FF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '';
                                        target.style.backgroundColor = '#6C63FF';
                                        target.style.display = 'flex';
                                        target.style.alignItems = 'center';
                                        target.style.justifyContent = 'center';
                                        target.style.color = 'white';
                                        target.style.fontSize = '1.2rem';
                                        target.style.fontWeight = 'bold';
                                        target.textContent = `#${playlist.rank}`;
                                    }}
                                />
                                {/* Badge de rank */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        left: -8,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        backgroundColor: getRankColor(playlist.rank),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    #{playlist.rank}
                                </Box>
                            </Box>

                            {/* Información de la playlist - SE EXPANDE */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        mb: 0.5,
                                        fontSize: '1rem',
                                        lineHeight: 1.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {playlist.playlist_name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#666",
                                        fontSize: '0.85rem',
                                        fontStyle: 'italic',
                                        mb: 1,
                                    }}
                                >
                                    by {playlist.owner_name}
                                </Typography>
                                <Chip
                                    label={playlist.type_name}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(108, 99, 255, 0.1)',
                                        color: '#6C63FF',
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        height: '20px',
                                    }}
                                />
                            </Box>

                            {/* Métricas - SE EXPANDE HACIA LA DERECHA */}
                            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                {/* Seguidores */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                                        border: "1px solid rgba(76, 175, 80, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 150,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'left',
                                        justifyContent: 'flex-start',
                                        mb: 0.5,
                                    }}>
                                        <PeopleIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: '#4caf50',
                                                mb: 0.5,
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#4caf50",
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Seguidores
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#2e7d32",
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatFollowers(playlist.followers)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#666",
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        Seguidores
                                    </Typography>
                                </Paper>

                                {/* Posiciones */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(255, 152, 0, 0.1)",
                                        border: "1px solid rgba(255, 152, 0, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 150,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'left',
                                        justifyContent: 'flex-start',
                                        mb: 0.5,
                                    }}>
                                        <TrendingUpIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: '#ff9800',
                                                mb: 0.5,
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#ef6c00",
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Posición
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#ef6c00",
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {playlist.current_position}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#666",
                                                    fontSize: '0.6rem',
                                                }}
                                            >
                                                Actual
                                            </Typography>
                                        </Box>
                                        <Box sx={{ borderLeft: '1px solid #ffcc80', height: '20px', mx: 0.5 }} />
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#ef6c00",
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {playlist.top_position}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#666",
                                                    fontSize: '0.6rem',
                                                }}
                                            >
                                                Top
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                {/* Abrir en Spotify */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(108, 99, 255, 0.1)",
                                        border: "1px solid rgba(108, 99, 255, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: "rgba(108, 99, 255, 0.2)",
                                        },
                                    }}
                                    onClick={() => handleOpenPlaylist(playlist.external_url)}
                                >
                                    <OpenInNewIcon
                                        sx={{
                                            fontSize: '1.2rem',
                                            color: '#6C63FF',
                                            mb: 0.5,
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#6C63FF",
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        Abrir
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#666",
                                            fontSize: '0.6rem',
                                        }}
                                    >
                                        en Spotify
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {/* Mensaje si no hay playlists */}
            {playlists.length === 0 && (
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        color: '#666',
                        py: 4,
                        fontStyle: 'italic'
                    }}
                >
                    No se encontraron playlists para esta categoría
                </Typography>
            )}
        </Box>
    );
}