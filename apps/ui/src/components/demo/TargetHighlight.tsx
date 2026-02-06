import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TargetHighlightProps {
  selector: string;
  containerRef: React.RefObject<HTMLDivElement>;
  isCalm?: boolean;
}

export function TargetHighlight({ selector, containerRef, isCalm }: TargetHighlightProps) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const element = container.querySelector(selector);
      
      if (element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        const top = elementRect.top - containerRect.top + container.scrollTop;
        const left = elementRect.left - containerRect.left + container.scrollLeft;
        
        setPosition({
          top,
          left,
          width: elementRect.width,
          height: elementRect.height,
        });

        // Determine arrow position based on element location
        const centerX = left + elementRect.width / 2;
        const centerY = top + elementRect.height / 2;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        if (centerY < containerHeight / 3) {
          setArrowPosition('bottom');
        } else if (centerY > (containerHeight * 2) / 3) {
          setArrowPosition('top');
        } else if (centerX < containerWidth / 2) {
          setArrowPosition('right');
        } else {
          setArrowPosition('left');
        }
      } else {
        setPosition(null);
      }
    };

    updatePosition();
    
    // Update on scroll/resize
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updatePosition, { passive: true });
    }
    window.addEventListener('resize', updatePosition, { passive: true });
    
    // Also update periodically in case the element moves (form state changes, etc.)
    const interval = setInterval(updatePosition, 500);

    return () => {
      if (container) {
        container.removeEventListener('scroll', updatePosition);
      }
      window.removeEventListener('resize', updatePosition);
      clearInterval(interval);
    };
  }, [selector, containerRef]);

  if (!position) return null;

  const padding = isCalm ? 8 : 4;
  const arrowSize = 24;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="absolute pointer-events-none z-20"
        style={{
          top: position.top - padding,
          left: position.left - padding,
          width: position.width + padding * 2,
          height: position.height + padding * 2,
        }}
        aria-hidden="true"
      >
        {/* Highlight box */}
        <div className={`target-highlight w-full h-full ${isCalm ? 'ring-4' : 'ring-2'}`} />
        
        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute text-primary"
          style={{
            ...(arrowPosition === 'top' && {
              top: -arrowSize - 8,
              left: '50%',
              transform: 'translateX(-50%)',
            }),
            ...(arrowPosition === 'bottom' && {
              bottom: -arrowSize - 8,
              left: '50%',
              transform: 'translateX(-50%) rotate(180deg)',
            }),
            ...(arrowPosition === 'left' && {
              left: -arrowSize - 8,
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
            }),
            ...(arrowPosition === 'right' && {
              right: -arrowSize - 8,
              top: '50%',
              transform: 'translateY(-50%) rotate(90deg)',
            }),
          }}
        >
          <svg width={arrowSize} height={arrowSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L8 10H16L12 2Z" />
            <rect x="10" y="10" width="4" height="12" rx="1" />
          </svg>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
