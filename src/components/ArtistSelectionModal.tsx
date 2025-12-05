import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check, AlertCircle, Loader2 } from "lucide-react";
import { digitalLatinoApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Artist {
  id: string;
  name: string;
  image_url: string;
  followers?: number;
}

interface ArtistSelectionModalProps {
  isOpen: boolean;
  onArtistSelected: (artistId: string, artistName: string) => Promise<void>;
}

export function ArtistSelectionModal({
  isOpen,
  onArtistSelected,
}: ArtistSelectionModalProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  //State for confirmation
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  //Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  //Search artists in Spotify API
  const searchArtists = useCallback(async (query: string) => {
    if (!query.trim()) {
      setArtists([]);
      return;
    }
    setLoading(true);
    try {
      const response = await digitalLatinoApi.getSearchSpotify(query);
      const allArtists = response.data.artists || [];

      //map simple interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedArtists = allArtists.map((a: any) => ({
        id: a.spotify_id,
        name: a.artist_name,
        image_url: a.image_url,
        followers: a.followers,
      }));
      setArtists(mappedArtists);
    } catch (error) {
      console.error("Error buscando artistas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  //Run search when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) searchArtists(debouncedQuery);
  }, [debouncedQuery, searchArtists]);

  //Handle artist selection
  const handleSelectClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowConfirm(true);
  };

  //Confirm and save  artist selection
  const handleConfirmSelection = async () => {
    if (!selectedArtist) return;

    setIsSaving(true);
    try {
      await onArtistSelected(selectedArtist.id, selectedArtist.name);
      toast({
        title: "Artista seleccionado",
        description: `Has seleccionado a ${selectedArtist.name} como tu artista.`,
        className: "bg-green-50 border-green-200",
      });
      setShowConfirm(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Hubo un error al seleccionar el artista. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Main Artist Selection Modal */}
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden bg-gradient-to-br from-white to-gray-50 border-purple-100"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold text-purple-700">
              Bienvenido al plan Artista
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 pt-2">
              Para comenzar, busca y selecciona el artista que desea monitoriar.
              <br />
              <span className="text-xs text-orange-500 font-medium">
                Nota: Esta selección es para tu suscripción actual.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Escribe el nombre del artista (ej. Shakira)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-white border-purple-200 focus-visible:ring-purple-500"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              </div>
            )}
          </div>
          {/* Artists List */}
          <ScrollArea className="h-[300px] mt-2 pr-4">
            {artists.length === 0 && searchQuery && !loading && (
              <p className="text-center text-gray-400 mt-8">
                No encontramos artistas con ese nombre.
              </p>
            )}
            <div className="space-y-2">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={artist.image_url} />
                      <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {artist.name}
                      </h4>
                      {artist.followers && (
                        <p className="text-xs text-gray-500">
                          {artist.followers.toLocaleString()} seguidores
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                    onClick={() => handleSelectClick(artist)}
                  >
                    Seleccionar
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Confirmar a {selectedArtist?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas seleccionar a {selectedArtist?.name}{" "}
              como tu artista monitoriado? Esta acción no se puede deshacer
              durante el periodo de suscripción actual.
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedArtist?.image_url} />
                </Avatar>
                <div>
                  <p className="font-bold text-blue-900">
                    {selectedArtist?.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    ID: {selectedArtist?.id}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSelection();
              }}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Confirmar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
