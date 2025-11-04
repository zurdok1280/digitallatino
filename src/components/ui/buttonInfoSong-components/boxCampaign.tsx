import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';

const BoxCampaign: React.FC = () => {
    const navigate = useNavigate();

    const handleGoToCampaign = () => {
        // navigate('/Campaign');
        const campaignUrl = `/Campaign?`;
        window.open(campaignUrl, '_blank')

    };

    return (
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

                </Box>

                {/* Botón */}
                <Button
                    variant="contained"
                    onClick={handleGoToCampaign}
                    sx={{
                        backgroundColor: "#6C63FF",
                        color: "white",
                        borderRadius: "10px",
                        px: 3,
                        py: 1,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: '180px',
                        boxShadow: '0 2px 8px rgba(108, 99, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: "#5a52d5",
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(108, 99, 255, 0.4)',
                        },
                    }}
                >
                    Campaña de Promoción
                </Button>
            </Box>
        </Paper>
    );
};

export default BoxCampaign;