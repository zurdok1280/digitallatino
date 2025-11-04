import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';


const SongToolsWidget = () => {
  const { token } = useAuth();
  const baseUrl = "https://widgets.songtools.io/v1/CampaignTestX?app-key=21B0C76233F14B2CB724FE0134A0F167&autodetect=1";
  const iframeSrc = token ? `${baseUrl}&jwt=${token}` : baseUrl;
  useEffect(() => {
    // Configurar la comunicación con el iframe
    const isMobile = false;
    const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    const eventer = window[eventMethod];
    const messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    

    const processParentEvent = (e) => {
      console.log('Evento recibido del iframe:', e);
    };

    eventer(messageEvent, processParentEvent);
    const loadScript = (src: string, integrity?: string, crossorigin?: string) => {
    return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    if (integrity) script.integrity = integrity;
    if (crossorigin) script.crossOrigin = crossorigin;
   script.onload = resolve;
   script.onerror = reject;
   document.head.appendChild(script);
  });
 };
   loadScript(
    'https://digitallatino.songtools.io/js/wixgetcontent.js?v=1738787616'
    );
   loadScript(
    'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=6706d724bb0e4c6b5a5c849b',
    'sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=',
    'anonymous'
   );
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
    <div>
      <iframe
        id="iframeWidget"
        title="SongTools Campaign Widget"
        frameBorder="0"
        scrolling="no"
        width="100%"
        height="1200"
        src={iframeSrc}
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
  );
};

export default SongToolsWidget;