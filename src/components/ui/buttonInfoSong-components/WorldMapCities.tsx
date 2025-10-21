import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CityDataForSong } from '@/lib/api';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para ajustar la vista del mapa a los marcadores
function MapBounds({ cities }: { cities: CityDataForSong[] }) {
    const map = useMap();

    useEffect(() => {
        if (cities.length > 0) {
            const group = new L.FeatureGroup(
                cities
                    .filter(city => city.citylat && city.citylng)
                    .map(city => L.marker([city.citylat!, city.citylng!]))
            );

            if (group.getLayers().length > 0) {
                map.fitBounds(group.getBounds(), { padding: [20, 20] });
            }
        }
    }, [cities, map]);

    return null;
}

// Función para determinar el color del marcador basado en el ranking
const getMarkerColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // Oro
    if (rank === 2) return '#C0C0C0'; // Plata
    if (rank === 3) return '#CD7F32'; // Bronce
    return '#6C63FF'; // Morado por defecto
};

// Crear icono personalizado basado en el ranking
const createCustomIcon = (rank: number) => {
    const color = getMarkerColor(rank);

    return L.divIcon({
        html: `
      <div style="
        background-color: ${color};
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
        popupAnchor: [0, -12],
    });
};

// Función para formatear números grandes
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

export interface WorldMapCitiesProps {
    cities: CityDataForSong[];
    height?: string;
}

export default function WorldMapCities({ cities, height = "400px" }: WorldMapCitiesProps) {
    const [mounted, setMounted] = useState(false);

    // Filtrar ciudades con coordenadas válidas
    const validCities = cities.filter(city =>
        city.citylat && city.citylng &&
        !isNaN(city.citylat) && !isNaN(city.citylng)
    );

    // Ordenar por ranking
    const sortedCities = [...validCities].sort((a, b) => (a.rnk || 0) - (b.rnk || 0));

    // useEffect para manejar el montaje (Leaflet requiere montaje en cliente)
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                style={{
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}
            >
                <div>Cargando mapa...</div>
            </div>
        );
    }

    if (validCities.length === 0) {
        return (
            <div
                style={{
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                }}
            >
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌎</div>
                    <div>No hay datos de ubicación disponibles</div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                        Las ciudades no tienen coordenadas geográficas
                    </div>
                </div>
            </div>
        );
    }

    // Centro inicial del mapa (primera ciudad o centro del mundo)
    const center = validCities.length > 0
        ? [validCities[0].citylat!, validCities[0].citylng!] as [number, number]
        : [20, 0] as [number, number];

    return (
        <div style={{
            height,
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
        }}>
            <MapContainer
                center={center}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Ajustar vista a los marcadores */}
                <MapBounds cities={validCities} />

                {/* Renderizar marcadores */}
                {sortedCities.map((city) => (
                    <Marker
                        key={`${city.cityid}-${city.cityname}`}
                        position={[city.citylat!, city.citylng!]}
                        icon={createCustomIcon(city.rnk || 1)}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        backgroundColor: getMarkerColor(city.rnk || 1),
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '10px'
                                    }}>
                                        {city.rnk}
                                    </div>
                                    <strong style={{ color: '#6C63FF' }}>{city.cityname}</strong>
                                </div>

                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    <div>👥 Oyentes: <strong>{formatNumber(city.listeners || 0)}</strong></div>
                                    {city.spins && city.spins > 0 && (
                                        <div>🎵 Reproducciones: <strong>{formatNumber(city.spins)}</strong></div>
                                    )}
                                    {city.audience && city.audience > 0 && (
                                        <div>📊 Audiencia: <strong>{formatNumber(city.audience)}</strong></div>
                                    )}
                                </div>

                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '10px',
                                    color: '#999',
                                    borderTop: '1px solid #f0f0f0',
                                    paddingTop: '4px'
                                }}>
                                    Coordenadas: {city.citylat?.toFixed(4)}, {city.citylng?.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}