import React, { useState, useEffect } from "react";
import { Box, FormControl, Select, MenuItem, Typography, CircularProgress, Chip, Stack, Paper, Tooltip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { CityDataForSong, Country, digitalLatinoApi } from "@/lib/api";
import WorldMap from "./worldMap";
import BoxElementsDisplaySpins from "./boxElementsDisplaySpins";
import BoxElementsDisplayAudience from "./boxElemensDisplayAudience";

export interface ElementItem {
    name: string;
    rank: number;
    value?: number;
}

export interface BoxElementsDisplayProps {
    label: string;
    csSong: string;
    countries: Country[]; // Lista de países para el dropdown
    onDataLoaded?: (data: ElementItem[]) => void;
}

//Funcion para truncar el texto de las ciudades si es muy largo
const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Componente para mostrar cada ciudad como chip
const CityChip = ({ city, rank }: { city: ElementItem, rank: number }) => {
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "#FFD700"; // Oro
            case 2: return "#C0C0C0"; // Plata
            case 3: return "#CD7F32"; // Bronce
            default: return "#6C63FF"; // Morado por defecto
        }
    };

    const truncatedName = truncateText(city.name, 30);

    return (

        <Tooltip
            title={city.name}
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: 'white',
                        color: 'text.primary',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: '12px',
                        fontWeight: '500',
                        '& .MuiTooltip-arrow': {
                            color: 'white',
                        }
                    }
                }
            }}
        >
            <Paper
                elevation={1}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderRadius: '20px',
                    backgroundColor: 'white',
                    border: `2px solid ${getRankColor(rank)}`,
                    minWidth: '140px',
                    maxWidth: '190px',
                    width: '100%',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: getRankColor(rank),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}
                >
                    #{rank}
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: "#333",
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help',
                        fontSize: '0.9rem'
                    }}
                >
                    {truncatedName}
                </Typography>
            </Paper>
        </Tooltip>

    );
};

export default function BoxElementsDisplay({ label, csSong, countries, onDataLoaded }: BoxElementsDisplayProps) {
    const [elements, setElements] = useState<ElementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string>(
        countries.length > 0 ? countries[0].id.toString() : ''
    );
    const [citiesData, setCitiesData] = useState<CityDataForSong[]>([]);
    const [activeTab, setActiveTab] = useState(0);

    // Función para obtener datos de ciudades
    const fetchCityData = async (countryId: string) => {

        if (!csSong || !countryId) {
            console.log('❌ Faltan datos: csSong o countryId');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Llamar a la API para obtener datos de ciudades
            const response = await digitalLatinoApi.getCityData(parseInt(csSong), parseInt(countryId));

            // Guardar datos completos para el mapa
            setCitiesData(response.data);

            // Transformar los datos de la API al formato que necesita el componente
            const cityData: ElementItem[] = response.data.map((city: CityDataForSong, index: number) => ({
                name: city.cityname || `Ciudad ${index + 1}`,
                rank: city.rnk || index + 1,
                value: city.listeners || city.streams || 0,
            }));

            const top8Cities = cityData.slice(0, 8); // Mostrar solo las top 8 ciudades
            setElements(top8Cities);

            if (onDataLoaded) {
                onDataLoaded(cityData);
            }
        } catch (err) {
            console.error('❌ Error en fetchCityData:', err);
            setError("No se pudieron cargar los datos de ciudades");
        } finally {
            setLoading(false);
        }
    }

    // Efecto para cargar datos cuando cambia el país seleccionado o la canción
    useEffect(() => {
        console.log('🔄 useEffect triggered:', { selectedCountry, csSong });
        if (selectedCountry) {
            fetchCityData(selectedCountry);
        } else {
            console.log('❌ selectedCountry no está definido');
            setLoading(false);
        }
    }, [selectedCountry, csSong]);

    // useEffect para seleccionar el primer país por defecto cuando se cargan los países
    useEffect(() => {
        // Siempre establecer un país por defecto, incluso si no hay países en la lista
        if (countries.length > 0) {
            const defaultCountry = '0'; //= countries[0].id.toString()
            setSelectedCountry(defaultCountry);
        } else {
            // Usar país 0 por defecto si no hay países en la lista
            setSelectedCountry('0');
        }
    }, [countries]);

    // Resto del código...

    const handleCountryChange = (event: any) => {
        setSelectedCountry(event.target.value);
    };



    // Dividir elementos en dos filas 
    const firstRow = elements.slice(0, 4);
    const secondRow = elements.slice(4, 8);


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

            {/* Estadisticas de Radio */}
            <BoxElementsDisplayAudience
                csSong={Number(csSong)}
                title="Top Países en Radio"
                label="países"
                type="countries"
            />
            {selectedCountry && selectedCountry !== '0' && (
                <BoxElementsDisplaySpins
                    csSong={Number(csSong)}
                    countryId={parseInt(selectedCountry)}
                    title="Top Mercados en Radio"
                    label="mercados"
                    type="markets"
                />
            )}
            {/* Header con dropdown de países */}
            <Box sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                p: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                backgroundColor: "white",
                mb: 3,
            }}>
                {/* Header con dropdown de países */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2
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
                    {/* Dropdown de selección de país */}
                    {/*<FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            sx={{
                                fontSize: "0.85rem",
                                borderRadius: "8px",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                            }}
                        >
                            {countries.map((country) => (
                                <MenuItem key={country.id} value={country.id.toString()}>
                                    {country.country_name || country.country || country.description}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>*/}
                </Box>


                {/* Lista horizontal de ciudades */}
                <Box sx={{
                    width: '100%'
                }}>

                    {/* Primera fila - Top 5 ciudades */}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            justifyContent: 'center',
                            mb: 2,
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        {firstRow.map((city) => (
                            <CityChip key={city.rank} city={city} rank={city.rank} />
                        ))}
                    </Stack>

                    {/* Segunda fila - Ciudades 6-10 */}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        {secondRow.map((city) => (
                            <CityChip key={city.rank} city={city} rank={city.rank} />
                        ))}
                    </Stack>

                    {elements.length === 0 && (
                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: 'center',
                                color: '#666',
                                py: 2
                            }}
                        >
                            No hay datos de ciudades disponibles
                        </Typography>
                    )}
                </Box>
            </Box>
            <WorldMap cities={citiesData} loading={loading} />
        </Box>
    );
}