// Minimal client-side Spotify auth (Implicit Grant) and artist search
import type { SpotifyArtist } from '@/types/spotify';

const TOKEN_KEY = 'spotify_access_token';
const EXPIRES_KEY = 'spotify_access_token_expires_at';
const CLIENT_ID_KEY = 'spotify_client_id';

export function getStoredClientId() {
  return window.localStorage.getItem(CLIENT_ID_KEY) || '';
}

export function setStoredClientId(id: string) {
  window.localStorage.setItem(CLIENT_ID_KEY, id);
}

export function getToken(): string | null {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(window.localStorage.getItem(EXPIRES_KEY) || 0);
  if (!token || !expiresAt) return null;
  if (Date.now() > expiresAt) return null;
  return token;
}

export function parseTokenFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#')) return null;
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get('access_token');
  const expiresIn = params.get('expires_in');
  if (token) {
    const expiresAt = Date.now() + (Number(expiresIn || '3600') * 1000) - 60_000; // minus 1min buffer
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(EXPIRES_KEY, String(expiresAt));
    // Clean hash
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
    return token;
  }
  return null;
}

export function ensureSpotifyToken(): string | null {
  const parsed = parseTokenFromHash();
  if (parsed) return parsed;
  return getToken();
}

export function beginSpotifyImplicitAuth(clientId: string, redirectUri?: string) {
  const cid = clientId.trim();
  if (!cid) throw new Error('Client ID requerido');
  const redirect = redirectUri || window.location.origin;
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', cid);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirect);
  // Only public data (no scopes needed for search)
  // Add a trailing slash to match Spotify Dashboard if needed
  window.location.href = authUrl.toString();
}

export async function searchSpotifyArtistsAPI(query: string): Promise<SpotifyArtist[]> {
  const token = getToken();
  if (!token) throw new Error('NO_TOKEN');
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'artist');
  url.searchParams.set('limit', '8');
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    // token expired
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(EXPIRES_KEY);
    throw new Error('TOKEN_EXPIRED');
  }
  if (!res.ok) throw new Error('SPOTIFY_ERROR');
  const data = await res.json();
  const items = (data?.artists?.items || []) as any[];
  return items.map((a) => ({
    id: a.id,
    name: a.name,
    images: a.images || [],
    external_urls: a.external_urls || { spotify: '' },
  }));
}

// Public fallback: iTunes Search API (music artists)
export async function searchITunesArtistsAPI(query: string): Promise<SpotifyArtist[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', query);
  url.searchParams.set('entity', 'musicArtist');
  url.searchParams.set('media', 'music');
  url.searchParams.set('attribute', 'artistTerm');
  url.searchParams.set('limit', '8');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('ITUNES_ERROR');
  const data = await res.json();
  const items = (data?.results || []) as any[];
  return items.map((a) => ({
    id: String(a.artistId),
    name: a.artistName,
    images: [],
    external_urls: { spotify: a.artistLinkUrl || '' },
  }));
}
