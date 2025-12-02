import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { Youtube, Music, Users, Heart, MessageSquare, Share2, Eye, TrendingUp, Video, Film } from "lucide-react";
import { digitalLatinoApi, DataArtist } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface DataPlatformArtistProps {
    spotifyId: string;
    artistName: string;
}

export function DataPlatformArtist({ spotifyId, artistName }: DataPlatformArtistProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [artistData, setArtistData] = useState<DataArtist | null>(null);
    const [activeTab, setActiveTab] = useState<'tiktok' | 'youtube'>('tiktok');

    useEffect(() => {
        if (spotifyId) {
            fetchArtistData();
        }
    }, [spotifyId]);

    const fetchArtistData = async () => {
        try {
            setLoading(true);
            const response = await digitalLatinoApi.getDataArtist(spotifyId);
            setArtistData(response.data);
        } catch (error) {
            console.error('Error fetching artist data:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos del artista.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear números
    const formatNumber = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toString();
    };

    // Función para formatear porcentajes
    const formatPercentage = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        return (value * 100).toFixed(1) + '%';
    };

    // Estilos comunes para los papers
    const paperStyles = {
        p: 2, borderRadius: "12px", border: "1px solid #e0e0e0", transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100px'
    };

    // Estilos para papers de TikTok (negro claro)
    const tiktokPaperStyles = { ...paperStyles, backgroundColor: "#f5f5f5", borderColor: "#e0e0e0" };

    // Estilos para papers de YouTube (rojo claro)
    const youtubePaperStyles = { ...paperStyles, backgroundColor: "#fff5f5", borderColor: "#ffcdd2" };

    if (loading) {
        return (
            <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "12px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "white", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontSize: '2rem' }}>🎵</Typography>
                    <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: '1.1rem' }}>
                        Cargando datos del artista...
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} sx={{ color: "#6C63FF" }} />
                </Box>
            </Box>
        );
    }

    if (!artistData) {
        return (
            <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "12px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "white", mb: 3, textAlign: 'center', color: '#666', py: 4, fontStyle: 'italic' }}>
                No hay datos disponibles para este artista
            </Box>
        );
    }

    return (
        <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "12px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "white", mb: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2, backgroundColor: 'rgba(248, 249, 250, 0.8)', borderRadius: '12px', p: 2, border: '1px solid rgba(224, 224, 224, 0.5)' }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#6C63FF" }} />
                    <Typography variant="h6" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", fontSize: '1.3rem' }}>
                        Plataformas Digitales - {artistName}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant={activeTab === 'tiktok' ? 'contained' : 'outlined'} size="small" onClick={() => setActiveTab('tiktok')} startIcon={<Music style={{ width: 16, height: 16 }} />} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, ...(activeTab === 'tiktok' && { backgroundColor: '#000', '&:hover': { backgroundColor: '#333' } }) }}>
                        TikTok
                    </Button>
                    <Button variant={activeTab === 'youtube' ? 'contained' : 'outlined'} size="small" onClick={() => setActiveTab('youtube')} startIcon={<Youtube style={{ width: 16, height: 16 }} />} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, ...(activeTab === 'youtube' && { backgroundColor: '#FF0000', '&:hover': { backgroundColor: '#CC0000' } }) }}>
                        YouTube
                    </Button>
                </Box>
            </Box>

            {/* Contenido por plataforma */}
            <Box sx={{ mb: 3 }}>
                {activeTab === 'tiktok' && (
                    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                        {/* Primera fila - 3 métricas */}
                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Users style={{ width: 20, height: 20 }} /> Seguidores
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.followers_total_tiktok)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Heart style={{ width: 20, height: 20 }} /> Likes Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.likes_total_tiktok)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <MessageSquare style={{ width: 20, height: 20 }} /> Comentarios
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.comments_total_tiktok)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Share2 style={{ width: 20, height: 20 }} /> Compartidos
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.shares_total_tiktok)}
                                </Typography>
                            </Paper>
                        </Grid>
                        {/* Segunda fila - 3 métricas */}
                        <Grid item xs={12} sm={6} md={4} size={4}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Eye style={{ width: 20, height: 20 }} /> Vistas Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.views_total_tiktok)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={4}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Film style={{ width: 20, height: 20 }} /> Videos Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.videos_total_tiktok)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={4}>
                            <Paper sx={tiktokPaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <TrendingUp style={{ width: 20, height: 20 }} /> Tasa de Alcance TikTok
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {/* CORRECCIÓN: Multiplicar por 10 en lugar de 100 */}
                                    {artistData.engagement_rate_tiktok !== null && artistData.engagement_rate_tiktok !== undefined ?
                                        (artistData.engagement_rate_tiktok * 10).toFixed(1) + '%' : 'N/A'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {activeTab === 'youtube' && (
                    <Grid container spacing={2}>
                        {/* Primera fila - 3 métricas */}
                        <Grid item xs={12} sm={6} md={4} size={4}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Users style={{ width: 20, height: 20 }} /> Suscriptores
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.subscribers_total_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={4}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Video style={{ width: 20, height: 20 }} /> Videos Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.videos_total_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={4}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <TrendingUp style={{ width: 20, height: 20 }} /> Tasa de Alcance YouTube
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatPercentage(artistData.engagement_rate_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Segunda fila - 3 métricas */}
                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Eye style={{ width: 20, height: 20 }} /> Vistas Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.video_views_total_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Heart style={{ width: 20, height: 20 }} /> Likes Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.video_likes_total_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Film style={{ width: 20, height: 20 }} /> Shorts Totales
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.shorts_total_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Tercera fila - Última métrica */}
                        <Grid item xs={12} sm={6} md={4} size={3}>
                            <Paper sx={youtubePaperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <Eye style={{ width: 20, height: 20 }} /> Vistas en Shorts
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData.short_views_total_youtube)}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>

            {/* Redes Sociales adicionales */}
            <Box sx={{ pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="h4" sx={{ color: "#6C63FF", fontWeight: 700, mb: 2, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Users sx={{ color: "#6C63FF" }} /> Otras Redes Sociales
                </Typography>

                <Grid container spacing={2}>
                    {[
                        { platform: 'Instagram', key: 'followers_total_instagram', color: '#E4405F' },
                        { platform: 'Facebook', key: 'followers_total_facebook', color: '#1877F2' },
                        { platform: 'Twitter', key: 'followers_total_twitter', color: '#1DA1F2' },
                    ].map((social) => (
                        <Grid item xs={12} sm={4} key={social.key} sx={{ flexGrow: 1 }}>
                            <Paper sx={paperStyles}>
                                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, mb: 1, fontSize: '0.8rem', textAlign: 'center' }}>
                                    {social.platform}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textAlign: 'center', fontSize: '1.1rem' }}>
                                    {formatNumber(artistData[social.key as keyof DataArtist] as number)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#666", textAlign: 'center', display: 'block', mt: 0.5 }}>
                                    Seguidores
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box >
    );
}