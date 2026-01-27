import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoginButton } from "@/components/LoginButton";
import { SearchArtist } from "./ui/searchArtist";
import { ArtistSelectionModal } from "@/components/ArtistSelectionModal";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, token, login } = useAuth();
  const [showArtistModal, setShowArtistModal] = useState(false);
  useEffect(() => {
    if (user?.role === 'ARTIST' && !user.allowedArtistId) {
      setShowArtistModal(true);
    } else {
      setShowArtistModal(false);
    }
  }, [user]);


  const handleArtistSelection = async (artistId: string, artistName: string) => {
    if (!token) return;
    try {
      const response = await fetch('https://security.digital-latino.com/api/auth/select-artist', {
        //const response = await fetch('http://localhost:8085/api/auth/select-artist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ artistId, artistName }),
      });
      if (!response.ok) {
        throw new Error('Error al seleccionar el artista');
      }

      const data = await response.json();

      if (data.token) {
        // Save token to localStorage
        localStorage.setItem('authToken', data.token);
        window.location.reload();

      }

    } catch (error) {
      console.error("❌ Error:", error);
    }

  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <main className="flex-1">
          {/* Header with sidebar trigger and login */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
            <div className="flex items-center justify-between">
              {/* Izquierda: SidebarTrigger */}
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2">
                {user?.role !== 'ARTIST' && <SearchArtist />}
              </div>
              <div className="ml-auto">
                <LoginButton />
              </div>
            </div>
          </div>

          {children}
        </main>
        {/*Artist Selection Modal*/}
        <ArtistSelectionModal
          isOpen={showArtistModal}
          onArtistSelected={handleArtistSelection}
        />

      </div>
    </SidebarProvider>
  );
}