// Utilities to load and fuzzy-search cities for LATAM + Spain
import Fuse from 'fuse.js';

export type CityEntry = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
};

// ISO Alpha-2 codes for target countries (20 LATAM + Spain + Brazil optional)
export const TARGET_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  // Opcional: Brasil
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
];

export function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function toId(countryCode: string, cityName: string) {
  return `${countryCode}-${normalize(cityName).replace(/[^a-z0-9]+/g, '-')}`;
}

// Major cities for each target country (manually curated for reliability)
const MAJOR_CITIES: Record<string, string[]> = {
  'MX': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'San Luis Potosí', 'Mérida', 'Mexicali', 'Aguascalientes', 'Cuernavaca', 'Saltillo', 'Hermosillo', 'Culiacán', 'Chihuahua', 'Morelia', 'Veracruz', 'Villahermosa', 'Cancún', 'Reynosa', 'Matamoros', 'Tampico', 'Tepic', 'Zapopan', 'Tlalnepantla', 'Naucalpan'],
  'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Soledad', 'Ibagué', 'Bucaramanga', 'Soacha', 'Santa Marta', 'Villavicencio', 'Valledupar', 'Pereira', 'Montería', 'Itagüí', 'Pasto', 'Manizales', 'Neiva', 'Palmira', 'Popayán', 'Buenaventura', 'Dos Quebradas', 'Tunja', 'Floridablanca', 'Riohacha', 'Girardot'],
  'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe', 'Corrientes', 'Bahía Blanca', 'Resistencia', 'Neuquén', 'Santiago del Estero', 'Posadas', 'San Salvador de Jujuy', 'Paraná', 'Formosa', 'San Juan', 'Santa Rosa', 'Río Cuarto', 'Comodoro Rivadavia', 'San Luis', 'Catamarca', 'La Rioja', 'Río Gallegos', 'Ushuaia'],
  'PE': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna', 'Ica', 'Juliaca', 'Sullana', 'Chincha Alta', 'Ayacucho', 'Cajamarca', 'Pucallpa', 'Huánuco', 'Tarapoto', 'Puno', 'Tumbes', 'Talara', 'Jaén', 'Ilo', 'Moquegua', 'Abancay', 'Cerro de Pasco', 'Huaraz'],
  'VE': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'San Cristóbal', 'Maturín', 'Ciudad Bolívar', 'Cumaná', 'Mérida', 'Barcelona', 'Punto Fijo', 'Los Teques', 'Guarenas', 'Petare', 'Turmero', 'Barinas', 'Catia La Mar', 'El Tigre', 'Carúpano', 'Guanare', 'Acarigua', 'Valera', 'Cabimas'],
  'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán', 'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Coquimbo', 'Osorno', 'Valdivia', 'Punta Arenas', 'Copiapó', 'Quillota', 'Curicó', 'Ovalle', 'Linares', 'Quilpué', 'San Antonio', 'Melipilla', 'Villa Alemana'],
  'EC': ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 'Manta', 'Portoviejo', 'Ambato', 'Riobamba', 'Loja', 'Esmeraldas', 'Ibarra', 'Milagro', 'La Libertad', 'Babahoyo', 'Quevedo', 'Latacunga', 'Sangolquí', 'Daule', 'Pasaje', 'Chone', 'Santa Elena', 'El Carmen', 'Ventanas', 'Rosa Zárate', 'Azogues'],
  'BO': ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí', 'Trinidad', 'Cobija', 'Riberalta', 'Montero', 'Warnes', 'Yacuiba', 'Quillacollo', 'Sacaba', 'Tiquipaya', 'El Alto', 'Viacha', 'Camiri', 'Villazón', 'Bermejo', 'Guayaramerín', 'San Ignacio de Velasco', 'Tupiza', 'Uyuni'],
  'PY': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Limpio', 'Ñemby', 'Encarnación', 'Mariano Roque Alonso', 'Pedro Juan Caballero', 'Coronel Oviedo', 'Villarrica', 'Concepción', 'Pilar', 'Caaguazú', 'Paraguarí', 'Itauguá', 'Villa Elisa', 'Caacupé', 'Areguá', 'Itá', 'Villa Hayes', 'Hernandarias'],
  'UY': ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes', 'Artigas', 'Minas', 'San José de Mayo', 'Durazno', 'Florida', 'Barros Blancos', 'Ciudad de la Costa', 'Treinta y Tres', 'Rocha', 'San Carlos', 'Punta del Este', 'Colonia del Sacramento', 'Fray Bentos', 'Trinidad', 'Carmelo', 'Nueva Helvecia'],
  'CR': ['San José', 'Cartago', 'Puntarenas', 'Alajuela', 'Heredia', 'Liberia', 'Paraíso', 'Desamparados', 'San Isidro', 'Curridabat', 'San Vicente', 'Turrialba', 'Grecia', 'Purral', 'San Rafael', 'Naranjo', 'Palmares', 'Orotina', 'Atenas', 'San Ramón', 'Guápiles', 'Pococí', 'San Carlos', 'Upala', 'Buenos Aires'],
  'PA': ['Panamá', 'San Miguelito', 'Tocumen', 'David', 'Arraiján', 'Colón', 'La Chorrera', 'Pacora', 'Veracruz', 'Santiago', 'Chitré', 'Vista Alegre', 'Boquete', 'Aguadulce', 'Bugaba', 'Los Santos', 'Penonomé', 'Changuinola', 'Las Tablas', 'Capira', 'El Porvenir', 'Chepo', 'Volcán', 'Antón', 'Ocú'],
  'NI': ['Managua', 'León', 'Masaya', 'Chinandega', 'Matagalpa', 'Estelí', 'Granada', 'Jinotega', 'Juigalpa', 'Nueva Guinea', 'Boaco', 'Rivas', 'Somoto', 'San Carlos', 'Ocotal', 'Jalapa', 'Diriamba', 'Tipitapa', 'Sébaco', 'Ciudad Sandino', 'Nagarote', 'Corinto', 'Bluefields', 'Camoapa', 'La Trinidad'],
  'HN': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso', 'Choluteca', 'Comayagua', 'Puerto Cortés', 'La Lima', 'Danlí', 'Siguatepeque', 'Juticalpa', 'Tocoa', 'Catacamas', 'Tela', 'La Entrada', 'Villanueva', 'San Lorenzo', 'Nacaome', 'Santa Rosa de Copán', 'Olanchito', 'Potrerillos', 'La Paz', 'Yoro', 'El Paraíso'],
  'SV': ['San Salvador', 'Soyapango', 'Santa Ana', 'San Miguel', 'Mejicanos', 'Apopa', 'Delgado', 'Ilopango', 'Cuscatancingo', 'Ahuachapán', 'Usulután', 'Zacatecoluca', 'Chalatenango', 'Sensuntepeque', 'San Vicente', 'La Unión', 'Quezaltepeque', 'Olocuilta', 'Antiguo Cuscatlán', 'San Marcos', 'Sonzacate', 'Cojutepeque', 'Metapán', 'Acajutla', 'Jiquilisco'],
  'GT': ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Petapa', 'San Juan Sacatepéquez', 'Quetzaltenango', 'Villa Canales', 'Escuintla', 'Chinautla', 'Chimaltenango', 'Huehuetenango', 'Amatitlán', 'Totonicapán', 'Santa Catarina Pinula', 'Santa Lucía Cotzumalguapa', 'Puerto Barrios', 'San Francisco El Alto', 'Cobán', 'Antigua Guatemala', 'Jalapa', 'Chiquimula', 'Mazatenango', 'Retalhuleu', 'Jutiapa', 'Sololá'],
  'CU': ['La Habana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara', 'Guantánamo', 'Bayamo', 'Las Tunas', 'Cienfuegos', 'Pinar del Río', 'Matanzas', 'Ciego de Ávila', 'Sancti Spíritus', 'Manzanillo', 'Cárdenas', 'Palma Soriano', 'Contramaestre', 'Morón', 'Florida', 'San José de las Lajas', 'Placetas', 'Sagua la Grande', 'Artemisa', 'Colón', 'Jovellanos'],
  'DO': ['Santo Domingo', 'Santiago', 'Los Alcarrizos', 'La Romana', 'San Pedro de Macorís', 'San Cristóbal', 'San Francisco de Macorís', 'Puerto Plata', 'La Vega', 'Cotuí', 'Bella Vista', 'Baní', 'Azua', 'Moca', 'Bonao', 'Higüey', 'Mao', 'Barahona', 'Hato Alcántara', 'Esperanza', 'Constanza', 'Dajabón', 'Monte Cristi', 'Samaná', 'San Juan'],
  'PR': ['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas', 'Guaynabo', 'Arecibo', 'Toa Baja', 'Mayagüez', 'Trujillo Alto', 'Toa Alta', 'Aguadilla', 'Humacao', 'Vega Alta', 'Vega Baja', 'Dorado', 'Fajardo', 'Cayey', 'Canóvanas', 'Río Grande', 'Gurabo', 'Juana Díaz', 'Cidra', 'Coamo', 'Isabela'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'A Coruña', 'Elche', 'Granada', 'Oviedo', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez', 'Sabadell', 'Móstoles', 'Santa Cruz', 'Pamplona', 'Almería', 'Fuenlabrada', 'Leganés', 'Donostia', 'Burgos', 'Santander', 'Castellón', 'Alcorcón', 'Albacete', 'Getafe', 'Salamanca', 'Huelva', 'Logroño', 'Badajoz', 'San Sebastián'],
  'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Nova Iguaçu', 'Teresina', 'Natal', 'Campo Grande', 'São Bernardo', 'João Pessoa', 'Santo André', 'Osasco', 'Jaboatão', 'Contagem', 'Ribeirão Preto'],
};

export function loadLatamCities(): CityEntry[] {
  const all: CityEntry[] = [];
  
  for (const country of TARGET_COUNTRIES) {
    const cities = MAJOR_CITIES[country.code] || [];
    for (const cityName of cities) {
      all.push({
        id: toId(country.code, cityName),
        name: cityName,
        country: country.name,
        countryCode: country.code,
      });
    }
  }
  
  return all;
}

export function buildCitiesIndex(cities: CityEntry[]) {
  const fuse = new Fuse(cities, {
    keys: [
      { name: 'name', weight: 0.8 },
      { name: 'country', weight: 0.2 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    distance: 100,
    minMatchCharLength: 1,
    findAllMatches: true,
    useExtendedSearch: false,
  });

  const byId = new Map<string, CityEntry>();
  cities.forEach((c) => byId.set(c.id, c));

  return { fuse, byId };
}

// Local-only search (sync) using Fuse or simple filter
export function searchCitiesLocal(query: string, fuse?: Fuse<CityEntry>, cities?: CityEntry[]): CityEntry[] {
  const q = query.trim();
  if (!q) return [];
  if (fuse) return (fuse.search(q).map((r: any) => r.item) as CityEntry[]).slice(0, 8);
  const list = cities || loadLatamCities();
  return list.filter((c) => normalize(c.name).includes(normalize(q))).slice(0, 8);
}

// Simple in-memory cache for remote city results
const cityRemoteCache = new Map<string, CityEntry[]>();

export async function searchCitiesRemote(query: string): Promise<CityEntry[]> {
  const q = query.trim();
  if (!q) return [];
  const cacheKey = normalize(q);
  if (cityRemoteCache.has(cacheKey)) return cityRemoteCache.get(cacheKey)!;
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');
    url.searchParams.set('q', q);
    url.searchParams.set('countrycodes', getCountryCodesParam());

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = (await res.json()) as NominatimResult[];
    const seen = new Set<string>();
    const mapped: CityEntry[] = [];
    for (const r of data) {
      const entry = resultToCityEntry(r);
      if (entry && !seen.has(entry.id) && mapped.length < 8) {
        seen.add(entry.id);
        mapped.push(entry);
      }
    }
    cityRemoteCache.set(cacheKey, mapped);
    return mapped;
  } catch {
    return [];
  }
}


// Remote city search using OpenStreetMap Nominatim (no API key required)
function getCountryCodesParam() {
  return TARGET_COUNTRIES.map((c) => c.code.toLowerCase()).join(',');
}

type NominatimResult = {
  display_name?: string;
  name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

function resultToCityEntry(r: NominatimResult): CityEntry | null {
  const code = (r.address?.country_code || '').toUpperCase();
  const country = r.address?.country || '';
  if (!code || !country) return null;
  if (!TARGET_COUNTRIES.find((c) => c.code === code)) return null;
  const name = r.address?.city || r.address?.town || r.address?.village || r.name || (r.display_name || '').split(',')[0]?.trim();
  if (!name) return null;
  return {
    id: toId(code, name),
    name,
    country,
    countryCode: code,
  };
}

export async function searchCities(query: string, fuse?: Fuse<CityEntry>): Promise<CityEntry[]> {
  const q = query.trim();
  if (!q) return [];
  
  // First: try local search (faster)
  let localResults: CityEntry[] = [];
  if (fuse) {
    localResults = (fuse.search(q).map((r: any) => r.item) as CityEntry[]).slice(0, 8);
  } else {
    localResults = loadLatamCities()
      .filter((c) => normalize(c.name).includes(normalize(q)))
      .slice(0, 8);
  }
  
  // If we have good local results, return them immediately
  if (localResults.length >= 3) return localResults;
  
  // Otherwise, try remote search for better coverage
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');
    url.searchParams.set('q', q);
    url.searchParams.set('countrycodes', getCountryCodesParam());

    const res = await fetch(url.toString());

    if (res.ok) {
      const data = (await res.json()) as NominatimResult[];
      const seen = new Set<string>();
      const mapped: CityEntry[] = [];
      
      // Add local results first
      for (const local of localResults) {
        seen.add(local.id);
        mapped.push(local);
      }
      
      // Add remote results
      for (const r of data) {
        const entry = resultToCityEntry(r);
        if (entry && !seen.has(entry.id) && mapped.length < 8) {
          seen.add(entry.id);
          mapped.push(entry);
        }
      }
      return mapped;
    }
  } catch (e) {
    // Silent fallback to local only
  }

  return localResults;
}

