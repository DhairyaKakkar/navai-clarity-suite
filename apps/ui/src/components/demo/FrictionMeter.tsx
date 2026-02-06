import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdaptationLevel } from '@/lib/types';

interface FrictionMeterProps {
  score: number;
  level: AdaptationLevel;
  onWhyClick: () => void;
}

export function FrictionMeter({ score, level, onWhyClick }: FrictionMeterProps) {
  const getColor = () => {
    if (level === 0) return 'bg-friction-low';
    if (level === 1) return 'bg-friction-medium';
    return 'bg-friction-high';
  };

  const getLevelLabel = () => {
    switch (level) {
      case 0: return 'Normal';
      case 1: return 'Mild adaptation';
      case 2: return 'Calm Mode active';
      case 3: return 'Focus Assist recommended';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Adaptation Level</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onWhyClick}
          className="h-auto p-1 text-muted-foreground hover:text-foreground"
          aria-label="Why did this change?"
        >
          <Info className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      <div className="friction-meter">
        <div
          className={`friction-meter-fill ${getColor()}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Friction score: ${score}`}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">{getLevelLabel()}</p>
    </div>
  );
}
