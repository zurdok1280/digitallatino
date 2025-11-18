import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { createPortal } from 'react-dom';
import RecommendationsModal from './Recommendations';

interface BoxCampaignProps {
    spotifyId?: string;
    csSong?: number;
}

const BoxCampaign: React.FC<BoxCampaignProps> = ({ spotifyId, csSong }) => {
    const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);

    const handleOpenRecommendations = () => {
        setIsRecommendationsOpen(true);
    };

    return (
        <>
            <Paper
                elevation={1}
                sx={{
                    borderRadius: "12px",
                    p: 2.5,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    backgroundColor: "white",
                    mb: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderColor: '#6C63FF',
                    borderWidth: '1px',
                    border: "1px solid #E0E0E0",
                    width: '100%'
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        textAlign: 'center',
                    }}
                >
                    {/* Texto */}
                    <Box sx={{ maxWidth: '800px' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#1a1a1a",
                                fontWeight: "bold",
                                fontSize: '1.2rem',
                                lineHeight: 1.4,
                                mb: 1,
                            }}
                        >
                            Haz que tu música llegue donde nunca antes había llegado
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#666",
                                fontSize: '0.9rem',
                            }}
                        >
                            Descubre estrategias personalizadas para impulsar tu música
                        </Typography>
                    </Box>

                    {/* Solo botón de Recomendaciones */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={handleOpenRecommendations}
                            sx={{
                                backgroundColor: "#6C63FF",
                                color: "white",
                                borderRadius: "10px",
                                px: 4,
                                py: 1.5,
                                fontSize: "1rem",
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: '220px',
                                boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: "#5a52d5",
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(108, 99, 255, 0.4)',
                                },
                            }}
                        >
                            Ver Recomendaciones
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Modal de Recomendaciones - Renderizado con Portal */}
            {csSong && isRecommendationsOpen && createPortal(
                <RecommendationsModal
                    csSong={csSong}
                    spotifyId={spotifyId}
                    isOpen={isRecommendationsOpen}
                    onClose={() => setIsRecommendationsOpen(false)}
                />,
                document.body
            )}
        </>
    );
};

export default BoxCampaign;