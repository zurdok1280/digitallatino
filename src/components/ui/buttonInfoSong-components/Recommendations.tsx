import React, { useState, useEffect } from 'react';
import { X, Music, Play, Instagram, Facebook } from 'lucide-react';
import { TopTrendingArtist } from '@/lib/api';
import { digitalLatinoApi } from '@/lib/api';

// Importar los mismos íconos que usas en boxDisplayInfoPlatform
import spotifyIcon from '/src/assets/covers/icons/spotify-icon.png';
import tiktokIcon from '/src/assets/covers/icons/tiktok-icon.png';

interface RecommendationsModalProps {
    csSong: number;
    isOpen: boolean;
    onClose: () => void;
    spotifyId?: string;
}

const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
    csSong,
    isOpen,
    onClose,
    spotifyId
}) => {
    const [recommendations, setRecommendations] = useState<TopTrendingArtist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadRecommendations();
            // Bloquear scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        } else {
            // Restaurar scroll del body cuando el modal se cierra
            document.body.style.overflow = 'unset';
        }

        // Cleanup: restaurar scroll cuando el componente se desmonta
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, csSong]);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await digitalLatinoApi.getArtistRecommendations(csSong);
            if (response.data && response.data.length > 0) {
                setRecommendations(response.data[0]);
            }
        } catch (err) {
            setError('Error al cargar las recomendaciones');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Misma función que en BoxCampaign.tsx
    const handleGoToCampaign = () => {
        if (spotifyId) {
            // Abrir en nueva pestaña
            const campaignUrl = `/campaign?spotifyId=${spotifyId}`;
            window.open(campaignUrl, '_blank');
        } else {
            // Fallback si no hay spotifyId
            const campaignUrl = `/campaign`;
            window.open(campaignUrl, '_blank');
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    };

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header - Fijo */}
                <div className="flex-shrink-0 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Plan de Acción Recomendado</h2>
                            <p className="text-xs text-gray-600">Estrategias clave para impulsar tu música</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            {error}
                        </div>
                    ) : recommendations ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* COLUMNA IZQUIERDA */}
                            <div className="space-y-4">
                                {/* Campaña de Playlists*/}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <img
                                                src={spotifyIcon}
                                                alt="Spotify"
                                                className="w-5 h-5"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm">Campaña de Playlists</h3>
                                            <p className="text-xs text-gray-600">
                                                Actualmente estás en <span className="font-semibold">{formatNumber(recommendations.playlist_reach)} playlists</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            Te recomendamos activar una <span className="font-semibold text-purple-700">campaña especializada de playlists</span> para aumentar significativamente el número de oyentes que descubren tu música por este medio.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Nuestro servicio te garantiza entre 30 y 50 playlists adicionales</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Networking directo con curadores independientes de tu género</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Impacto estimado: +40-60% de streams por descubrimiento orgánico</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaña Instagram */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Instagram className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm">Campaña Instagram</h3>
                                            <p className="text-xs text-gray-600">
                                                Alcance actual: <span className="font-semibold">{formatNumber(recommendations.followers_total_instagram)} cuentas</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            Te recomendamos activar una <span className="font-semibold text-purple-700">campaña promocional en Instagram</span> para maximizar tu alcance y las conversiones de tu música en esta plataforma.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Objetivo: Alcanzar 200,000+ cuentas mensuales</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Incrementar conversiones a Spotify mediante Reels y Stories</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA */}
                            <div className="space-y-4">
                                {/* Campaña TikTok */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-9 h-9 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <img
                                                src={tiktokIcon}
                                                alt="TikTok"
                                                className="w-5 h-5"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm">Campaña TikTok</h3>
                                            <p className="text-xs text-gray-600">
                                                Alcance actual: <span className="font-semibold">{formatNumber(recommendations.followers_total_tiktok)} cuentas</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-pink-50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            Te recomendamos activar una <span className="font-semibold text-pink-700">campaña promocional en TikTok</span> para maximizar tu alcance y las reproducciones de tu música en esta plataforma viral.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Objetivo: Alcanzar 150,000+ cuentas mensuales</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Incrementar reproducciones directas desde TikTok a Spotify</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaña Facebook */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Facebook className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm">Campaña Facebook</h3>
                                            <p className="text-xs text-gray-600">
                                                Alcance actual: <span className="font-semibold">{formatNumber(recommendations.followers_total_facebook)} cuentas</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            Te recomendamos activar una <span className="font-semibold text-blue-700">campaña promocional en Facebook</span> para maximizar tu alcance y las conversiones desde esta plataforma.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Objetivo: Alcanzar 120,000+ cuentas mensuales</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 text-sm">✓</span>
                                            <p className="text-xs text-gray-700">Incrementar clics directos a tu perfil de Spotify</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer - Fijo */}
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-orange-50 p-4 rounded-b-2xl border-t border-gray-200">
                    <div className="text-center mb-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            ¿Listo para impulsar tu música?
                        </h3>
                        <p className="text-xs text-gray-600">
                            Nuestros expertos pueden crear una campaña personalizada
                        </p>
                    </div>
                    <button
                        onClick={handleGoToCampaign}
                        className="w-full bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
                    >
                        Crear Campaña Ahora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationsModal;