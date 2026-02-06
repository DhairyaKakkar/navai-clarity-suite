import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { AdaptationLevel } from '@/lib/types';
import { ShieldCheck } from 'lucide-react';

interface WhyChangedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: number;
  totalSteps: number;
  frictionScore: number;
  adaptationLevel: AdaptationLevel;
  topSignals: { type: string; count: number; details?: string }[];
}

const signalLabels: Record<string, string> = {
  'misclick': 'Misclicks',
  'rage-click': 'Rapid clicks',
  'dead-click': 'Clicks with no effect',
  'thrash-scroll': 'Scroll reversals',
  'hesitation': 'Long pauses',
  'backtrack': 'Navigation back-and-forth',
  'form-friction': 'Form difficulties',
  'pointer-jitter': 'Mouse movement',
  'help-seeking': 'Help button clicks',
};

export function WhyChangedDrawer({
  open,
  onOpenChange,
  currentStep,
  totalSteps,
  frictionScore,
  adaptationLevel,
  topSignals,
}: WhyChangedDrawerProps) {
  const getLevelDescription = () => {
    switch (adaptationLevel) {
      case 0:
        return 'The UI is in its default state. No adaptations are currently active.';
      case 1:
        return 'We noticed some friction signals. The UI has slightly increased spacing and a hint option is available.';
      case 2:
        return 'Calm Mode is active. Distractions are dimmed and instructions are simplified.';
      case 3:
        return 'Focus Assist is recommended. Consider enabling it to hide all non-essential elements.';
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Why did the UI change?</DrawerTitle>
          <DrawerDescription>
            NavAI adapts based on your interactions — here's what triggered it.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4 space-y-6">
          {/* Current state */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current State</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Step</span>
                <p className="font-medium">{currentStep} / {totalSteps}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Friction Score</span>
                <p className="font-medium">{frictionScore}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Adaptation Level</span>
                <p className="font-medium">{adaptationLevel}</p>
              </div>
            </div>
          </div>

          {/* What triggered it */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Detected Signals</h4>
            {topSignals.length > 0 ? (
              <ul className="space-y-2">
                {topSignals.map((signal, i) => (
                  <li key={i} className="flex items-center justify-between text-sm bg-muted rounded-lg px-3 py-2">
                    <span>{signalLabels[signal.type] || signal.type}</span>
                    <span className="text-muted-foreground">×{signal.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant signals detected.</p>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">What This Means</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getLevelDescription()}
            </p>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-3 bg-navai-surface rounded-lg p-3">
            <ShieldCheck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              All data stays on this device. NavAI does not make any medical inferences — 
              adaptations are based purely on interaction patterns.
            </p>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
