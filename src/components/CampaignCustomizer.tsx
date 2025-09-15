import { useState, useRef, useEffect } from 'react';
import { Upload, Image, User, Disc, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BackgroundType = 'album' | 'artist' | 'custom';

const POWERFUL_TITLES = [
  '🎵 ¡Escucha mi nuevo tema!',
  '🔥 Mi nueva música ya está aquí',
  '💫 Disponible en todas las plataformas',
  '🎧 Dale play a mi nuevo hit',
  '⭐ La canción que estabas esperando',
  '🚀 Descubre mi nueva creación'
];

interface CampaignCustomizerProps {
  onTitleChange: (title: string) => void;
  onBackgroundChange: (type: BackgroundType, url?: string) => void;
  onBlurChange: (isBlurred: boolean) => void;
}

export function CampaignCustomizer({ onTitleChange, onBackgroundChange, onBlurChange }: CampaignCustomizerProps) {
  const [campaignTitle, setCampaignTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('album');
  const [isBlurred, setIsBlurred] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (newTitle: string) => {
    setCampaignTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleBackgroundTypeChange = (type: BackgroundType) => {
    setBackgroundType(type);
    onBackgroundChange(type);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundType('custom');
      onBackgroundChange('custom', url);
    }
  };

  const handleBlurToggle = () => {
    const newBlurState = !isBlurred;
    setIsBlurred(newBlurState);
    onBlurChange(newBlurState);
  };

  // Initialize with empty title
  useEffect(() => {
    if (campaignTitle) {
      onTitleChange(campaignTitle);
    }
  }, []);

  return (
    <Card className="p-6 space-y-6">
      <h3 className="font-semibold text-foreground text-lg">Personalizar Anuncio</h3>
      
      {/* Title Editor */}
      <div className="space-y-3">
        <Label>Título del Anuncio</Label>
        {isEditingTitle ? (
          <div className="space-y-2">
            <Input
              value={campaignTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ingresa tu título..."
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsEditingTitle(false)}>
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingTitle(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-muted/50 rounded text-sm font-medium">
              {campaignTitle}
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsEditingTitle(true)}>
              Editar Título
            </Button>
          </div>
        )}
        
        {/* Quick Title Options */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Títulos sugeridos:</Label>
          <div className="grid grid-cols-1 gap-1">
            {POWERFUL_TITLES.slice(0, 3).map((title, index) => (
              <button
                key={index}
                onClick={() => handleTitleChange(title)}
                className="text-xs p-2 text-left hover:bg-muted/50 rounded transition-colors"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background Type */}
      <div className="space-y-3">
        <Label>Fondo del Anuncio</Label>
        <Select value={backgroundType} onValueChange={handleBackgroundTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="album">
              <div className="flex items-center gap-2">
                <Disc className="w-4 h-4" />
                Portada del Álbum
              </div>
            </SelectItem>
            <SelectItem value="artist">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Foto del Artista
              </div>
            </SelectItem>
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Personalizado
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Upload */}
      {backgroundType === 'custom' && (
        <div className="space-y-3">
          <Label>Subir Imagen/Video</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Imagen
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => videoInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Video
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Blur Toggle */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Efecto Blur
        </Label>
        <Button
          variant={isBlurred ? "default" : "outline"}
          size="sm"
          onClick={handleBlurToggle}
        >
          {isBlurred ? 'Activado' : 'Desactivado'}
        </Button>
      </div>
    </Card>
  );
}