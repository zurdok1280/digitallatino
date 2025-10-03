import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoginButton } from "@/components/LoginButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { SpotifyTrack } from "@/types/spotify";
interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {

  // Spotify search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [loading1, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <main className="flex-1">
          {/* Header with sidebar trigger and login */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
            <div className="flex items-center justify-between">
              {/* Search Section */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative ">
                      <Input
                        placeholder="Buscar artista o canción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm shadow-md focus:ring-2 focus:ring-blue-400 pr-10"
                      />
                      {/* Loading */}
                      {loadingSearch && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => searchQuery.trim() && searchTracks(searchQuery)}
                      disabled={loadingSearch || !searchQuery.trim()}
                      className="rounded-2xl bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 px-6 py-3 text-white hover:from-slate-700 hover:via-gray-800 hover:to-blue-800"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Search Results en tiempo real */}
                  {showSearchResults && (
                    <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-700">
                            {searchResults.length > 0
                              ? `${searchResults.length} resultados encontrados`
                              : 'Buscando...'
                            }
                          </h3>
                          <button
                            onClick={() => {
                              setShowSearchResults(false);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="text-slate-400 hover:text-slate-600 transition-colors text-xs"
                          >
                            ✕ Cerrar
                          </button>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.length > 0 ? (
                          searchResults.map((track) => (
                            <div key={track.id} className="border-b border-gray-100 last:border-b-0">
                              <SearchResult
                                track={track}
                                onSelect={handleSearchResultSelect}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            {loadingSearch ? 'Buscando...' : 'No se encontraron resultados'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {!showSearchResults && searchQuery && (
                  <div className="text-xs text-slate-500 text-center">
                    Escribe para buscar en tiempo real...
                  </div>
                )}
              </div>
              <SidebarTrigger />
              <LoginButton />
            </div>
          </div>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}