import React, { useEffect } from 'react';

const SongToolsWidget = () => {
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
  );
};

export default SongToolsWidget;