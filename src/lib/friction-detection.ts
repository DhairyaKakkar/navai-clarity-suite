import { FrictionSignal, FrictionEvent, AdaptationLevel } from './types';

// Signal weights for friction score calculation
const SIGNAL_WEIGHTS: Record<FrictionSignal['type'], number> = {
  'misclick': 8,
  'rage-click': 25,
  'dead-click': 5,
  'thrash-scroll': 12,
  'hesitation': 10,
  'backtrack': 15,
  'form-friction': 10,
  'pointer-jitter': 3,
  'help-seeking': 5,
};

// Time window for calculating friction score (in ms)
const ROLLING_WINDOW_MS = 15000;

// Thresholds for adaptation levels
const ADAPTATION_THRESHOLDS: Record<AdaptationLevel, number> = {
  0: 0,
  1: 25,
  2: 50,
  3: 75,
};

export class FrictionDetector {
  private events: FrictionEvent[] = [];
  private lastClickTime = 0;
  private lastClickPos = { x: 0, y: 0 };
  private clickCount = 0;
  private lastScrollDirection: 'up' | 'down' | null = null;
  private scrollReversals = 0;
  private lastScrollTime = 0;
  private lastActivityTime = Date.now();
  private idleCheckInterval: number | null = null;
  private onScoreChange?: (score: number, level: AdaptationLevel) => void;

  constructor(onScoreChange?: (score: number, level: AdaptationLevel) => void) {
    this.onScoreChange = onScoreChange;
    this.startIdleCheck();
  }

  private startIdleCheck() {
    this.idleCheckInterval = window.setInterval(() => {
      const idleTime = Date.now() - this.lastActivityTime;
      if (idleTime > 5000 && idleTime < 20000) {
        // Hesitation detected after 5 seconds of inactivity
        const recentHesitations = this.events.filter(
          e => e.signal.type === 'hesitation' && Date.now() - e.timestamp < 10000
        );
        if (recentHesitations.length < 2) {
          this.recordSignal({
            type: 'hesitation',
            timestamp: Date.now(),
            weight: SIGNAL_WEIGHTS.hesitation,
            details: `Idle for ${Math.round(idleTime / 1000)}s`,
          });
        }
      }
    }, 2000);
  }

  recordActivity() {
    this.lastActivityTime = Date.now();
  }

  recordClick(x: number, y: number, isOnTarget: boolean, causedStateChange: boolean) {
    this.recordActivity();
    const now = Date.now();
    
    // Check for rage clicks (3+ clicks within 1 second in same area)
    const distance = Math.sqrt(
      Math.pow(x - this.lastClickPos.x, 2) + Math.pow(y - this.lastClickPos.y, 2)
    );
    
    if (now - this.lastClickTime < 1000 && distance < 50) {
      this.clickCount++;
      if (this.clickCount >= 3) {
        this.recordSignal({
          type: 'rage-click',
          timestamp: now,
          weight: SIGNAL_WEIGHTS['rage-click'],
          details: `${this.clickCount} rapid clicks`,
        });
        this.clickCount = 0;
      }
    } else {
      this.clickCount = 1;
    }

    this.lastClickTime = now;
    this.lastClickPos = { x, y };

    // Record misclick if not on target
    if (!isOnTarget) {
      this.recordSignal({
        type: 'misclick',
        timestamp: now,
        weight: SIGNAL_WEIGHTS.misclick,
      });
    }

    // Record dead click if no state change
    if (!causedStateChange && !isOnTarget) {
      this.recordSignal({
        type: 'dead-click',
        timestamp: now,
        weight: SIGNAL_WEIGHTS['dead-click'],
      });
    }
  }

  recordScroll(direction: 'up' | 'down') {
    this.recordActivity();
    const now = Date.now();

    if (now - this.lastScrollTime < 500 && this.lastScrollDirection !== null && this.lastScrollDirection !== direction) {
      this.scrollReversals++;
      if (this.scrollReversals >= 3) {
        this.recordSignal({
          type: 'thrash-scroll',
          timestamp: now,
          weight: SIGNAL_WEIGHTS['thrash-scroll'],
          details: `${this.scrollReversals} rapid reversals`,
        });
        this.scrollReversals = 0;
      }
    } else if (now - this.lastScrollTime > 1000) {
      this.scrollReversals = 0;
    }

    this.lastScrollDirection = direction;
    this.lastScrollTime = now;
  }

  recordFormFriction(details: string) {
    this.recordActivity();
    this.recordSignal({
      type: 'form-friction',
      timestamp: Date.now(),
      weight: SIGNAL_WEIGHTS['form-friction'],
      details,
    });
  }

  recordBacktrack() {
    this.recordActivity();
    this.recordSignal({
      type: 'backtrack',
      timestamp: Date.now(),
      weight: SIGNAL_WEIGHTS.backtrack,
    });
  }

  recordHelpSeeking() {
    this.recordActivity();
    this.recordSignal({
      type: 'help-seeking',
      timestamp: Date.now(),
      weight: SIGNAL_WEIGHTS['help-seeking'],
    });
  }

  private recordSignal(signal: FrictionSignal) {
    this.events.push({ signal, timestamp: signal.timestamp });
    this.notifyScoreChange();
  }

  private notifyScoreChange() {
    const score = this.calculateFrictionScore();
    const level = this.getAdaptationLevel(score);
    this.onScoreChange?.(score, level);
  }

  calculateFrictionScore(): number {
    const now = Date.now();
    const windowStart = now - ROLLING_WINDOW_MS;
    
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart);
    
    if (recentEvents.length === 0) return 0;

    const totalWeight = recentEvents.reduce((sum, e) => sum + e.signal.weight, 0);
    
    // Normalize to 0-100 scale, with diminishing returns at high values
    const rawScore = Math.min(100, totalWeight);
    return Math.round(rawScore);
  }

  getAdaptationLevel(score: number): AdaptationLevel {
    if (score >= ADAPTATION_THRESHOLDS[3]) return 3;
    if (score >= ADAPTATION_THRESHOLDS[2]) return 2;
    if (score >= ADAPTATION_THRESHOLDS[1]) return 1;
    return 0;
  }

  getTopSignals(count: number = 3): { type: string; count: number; details?: string }[] {
    const now = Date.now();
    const windowStart = now - ROLLING_WINDOW_MS;
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart);
    
    const signalCounts = new Map<string, { count: number; details?: string }>();
    
    for (const event of recentEvents) {
      const existing = signalCounts.get(event.signal.type) || { count: 0 };
      signalCounts.set(event.signal.type, {
        count: existing.count + 1,
        details: event.signal.details || existing.details,
      });
    }
    
    return Array.from(signalCounts.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }

  getSessionLog() {
    return {
      events: [...this.events],
      frictionScoreTimeline: this.generateScoreTimeline(),
      startTime: this.events[0]?.timestamp || Date.now(),
      endTime: Date.now(),
    };
  }

  private generateScoreTimeline() {
    if (this.events.length === 0) return [];
    
    const timeline: { timestamp: number; score: number }[] = [];
    const startTime = this.events[0].timestamp;
    const endTime = Date.now();
    const interval = 1000; // 1 second intervals
    
    for (let t = startTime; t <= endTime; t += interval) {
      const eventsUpToT = this.events.filter(
        e => e.timestamp <= t && e.timestamp > t - ROLLING_WINDOW_MS
      );
      const score = eventsUpToT.reduce((sum, e) => sum + e.signal.weight, 0);
      timeline.push({ timestamp: t, score: Math.min(100, score) });
    }
    
    return timeline;
  }

  reset() {
    this.events = [];
    this.clickCount = 0;
    this.scrollReversals = 0;
    this.lastActivityTime = Date.now();
  }

  destroy() {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
  }
}

export function exportSessionLog(sessionLog: ReturnType<FrictionDetector['getSessionLog']>) {
  const dataStr = JSON.stringify(sessionLog, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `navai-session-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
