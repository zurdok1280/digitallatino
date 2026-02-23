// Componente FiltroCiudad con Scroll Infinito
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, MapPin } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CityFilterProps {
    selectedCountry: string;
    selectedCity: string;
    onCitySelect: (cityId: string) => void;
    loadingCities: boolean;
    cities: any[];
    openDropdown: string | null;
    setOpenDropdown: (value: string | null) => void;
    dropdownSearch: string;
    setDropdownSearch: (value: string) => void;
    getFilteredOptions: (options: any[], search: string, type: string) => any[];
    handleOptionSelect: (value: string, type: string) => void;
}

export function CityFilter({
    selectedCountry,
    selectedCity,
    onCitySelect,
    loadingCities,
    cities,
    openDropdown,
    setOpenDropdown,
    dropdownSearch,
    setDropdownSearch,
    getFilteredOptions,
    handleOptionSelect
}: CityFilterProps) {
    const [cityDropdownPosition, setCityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const cityButtonRef = useRef<HTMLDivElement>(null);

    // Estados para scroll infinito
    const [displayedCities, setDisplayedCities] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const CITIES_PER_PAGE = 30;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastCityRef = useRef<HTMLDivElement | null>(null);

    // Resetear cuando cambian las ciudades (nuevo país seleccionado)
    useEffect(() => {
        setDisplayedCities(cities.slice(0, CITIES_PER_PAGE));
        setPage(1);
        setHasMore(cities.length > CITIES_PER_PAGE);
    }, [cities]);

    // Configurar Intersection Observer para scroll infinito
    useEffect(() => {
        if (loadingCities || !hasMore) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    // Cargar más ciudades
                    setIsLoadingMore(true);

                    // Simular carga asíncrona para no bloquear la UI
                    setTimeout(() => {
                        const nextPage = page + 1;
                        const start = page * CITIES_PER_PAGE;
                        const end = start + CITIES_PER_PAGE;
                        const newCities = cities.slice(start, end);

                        if (newCities.length > 0) {
                            setDisplayedCities(prev => [...prev, ...newCities]);
                            setPage(nextPage);
                            setHasMore(end < cities.length);
                        } else {
                            setHasMore(false);
                        }

                        setIsLoadingMore(false);
                    }, 100);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px' // Cargar 100px antes de llegar al final
            }
        );

        return () => observerRef.current?.disconnect();
    }, [loadingCities, hasMore, page, cities, isLoadingMore]);

    // Efecto para conectar el observer al último elemento
    useEffect(() => {
        if (observerRef.current && lastCityRef.current) {
            observerRef.current.disconnect();
            observerRef.current.observe(lastCityRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [displayedCities]);

    // Filtrar ciudades mostradas según búsqueda
    const filteredDisplayedCities = getFilteredOptions(displayedCities, dropdownSearch, "city");

    return (
        <div className="space-y-1 sm:space-y-2 relative">
            <label className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-base">🏙️</span>
                <span className="truncate">Ciudad Target</span>
            </label>
            <div className="relative" ref={cityButtonRef}>
                <button
                    type="button"
                    onClick={() => {
                        setOpenDropdown(openDropdown === "city" ? null : "city");
                        setDropdownSearch("");
                        if (cityButtonRef.current) {
                            const rect = cityButtonRef.current.getBoundingClientRect();
                            setCityDropdownPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX,
                                width: rect.width,
                            });
                        }
                    }}
                    className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingCities || !selectedCountry}
                >
                    <span className="truncate pr-2">
                        {loadingCities
                            ? "Cargando..."
                            : !selectedCountry
                                ? "Selecciona país primero"
                                : selectedCity !== "0" && cities.length > 0
                                    ? cities.find((c) => c.id.toString() === selectedCity)?.city_name || "Todas las ciudades"
                                    : "Todas las ciudades"}
                    </span>
                    <ChevronDown
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "city" ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </div>

            {/* Dropdown de ciudades */}
            {openDropdown === "city" && cities.length > 0 && createPortal(
                <div
                    data-city-portal="true"
                    className="fixed z-[999999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                    style={{
                        top: cityDropdownPosition.top,
                        left: cityDropdownPosition.left,
                        width: cityDropdownPosition.width,
                        maxHeight: '300px',
                    }}
                >
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/95 z-10">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar ciudad..."
                                className="w-full pl-7 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-white/80 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                value={dropdownSearch}
                                onChange={(e) => setDropdownSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                        {/* Opción "Todas las ciudades" */}
                        <button
                            onClick={() => {
                                handleOptionSelect("0", "city");
                                setOpenDropdown(null);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-orange-50 transition-colors sticky top-0 ${selectedCity === "0"
                                ? "bg-orange-100 text-orange-700 font-semibold"
                                : "bg-white text-gray-700"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span>🎯</span>
                                <span>Todas las ciudades</span>
                            </span>
                        </button>

                        {/* Lista de ciudades con scroll infinito */}
                        {filteredDisplayedCities.length > 0 ? (
                            filteredDisplayedCities.map((city, index) => (
                                <div
                                    key={city.id}
                                    ref={index === filteredDisplayedCities.length - 1 ? lastCityRef : null}
                                >
                                    <button
                                        onClick={() => {
                                            handleOptionSelect(city.id.toString(), "city");
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-orange-50 transition-colors ${selectedCity === city.id.toString()
                                            ? "bg-orange-100 text-orange-700 font-semibold"
                                            : "text-gray-700"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            <span className="truncate">{city.city_name}</span>
                                        </span>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
                                No se encontraron ciudades
                            </div>
                        )}

                        {/* Indicador de carga para más ciudades */}
                        {isLoadingMore && (
                            <div className="px-3 py-2 text-center">
                                <div className="inline-block w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Contador de ciudades totales */}
                        {!hasMore && cities.length > CITIES_PER_PAGE && (
                            <div className="px-3 py-2 text-[10px] text-gray-500 text-center border-t border-gray-100 bg-gray-50/50">
                                {cities.length} ciudades cargadas
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}