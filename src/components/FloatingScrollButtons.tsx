import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface FloatingScrollButtonsProps {
  topOffset?: number; // px desde el top
  rightOffset?: number; // px desde la derecha
  bottomOffset?: number; // px desde el bottom
  showTopThreshold?: number; // px de scroll para mostrar botón arriba
  hideBottomThreshold?: number; // px del final para ocultar botón abajo
  className?: string;
}

export const FloatingScrollButtons: React.FC<FloatingScrollButtonsProps> = ({
  topOffset = 6,
  rightOffset = 6,
  bottomOffset = 6,
  showTopThreshold = 300,
  hideBottomThreshold = 100,
  className = ''
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botón de subir cuando se haya scrolleado más del threshold
      setShowScrollTop(window.scrollY > showTopThreshold);

      // Ocultar botón de bajar cuando estemos cerca del final
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = documentHeight - (scrollTop + windowHeight);

      setShowScrollBottom(scrollBottom > hideBottomThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    // Llamar una vez para establecer el estado inicial
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showTopThreshold, hideBottomThreshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const buttonStyle = {
    right: `${rightOffset}px`,
    bottom: `${bottomOffset}px`
  };

  const topButtonStyle = {
    right: `${rightOffset}px`,
    top: `${topOffset}px`
  };

  return (
    <div className={`fixed z-40 flex flex-col gap-3 ${className}`}>
      {/* Botón para subir - aparece cuando se hace scroll hacia abajo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={topButtonStyle}
          className="fixed w-12 h-12 bg-white/80 backdrop-blur-sm border border-white/30 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Subir al principio"
        >
          <ArrowUp className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
        </button>
      )}

      {/* Botón para bajar - desaparece cuando estamos cerca del final */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          style={buttonStyle}
          className="fixed w-12 h-12 bg-white/80 backdrop-blur-sm border border-white/30 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Bajar al final"
        >
          <ArrowDown className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
        </button>
      )}
    </div>
  );
};

export default FloatingScrollButtons;