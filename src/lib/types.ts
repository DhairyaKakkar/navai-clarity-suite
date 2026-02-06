// NavAI Types

export type ActionType = 'click' | 'type' | 'select' | 'upload' | 'scroll' | 'wait';

export interface GuidanceStep {
  stepNumber: number;
  instructionText: string;
  shortInstruction: string;
  targetSelector: string;
  expectedActionType: ActionType;
  completionCondition: string;
  hint?: string;
}

export interface TaskFlow {
  id: string;
  name: string;
  goal: string;
  steps: GuidanceStep[];
}

export interface FrictionSignal {
  type: 'misclick' | 'rage-click' | 'dead-click' | 'thrash-scroll' | 'hesitation' | 'backtrack' | 'form-friction' | 'pointer-jitter' | 'help-seeking';
  timestamp: number;
  details?: string;
  weight: number;
}

export interface FrictionEvent {
  signal: FrictionSignal;
  timestamp: number;
}

export interface SessionLog {
  events: FrictionEvent[];
  frictionScoreTimeline: { timestamp: number; score: number }[];
  startTime: number;
  endTime?: number;
}

export type AdaptationLevel = 0 | 1 | 2 | 3;

export interface UserPreferences {
  autoCalm: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  focusAssist: boolean;
}

export interface DemoState {
  currentSite: 'license' | 'bill' | 'university';
  currentStep: number;
  goal: string;
  isActive: boolean;
  adaptationLevel: AdaptationLevel;
  frictionScore: number;
  calmModeTriggered: boolean;
}

export interface SimulatedSiteProps {
  onAction: (selector: string, causedChange: boolean) => void;
  currentStep: GuidanceStep | null;
  isCalm: boolean;
  isFocusAssist: boolean;
}
