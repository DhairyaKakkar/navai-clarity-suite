import { useState, useEffect, useRef, useCallback } from 'react';
import { FrictionDetector, exportSessionLog } from '@/lib/friction-detection';
import { AdaptationLevel } from '@/lib/types';

export function useFrictionDetection(
  isActive: boolean,
  onLevelChange?: (level: AdaptationLevel) => void
) {
  const [frictionScore, setFrictionScore] = useState(0);
  const [adaptationLevel, setAdaptationLevel] = useState<AdaptationLevel>(0);
  const detectorRef = useRef<FrictionDetector | null>(null);

  useEffect(() => {
    if (isActive && !detectorRef.current) {
      detectorRef.current = new FrictionDetector((score, level) => {
        setFrictionScore(score);
        if (level !== adaptationLevel) {
          setAdaptationLevel(level);
          onLevelChange?.(level);
        }
      });
    }

    return () => {
      if (detectorRef.current) {
        detectorRef.current.destroy();
        detectorRef.current = null;
      }
    };
  }, [isActive, adaptationLevel, onLevelChange]);

  const recordClick = useCallback((x: number, y: number, isOnTarget: boolean, causedStateChange: boolean) => {
    detectorRef.current?.recordClick(x, y, isOnTarget, causedStateChange);
  }, []);

  const recordScroll = useCallback((direction: 'up' | 'down') => {
    detectorRef.current?.recordScroll(direction);
  }, []);

  const recordFormFriction = useCallback((details: string) => {
    detectorRef.current?.recordFormFriction(details);
  }, []);

  const recordBacktrack = useCallback(() => {
    detectorRef.current?.recordBacktrack();
  }, []);

  const recordHelpSeeking = useCallback(() => {
    detectorRef.current?.recordHelpSeeking();
  }, []);

  const recordActivity = useCallback(() => {
    detectorRef.current?.recordActivity();
  }, []);

  const getTopSignals = useCallback(() => {
    return detectorRef.current?.getTopSignals() || [];
  }, []);

  const exportLog = useCallback(() => {
    if (detectorRef.current) {
      exportSessionLog(detectorRef.current.getSessionLog());
    }
  }, []);

  const reset = useCallback(() => {
    detectorRef.current?.reset();
    setFrictionScore(0);
    setAdaptationLevel(0);
  }, []);

  return {
    frictionScore,
    adaptationLevel,
    recordClick,
    recordScroll,
    recordFormFriction,
    recordBacktrack,
    recordHelpSeeking,
    recordActivity,
    getTopSignals,
    exportLog,
    reset,
  };
}
