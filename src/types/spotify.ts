export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
  duration_ms: number;
  popularity: number;
}

export interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface SpotifyAuthConfig {
  client_id: string;
  redirect_uri: string;
  scope: string;
}

export interface CampaignMetrics {
  cpc: number;
  cpa: number;
  clicks: number;
  conversions: number;
  streams: number;
  totalBudget: number;
}

export interface GenreDefaults {
  label: string;
  baseCPC: number;
  baseCPA: number;
  scalingFactor: number;
}