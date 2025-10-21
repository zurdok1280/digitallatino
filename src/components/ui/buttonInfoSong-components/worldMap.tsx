import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { CityDataForSong } from "@/lib/api";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorldMapLeafletProps {
    cities: CityDataForSong[];
    title?: string;
    height?: number;
    loading?: boolean;
}

// Función para determinar el color del marcador basado en el ranking
const getMarkerColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // Oro
    if (rank === 2) return '#C0C0C0'; // Plata  
    if (rank === 3) return '#CD7F32'; // Bronce
    return '#6C63FF'; // Morado por defecto
};

// Crear iconos personalizados para cada ranking
const createCustomIcon = (rank: number) => {
    return L.divIcon({
        html: `
      <div style="
        background-color: ${getMarkerColor(rank)};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        ${rank}
      </div>
    `,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Formatear números para mostrar
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
};

export default function WorldMapLeaflet({
    cities,
    title = "📍 Distribución Global de la Canción",
    height = 400,
    loading = false
}: WorldMapLeafletProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    // Filtrar ciudades con coordenadas válidas
    const validCities = cities
        .filter(city => city.citylat && city.citylng && city.cityname)
        .slice(0, 10);

    useEffect(() => {
        if (!mapRef.current) return;

        // Inicializar el mapa
        const map = L.map(mapRef.current).setView([20, 0], 2);
        mapInstanceRef.current = map;

        // Agregar capa de tiles (puedes usar diferentes proveedores)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Crear grupo de marcadores
        markersRef.current = L.layerGroup().addTo(map);

        // Agregar marcadores si hay ciudades válidas
        if (validCities.length > 0) {
            addMarkersToMap(map, markersRef.current, validCities);

            // Ajustar el zoom para mostrar todos los marcadores
            const group = L.featureGroup(
                validCities.map(city => L.marker([city.citylat!, city.citylng!]))
            );
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Efecto para actualizar marcadores cuando cambian las ciudades
    useEffect(() => {
        if (!mapInstanceRef.current || !markersRef.current) return;

        // Limpiar marcadores anteriores
        markersRef.current.clearLayers();

        // Agregar nuevos marcadores si hay ciudades válidas
        if (validCities.length > 0) {
            addMarkersToMap(mapInstanceRef.current, markersRef.current, validCities);

            // Ajustar el zoom para mostrar todos los marcadores
            const group = L.featureGroup(
                validCities.map(city => L.marker([city.citylat!, city.citylng!]))
            );
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
    }, [validCities]);

    // Función auxiliar para agregar marcadores al mapa
    const addMarkersToMap = (map: L.Map, layerGroup: L.LayerGroup, cities: CityDataForSong[]) => {
        cities.forEach((city) => {
            const marker = L.marker([city.citylat!, city.citylng!], {
                icon: createCustomIcon(city.rnk || 1)
            }).addTo(layerGroup);

            // Tooltip en hover
            marker.bindTooltip(`
        <div style="font-weight: bold;">${city.cityname}</div>
        <div>Rank: #${city.rnk}</div>
        <div>Oyentes: ${city.listeners ? formatNumber(city.listeners) : '0'}</div>
      `, {
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip'
            });

            // Popup al hacer click
            marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${city.cityname}</h4>
          <p style="margin: 4px 0; color: #666;">
            <strong>Rank:</strong> #${city.rnk}<br/>
            <strong>Oyentes:</strong> ${city.listeners ? formatNumber(city.listeners) : '0'}<br/>
            <strong>Coordenadas:</strong> ${city.citylat?.toFixed(4)}, ${city.citylng?.toFixed(4)}
          </p>
        </div>
      `);
        });
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography
                variant="subtitle2"
                sx={{
                    color: "#6C63FF",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 2
                }}
            >
                {title}
            </Typography>

            <Paper
                elevation={1}
                sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    p: 3,
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
            >
                {/* Mapa Leaflet */}
                <Box
                    ref={mapRef}
                    sx={{
                        width: '100%',
                        height: height,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        mb: 2,
                        border: '1px solid #e0e0e0'
                    }}
                />

                {/* Leyenda del mapa */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    mb: 2,
                    flexWrap: 'wrap'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#FFD700', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#1 Oro</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#C0C0C0', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#2 Plata</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#CD7F32', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#3 Bronce</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#6C63FF', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Otros</Typography>
                    </Box>
                </Box>

                {/* Información de ciudades */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
                    gap: 1.5
                }}>
                    {validCities.slice(0, 5).map((city) => (
                        <Paper
                            key={city.cityid}
                            elevation={0}
                            sx={{
                                backgroundColor: 'grey.50',
                                borderRadius: '8px',
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'grey.200',
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                    }}
                                    style={{ backgroundColor: getMarkerColor(city.rnk || 1) }}
                                />
                                {city.cityname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                #{city.rnk} • {city.listeners ? formatNumber(city.listeners) : '0'} oyentes
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                {validCities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>🌎</Typography>
                        <Typography variant="body2">No hay datos de ubicación disponibles</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                            Las ciudades no tienen coordenadas geográficas o no se pudieron cargar
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}