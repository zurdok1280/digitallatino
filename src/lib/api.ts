// Configuración base para conexiones API
const API_CONFIG = {
  baseURL: "https://backend.digital-latino.com/api/",
  //baseURL: 'http://localhost:8084/api/',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Tipos para la API de Digital Latino
export interface Country {
  id: number;
  country?: string;
  country_name: string;
  description?: string;
}

export interface Format {
  id: number;
  format: string;
}

export interface City {
  id: number;
  city_name: string;
  country_code: string;
}

export interface TrendingSong {
  id: number;
  rank: string;
  artist: string;
  song: string;
}

export interface Song {
  cs_song: number;
  spotify_streams_total: number;
  tiktok_views_total: number;
  youtube_video_views_total: number;
  youtube_short_views_total: number;
  shazams_total: number;
  soundcloud_stream_total: number;
  pan_streams: number;
  audience_total: number;
  spins_total: number;
  score: number;
  rk_total: number;
  tw_spins: number;
  tw_aud: number;
  rk: number;
  spotify_streams: number;
  entid: number;
  length_sec: number;
  song: string;
  label: string;
  artists: string;
  crg: string;
  avatar: string;
  url: string;
  spotifyid: string;
}

// Tipos básicos para las respuestas
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
// interfaces para entradas de top plataforms
export interface TopTrendingPlatforms {
  rk: string;
  song: string;
  artist: string;
  label: string;
  data_res: number;
  cs_song: number;
  img: string;
}

// interfaces para entradas de Debut Songs
export interface DebutSongs {
  cs_song: number;
  song: string;
  artists: string;
  label: string;
  tw_score: number;
  lw_score: number;
  dif_score: number;
  rk_trending: number;
  crg: string;
  img: string;
}

// interfaces para entradas de top artists
export interface TopTrendingArtist {
  rk: string;
  artist: string;
  monthly_listeners: number;
  followers_total: number;
  popularity: number;
  streams_total: number;
  playlists: number;
  playlist_reach: number;
  followers_total_instagram: number;
  followers_total_tiktok: number;
  videos_views_total_youtube: number;
  followers_total_facebook: number;
  followers_total_twitter: number;
  spotify_streams: number;
  img: string;
}

//Interface Contry para buttonSongInfo/boxElementsDisplay
export interface CityDataForSong {
  audience?: number;
  cityid?: number;
  citylat?: number;
  citylng?: number;
  cityname?: string;
  listeners?: number;
  rnk?: number;
  spins?: number;
  sts?: number;

  countryId: number;
  csSong: number;
  country_code?: string;
  streams?: number;
}

//Interface SongInfo para buttonSongInfo/boxDisplayInfoPlatform.tsx
export interface SongInfoPlatform {
  rk: number;
  song: string;
  artists: string;
  label: string;
  score: number;
  cs_song: number;
  spotify_streams_total: number;
  spotify_popularity_current: number;
  spotify_playlists_current: number;
  spotify_playlists_reach_current: number;
  spotify_playlists_reach_total: number;
  spotify_charts_total: number;
  apple_playlists_current: number;
  apple_playlists_total: number;
  apple_charts_currents: number;
  apple_charts_total: number;
  amazon_playlists_current: number;
  amazon_paylists_total: number;
  amazon_charts_current: number;
  amazon_charts_total: number;
  deezer_popularity_current: number;
  deezer_playlists_current: number;
  deezer_playlists_total: number;
  deezer_playlist_reach_current: number;
  deezer_playlist_reach_total: number;
  deezer_charts_current: number;
  deezer_charts_total: number;
  tiktok_videos_total: number;
  tiktok_views_total: number;
  tiktok_likes_total: number;
  tiktok_shares_total: number;
  tiktok_comments_total: number;
  tiktok_engagement_rate_total: number;
  youtube_videos_total: number;
  youtube_video_views_total: number;
  youtube_video_likes_total: number;
  youtube_video_comments_total: number;
  youtube_shorts_total: number;
  youtube_short_views_total: number;
  youtube_short_likes_total: number;
  youtube_short_comments_total: number;
  youtube_engagement_rate_total: number;
  shazam_shazams_total: number;
  shazam_charts_current: number;
  shazam_charts_total: number;
  tidal_popularity_current: number;
  tidal_playlists_current: number;
  tidal_playlists_total: number;
  soundcloud_streams_total: number;
  soundcloud_favorites_total: number;
  soundcloud_reposts_total: number;
  soundcloud_engagement_rate_total: number;
  rk_spotify: number;
  rk_tiktok: number;
  rk_youtube: number;
  rk_shorts: number;
  rk_shazam: number;
  rk_soundcloud: number;
  rk_pandora: number;
  pan_streams: number;
}

// Interface para manejar info de la canción por cs_song
export interface SongBasicInfo {
  id: string;
  avatar: string;
  background: string;
  title: string;
  artist: string;
  label: string;
  url: string;
}
// Interface para manejar info de radio (Countries & Markets con Spins)
export interface SpinData {
  country?: string;
  market?: string;
  spins: number;
  rank: number;
}
//Interface para manejar info de TopPlaylists
export interface TopPlaylists {
  rank: number;
  spotify_id: string;
  playlist_name: string;
  owner_name: string;
  artwork: string;
  external_url: string;
  current_position: number;
  top_position: number;
  followers: number;
  type_name: string;
}
//Interface para manejar info de usos en Tiktok
export interface TikTokUse {
  rk: number;
  video_id: string;
  views_total: number;
  likes_total: number;
  comments_total: number;
  shares_total: number;
  tiktok_user_followers: number;
  username: string;
  user_handle: string;
}

// Clase principal para manejar las conexiones API
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL?: string, headers?: Record<string, string>) {
    this.baseURL = baseURL || API_CONFIG.baseURL;
    this.defaultHeaders = { ...API_CONFIG.headers, ...headers };
  }

  // Método privado para construir headers
  private buildHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...customHeaders,
    };
  }

  // Método privado para manejar respuestas
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw {
        message:
          data.message || `Error ${response.status}: ${response.statusText}`,
        status: response.status,
        code: data.code,
      } as ApiError;
    }

    return {
      data,
      status: response.status,
      success: true,
      message: data.message,
    };
  }

  // Método GET
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.buildHeaders(headers),
    });

    return this.handleResponse<T>(response);
  }

  // Método POST
  async post<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // Método PUT
  async put<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // Método DELETE
  async delete<T = any>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: this.buildHeaders(headers),
    });

    return this.handleResponse<T>(response);
  }

  // Método para establecer token de autenticación
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Método para remover token de autenticación
  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  // Método para cambiar la URL base
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }
}

// Instancia por defecto del cliente API
export const apiClient = new ApiClient();

// Funciones de conveniencia para uso directo
export const api = {
  get: <T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ) => apiClient.get<T>(endpoint, params, headers),

  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => apiClient.post<T>(endpoint, data, headers),

  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ) => apiClient.put<T>(endpoint, data, headers),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiClient.delete<T>(endpoint, headers),
};

// Funciones específicas para Digital Latino API
export const digitalLatinoApi = {
  // Obtener lista de países
  getCountries: (): Promise<ApiResponse<Country[]>> =>
    api.get<Country[]>("report/getCountries"),

  // Obtener formatos por país
  getFormatsByCountry: (countryId: number): Promise<ApiResponse<Format[]>> =>
    api.get<Format[]>(`report/getFormatbyCountry/${countryId}`),

  // Obtener ciudades por país (CRG siempre es "C")
  getCitiesByCountry: (countryId: number): Promise<ApiResponse<City[]>> =>
    api.get<City[]>(`report/getCities/${countryId}/C`),

  getChartDigital: (
    formatId: number,
    countryId: number,
    CRG: String,
    city: number
  ): Promise<ApiResponse<Song[]>> =>
    api.get<Song[]>(
      `report/getChartDigital/${formatId}/${countryId}/${CRG}/${city}`
    ),

  // Obtener Trending Top Songs
  getTrendingTopSongs: (
    rk: string,
    artist: string,
    monthly_listeners: number,
    format: string,
    country: string
  ): Promise<ApiResponse<TrendingSong[]>> =>
    api.get<TrendingSong[]>(`report/getTrendingSongs/${format}/${country}`),

  // Obtener Trending Top Platfomrs  trendingPlatforms
  getTrendingTopPlatforms: (
    platform: string,
    format: number,
    country: string
  ): Promise<ApiResponse<TopTrendingPlatforms[]>> =>
    api.get<TopTrendingPlatforms[]>(
      `report/getTopPlatform/${platform}/${format}/${country}`
    ),

  // Obtener Trending Top Artists
  getTrendingTopArtists: (
    format: string,
    country: string
  ): Promise<ApiResponse<TrendingSong[]>> =>
    api.get<TrendingSong[]>(`report/getTopArtist/${format}/${country}`),

  //// Obtener Trending Debut Songs  debutSongs
  getDebutSongs: (
    format: number,
    country: number,
    CRG: string,
    city: number
  ): Promise<ApiResponse<DebutSongs[]>> =>
    api.get<DebutSongs[]>(
      `report/getTrendingDebut/${format}/${country}/${CRG}/${city}`
    ),
  //Contry para buttonSongInfo/boxElementsDisplay
  getCityData: (
    csSong: number,
    countryId: number
  ): Promise<ApiResponse<CityDataForSong[]>> =>
    api.get<CityDataForSong[]>(`report/getCityData/${csSong}/${countryId}`),
  // Obtener información de la canción por plataforma
  getSongPlatformData: (
    csSong: number,
    formatId: number
  ): Promise<ApiResponse<SongInfoPlatform[]>> =>
    api.get<SongInfoPlatform[]>(`report/getSongDigital/${csSong}/${formatId}`),
  // Obtener información básica de la canción por cs_song
  getSongById: (csSong: number): Promise<ApiResponse<SongBasicInfo>> =>
    api.get<SongBasicInfo>(`report/getSongbyId/${csSong}`),
  // Obtener top países de radio por canción
  getTopRadioCountries: (csSong: number): Promise<ApiResponse<SpinData[]>> =>
    api.get<SpinData[]>(`report/getTopRadioCountries/${csSong}`),
  // Obtener top mercados de radio por cs_song y país
  getTopMarketRadio: (
    csSong: number,
    countryId: number
  ): Promise<ApiResponse<SpinData[]>> =>
    api.get<SpinData[]>(`report/getTopMarketRadio/${csSong}/${countryId}`),
  //Obtener playlists por cs_song y tipo de playlist
  getTopPlaylists: (
    csSong: number,
    typePlaylist: number
  ): Promise<ApiResponse<TopPlaylists[]>> =>
    api.get<TopPlaylists[]>(`report/getTopPlaylists/${csSong}/${typePlaylist}`),
  //Obtener usos en Tiktok por cs_song
  getTikTokUses: (csSong: number): Promise<ApiResponse<TikTokUse[]>> =>
    api.get<TikTokUse[]>(`report/getTopTiktok/${csSong}`),
};

// Ejemplo de uso:
/*
// GET request
const users = await api.get('/users', { page: 1, limit: 10 });

// POST request
const newUser = await api.post('/users', { 
  name: 'Juan Pérez', 
  email: 'juan@ejemplo.com' 
});

// Con autenticación
apiClient.setAuthToken('tu-jwt-token-aqui');
const protectedData = await api.get('/protected-endpoint');

// Manejo de errores
try {
  const result = await api.get('/endpoint');
  console.log(result.data);
} catch (error) {
  console.error('Error API:', error.message);
}

// Usar la API de Digital Latino
const countries = await digitalLatinoApi.getCountries();
*/
