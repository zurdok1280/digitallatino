import React, { useEffect } from 'react';

const MusicWidget = () => {
    useEffect(() => {
        // Configuración para la comunicación entre ventanas
        const isMobile = false;
        const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        const eventer = window[eventMethod];
        const messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

        const processParentEvent = (e) => {
            // Aquí procesarías los eventos del iframe
            console.log('Evento recibido:', e);
        };

        eventer(messageEvent, processParentEvent);

        // Cargar scripts dinámicamente
        const loadScript = (src, integrity, crossorigin) => {
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

        // Cargar los scripts necesarios
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
            eventer(messageEvent, processParentEvent);
        };
    }, []);

    return (
        <div className="music-widget">
            <iframe
                id="iframeWidget"
                title="Music Widget"
                frameBorder="0"
                scrolling="no"
                width="100%"
                height="900"
                src="https://widgets.songtools.io/v1/CampaignTestX?app-key=21B0C76233F14B2CB724FE0134A0F167&autodetect=1"
                style={{
                    backgroundColor: 'transparent',
                    height: '900px',
                    border: '0px',
                    margin: '0',
                    padding: '0',
                    overflow: 'hidden'
                }}
                allow="clipboard-write"
            />
        </div>
    );
};

export default MusicWidget;