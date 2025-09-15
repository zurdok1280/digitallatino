import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface SpotifyAuthProps {
  onConnect: (clientId: string) => void;
  isConnected: boolean;
  defaultClientId?: string;
}

export function SpotifyAuth({ onConnect, isConnected, defaultClientId }: SpotifyAuthProps) {
  const [clientId, setClientId] = useState(() => defaultClientId || window.localStorage.getItem('spotify_client_id') || '');

  const handleConnect = () => {
    if (clientId.trim()) {
      onConnect(clientId.trim());
    }
  };

  // Auto-connect if we have a valid clientId and aren't already connected
  useEffect(() => {
    if (clientId.trim() && !isConnected) {
      handleConnect();
    }
  }, [clientId, isConnected]);

  if (isConnected) {
    return (
      <Card className="p-6 bg-gradient-card border-primary/20 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-spotify flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
        <div>
          <h3 className="font-semibold text-foreground">¡Spotify conectado!</h3>
          <p className="text-sm text-muted-foreground">Tu catálogo musical está listo para promocionar</p>
        </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-spotify/10 flex items-center justify-center">
          <Music className="w-8 h-8 text-spotify" />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Conecta tu cuenta de Spotify</h2>
          <p className="text-muted-foreground text-sm">
            Accede a tu catálogo musical para crear campañas promocionales
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleConnect}
            disabled={!clientId.trim()}
            className="w-full bg-spotify hover:bg-spotify-hover"
          >
            Conectar con Spotify
          </Button>
          <p className="text-xs text-muted-foreground">
            Usaremos tu configuración guardada automáticamente.
          </p>
        </div>
      </div>
    </Card>
  );
}