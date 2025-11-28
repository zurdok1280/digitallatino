import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, CircularProgress, Stack } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import { digitalLatinoApi, TikTokUse } from "@/lib/api";
import tiktokIcon from '/src/assets/covers/icons/tiktok-icon.png';

export interface BoxTikTokInfluencersProps {
    csSong: number;
}

// Función para formatear números
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

export default function BoxTikTokInfluencers({ csSong }: BoxTikTokInfluencersProps) {
    const [tiktokUses, setTiktokUses] = useState<TikTokUse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para obtener datos de TikTok
    const fetchTikTokUses = async () => {
        if (!csSong) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching TikTok uses for:', { csSong });
            const response = await digitalLatinoApi.getTikTokUses(csSong);
            console.log(digitalLatinoApi.getTikTokUses(csSong));
            console.log('TikTok uses response:', response.data);

            setTiktokUses(response.data);
        } catch (err) {
            console.error('Error fetching TikTok uses:', err);
            setError("No se pudieron cargar los videos de TikTok");
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar datos cuando cambia el csSong
    useEffect(() => {
        fetchTikTokUses();
    }, [csSong]);

    const handleOpenVideo = (userHandle: string, videoId: string) => {
        const url = `https://www.tiktok.com/@${userHandle}/video/${videoId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleOpenProfile = (userHandle: string) => {
        const url = `https://www.tiktok.com/@${userHandle}`;
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
                    <Box
                        component="img"
                        src={tiktokIcon}
                        alt="TikTok"
                        sx={{ width: 24, height: 24 }}
                    />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#000000",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Videos con mi canción
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} sx={{ color: "#000000" }} />
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
                    <Box
                        component="img"
                        src={tiktokIcon}
                        alt="TikTok"
                        sx={{ width: 24, height: 24 }}
                    />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#d32f2f",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Videos used my song
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
            {/* Header con logo de TikTok */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3,
                    width: '100%',
                }}
            >
                <Box
                    component="img"
                    src={tiktokIcon}
                    alt="TikTok"
                    sx={{ width: 24, height: 24 }}
                />
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: "#000000",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    Videos con mi canción
                </Typography>
            </Box>

            {/* Contenedor con scrollbar - MÁXIMO 5 VISIBLES */}
            <Box
                sx={{
                    width: '100%',
                    maxHeight: '550px', // Altura para mostrar ~5 videos
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
                {tiktokUses.map((tiktokUse) => (
                    <Paper
                        key={tiktokUse.video_id}
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
                            {/* Información del usuario y video - SE EXPANDE */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                {/* Nombre del video (click para abrir video) */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        mb: 1,
                                        fontSize: '1rem',
                                        lineHeight: 1.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            color: '#000000',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                    onClick={() => handleOpenVideo(tiktokUse.user_handle, tiktokUse.video_id)}
                                >
                                    #{tiktokUse.rk} - {tiktokUse.username}
                                </Typography>

                                {/* Información del usuario */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <PeopleIcon
                                        sx={{
                                            fontSize: '1rem',
                                            color: '#666',
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#666",
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {formatNumber(tiktokUse.tiktok_user_followers)} Seguidores
                                    </Typography>
                                </Box>

                                {/* Nombre de usuario (click para abrir perfil) */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#666",
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            color: '#000000',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                    onClick={() => handleOpenProfile(tiktokUse.user_handle)}
                                >
                                    @{tiktokUse.user_handle}
                                </Typography>
                            </Box>

                            {/* Métricas - SE EXPANDE HACIA LA DERECHA */}
                            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                {/* Views */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(33, 33, 33, 0.1)",
                                        border: "1px solid rgba(33, 33, 33, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 120,
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
                                        <VisibilityIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: '#000000',
                                                mb: 0.5,
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#000000",
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Visualizaciones
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#000000",
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatNumber(tiktokUse.views_total)}
                                    </Typography>
                                </Paper>

                                {/* Likes */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(255, 0, 80, 0.1)",
                                        border: "1px solid rgba(255, 0, 80, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 120,
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
                                        <FavoriteIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: '#ff0050',
                                                mb: 0.5,
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#ff0050",
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Likes
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#ff0050",
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatNumber(tiktokUse.likes_total)}
                                    </Typography>
                                </Paper>

                                {/* Comments */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(0, 242, 234, 0.1)",
                                        border: "1px solid rgba(0, 242, 234, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 120,
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
                                        <ChatBubbleOutlineIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: '#00f2ea',
                                                mb: 0.5,
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#00a29c",
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Comentarios
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#00a29c",
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatNumber(tiktokUse.comments_total)}
                                    </Typography>
                                </Paper>

                                {/* Shares */}
                                <Paper
                                    sx={{
                                        p: 1.5,
                                        borderRadius: "8px",
                                        backgroundColor: "rgba(37, 244, 238, 0.1)",
                                        border: "1px solid rgba(37, 244, 238, 0.2)",
                                        textAlign: 'center',
                                        minWidth: 120,
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
                                        <ShareIcon
                                            sx={{
                                                fontSize: '1.2rem',
                                                color: '#25f4ee',
                                                mb: 0.5,
                                                mr: 2,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#25f4ee",
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Compartidos
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#25f4ee",
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatNumber(tiktokUse.shares_total)}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {/* Mensaje si no hay videos */}
            {tiktokUses.length === 0 && (
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        color: '#666',
                        py: 4,
                        fontStyle: 'italic'
                    }}
                >
                    No se encontraron videos de TikTok para esta canción
                </Typography>
            )}
        </Box>
    );
}