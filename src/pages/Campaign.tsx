import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CampaignPreview } from "@/components/CampaignPreview";
import { CampaignCalculator } from "@/components/CampaignCalculator";
import { Search, Music, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpotifyTrack, CampaignMetrics } from "@/types/spotify";

export default function Campaign() {
  // Configurar la comunicación con el iframe
  useEffect(() => {
    const isMobile = false;
    const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    const eventer = window[eventMethod];
    const messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

    // Manejar los eventos del iframe
    const processParentEvent = (e) => {
      console.log('Evento recibido del iframe:', e);
    };

    eventer(messageEvent, processParentEvent);

    // Cleanup function
    return () => {
      if (eventMethod === "addEventListener") {
        window.removeEventListener(messageEvent, processParentEvent);
      } else if (eventMethod === "attachEvent") {
        window.detachEvent(messageEvent, processParentEvent);
      }
    };
  }, []);

  return (
    <>
      <div>
        <iframe
          id="iframeWidget"
          title="SongTools Campaign Widget"
          frameBorder="0"
          scrolling="no"
          width="100%"
          height="1200"
          src="https://widgets.songtools.io/v1/CampaignTestX?app-key=21B0C76233F14B2CB724FE0134A0F167&autodetect=1"
          style={{
            backgroundColor: 'transparent',
            height: '900px',
            border: '0px',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
          allow="clipboard-write"
        />
      </div>
    </>
  );
}