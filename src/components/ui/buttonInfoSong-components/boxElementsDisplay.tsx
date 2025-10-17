// boxElementsDisplay.tsx
import React, { useState, useEffect } from "react";
import { Box, Grid, Paper, styled, FormControl, Select, MenuItem, Typography, CircularProgress } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { digitalLatinoApi } from "@/lib/api";

export interface Country {
    code: string;
    name: string;
}

export interface ElementItem {
    name: string;
    rank: number;
    value?: number;
}

export interface BoxElementsDisplayProps {
    label: string;
    csSong: string;
    countryId: string;
    onDataLoaded?: (data: ElementItem[]) => void;
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1.5),
    textAlign: "center",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    color: (theme.vars ?? theme).palette.text.secondary,
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease",
    "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        transform: "translateY(-2px)",
    },
    ...theme.applyStyles("dark", {
        backgroundColor: "#1A2027",
    }),
}));

export default function BoxElementsDisplay({
    label,
    csSong,
    countryId,
    onDataLoaded,
}: BoxElementsDisplayProps) {
    const [elements, setElements] = useState<ElementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCityData = async () => {
            if (!csSong || !countryId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Llamar a la API para obtener datos de ciudades
                const response = await digitalLatinoApi.getCityData(csSong, parseInt(countryId));

                // Transformar los datos de la API al formato que necesita el componente
                const cityData: ElementItem[] = response.data.map((city: any, index: number) => ({
                    name: city.city_name || `Ciudad ${index + 1}`,
                    rank: index + 1,
                    value: city.percentage || city.value || 0
                }));

                setElements(cityData.slice(0, 6)); // Mostrar solo las top 6 ciudades

                if (onDataLoaded) {
                    onDataLoaded(cityData);
                }
            } catch (err) {
                console.error('Error fetching city data:', err);
                setError("No se pudieron cargar los datos de ciudades");
                // Datos de ejemplo para desarrollo
                const sampleData: ElementItem[] = [
                    { name: "Ciudad de México", rank: 1, value: 24 },
                    { name: "Buenos Aires", rank: 2, value: 18 },
                    { name: "Madrid", rank: 3, value: 15 },
                    { name: "Bogotá", rank: 4, value: 12 },
                    { name: "Lima", rank: 5, value: 9 },
                    { name: "Santiago", rank: 6, value: 7 },
                ];
                setElements(sampleData);
            } finally {
                setLoading(false);
            }
        };

        fetchCityData();
    }, [csSong, countryId, onDataLoaded]);

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
                        {label}
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
                }}
            >
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
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
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
                        {label}
                    </Typography>
                </Box>

                <Typography
                    variant="caption"
                    sx={{
                        color: "#666",
                        fontStyle: "italic"
                    }}
                >
                    Top {elements.length} ciudades
                </Typography>
            </Box>

            {/* Content Grid */}
            <Grid container spacing={2}>
                {elements.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Item>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: "#333",
                                    mb: 0.5
                                }}
                            >
                                {item.name}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "#6C63FF",
                                        fontWeight: "bold",
                                        fontSize: "0.75rem"
                                    }}
                                >
                                    #{item.rank}
                                </Typography>
                                {item.value && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#4CAF50",
                                            fontWeight: "bold",
                                            fontSize: "0.7rem"
                                        }}
                                    >
                                        {item.value}%
                                    </Typography>
                                )}
                            </Box>
                        </Item>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}