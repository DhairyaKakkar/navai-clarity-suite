import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, X, ChevronRight, Download, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useFrictionDetection } from '@/hooks/use-friction-detection';
import { getTaskFlow, matchGoalToSite } from '@/lib/task-flows';
import { GuidanceStep, AdaptationLevel } from '@/lib/types';
import { loadPreferences, savePreferences, applyPreferences } from '@/lib/preferences';
import { LicenseSite } from '@/components/demo/LicenseSite';
import { BillSite } from '@/components/demo/BillSite';
import { UniversitySite } from '@/components/demo/UniversitySite';
import { TargetHighlight } from '@/components/demo/TargetHighlight';
import { FrictionMeter } from '@/components/demo/FrictionMeter';
import { WhyChangedDrawer } from '@/components/demo/WhyChangedDrawer';

const Demo = () => {
  // State
  const [goal, setGoal] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [currentSite, setCurrentSite] = useState<'license' | 'bill' | 'university'>('license');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showWhyChanged, setShowWhyChanged] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Preferences
  const [preferences, setPreferences] = useState(() => loadPreferences());
  
  // Friction detection
  const {
    frictionScore,
    adaptationLevel,
    recordClick,
    recordScroll,
    recordActivity,
    getTopSignals,
    exportLog,
    reset: resetFriction,
  } = useFrictionDetection(isActive, (level) => {
    if (level >= 2 && preferences.autoCalm && !calmMode) {
      setCalmMode(true);
      toast('Calm Mode activated', {
        description: 'UI adapted because you seemed stuck. You can turn this off anytime.',
        duration: 5000,
      });
    }
  });

  // Get current task flow and step
  const taskFlow = getTaskFlow(currentSite);
  const currentStep: GuidanceStep | null = taskFlow && isActive 
    ? taskFlow.steps[currentStepIndex] || null 
    : null;

  // Apply preferences
  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  // Track scroll
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    let lastScrollTop = 0;
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const direction = target.scrollTop > lastScrollTop ? 'down' : 'up';
      lastScrollTop = target.scrollTop;
      recordScroll(direction);
    };
    
    const canvas = canvasRef.current;
    canvas.addEventListener('scroll', handleScroll, { passive: true });
    return () => canvas.removeEventListener('scroll', handleScroll);
  }, [isActive, recordScroll]);

  // Track mouse activity
  useEffect(() => {
    if (!isActive) return;
    const handleMouseMove = () => recordActivity();
    const handleKeyDown = () => recordActivity();
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, recordActivity]);

  const handleStartGuide = useCallback(() => {
    if (!goal.trim()) {
      toast.error('Please enter a goal');
      return;
    }
    
    const matchedSite = matchGoalToSite(goal);
    if (matchedSite) {
      setCurrentSite(matchedSite as 'license' | 'bill' | 'university');
    }
    
    setCurrentStepIndex(0);
    setIsActive(true);
    setCalmMode(false);
    setShowHint(false);
    resetFriction();
    
    toast.success('Guide started!', {
      description: 'Follow the highlighted steps to complete your goal.',
    });
  }, [goal, resetFriction]);

  const handleStopGuide = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setShowHint(false);
    toast('Guide stopped');
  }, []);

  const handleSkipStep = useCallback(() => {
    if (taskFlow && currentStepIndex < taskFlow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setShowHint(false);
    } else {
      setIsActive(false);
      toast.success('Task complete!');
    }
  }, [taskFlow, currentStepIndex]);

  const handleAction = useCallback((selector: string, causedChange: boolean) => {
    if (!currentStep) return;
    
    const isOnTarget = selector === currentStep.targetSelector;
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : 0;
    const y = rect ? rect.top + rect.height / 2 : 0;
    
    recordClick(x, y, isOnTarget, causedChange);
    
    if (isOnTarget && causedChange) {
      // Advance to next step
      if (taskFlow && currentStepIndex < taskFlow.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setShowHint(false);
      } else {
        setIsActive(false);
        toast.success('🎉 Goal completed!', {
          description: 'You\'ve finished all the steps.',
        });
      }
    }
  }, [currentStep, taskFlow, currentStepIndex, recordClick]);

  const handleUpdatePreference = (key: keyof typeof preferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleResetDemo = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setGoal('');
    setCalmMode(false);
    setShowHint(false);
    resetFriction();
    toast('Demo reset');
  };

  // Determine classes based on adaptation level
  const canvasClasses = [
    'flex-1 overflow-auto scrollbar-minimal bg-background relative',
    calmMode && 'calm-mode',
    preferences.focusAssist && 'focus-assist',
  ].filter(Boolean).join(' ');

  return (
    <div className={`min-h-screen flex flex-col ${preferences.largeText ? 'text-size-large' : ''}`}>
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-4 gap-4 shrink-0">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <span className="font-semibold">NavAI Demo</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Simulated Website Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Site Tabs */}
          <Tabs 
            value={currentSite} 
            onValueChange={(v) => {
              if (!isActive) {
                setCurrentSite(v as typeof currentSite);
              }
            }}
            className="shrink-0"
          >
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
              <TabsTrigger 
                value="license" 
                disabled={isActive}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Driver License
              </TabsTrigger>
              <TabsTrigger 
                value="bill" 
                disabled={isActive}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Pay a Bill
              </TabsTrigger>
              <TabsTrigger 
                value="university" 
                disabled={isActive}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                University Portal
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Canvas */}
          <div ref={canvasRef} className={canvasClasses}>
            {currentSite === 'license' && (
              <LicenseSite 
                onAction={handleAction} 
                currentStep={currentStep}
                isCalm={calmMode}
                isFocusAssist={preferences.focusAssist}
              />
            )}
            {currentSite === 'bill' && (
              <BillSite 
                onAction={handleAction} 
                currentStep={currentStep}
                isCalm={calmMode}
                isFocusAssist={preferences.focusAssist}
              />
            )}
            {currentSite === 'university' && (
              <UniversitySite 
                onAction={handleAction} 
                currentStep={currentStep}
                isCalm={calmMode}
                isFocusAssist={preferences.focusAssist}
              />
            )}
            
            {/* Target Highlight Overlay */}
            {isActive && currentStep && (
              <TargetHighlight 
                selector={currentStep.targetSelector} 
                containerRef={canvasRef}
                isCalm={calmMode}
              />
            )}
          </div>
        </div>

        {/* Right: NavAI Panel */}
        <aside className="w-80 lg:w-96 border-l border-border flex flex-col shrink-0 bg-navai-surface">
          {/* Goal Input */}
          <div className="p-4 border-b border-border">
            <Label htmlFor="goal-input" className="text-sm font-medium mb-2 block">
              What do you want to accomplish?
            </Label>
            <div className="flex gap-2">
              <Input
                id="goal-input"
                placeholder="e.g., apply for driver's license"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isActive && handleStartGuide()}
                disabled={isActive}
                className="flex-1"
              />
              {!isActive ? (
                <Button onClick={handleStartGuide} className="btn-pill-primary px-4">
                  Start
                </Button>
              ) : (
                <Button onClick={handleStopGuide} variant="outline" className="px-4">
                  Stop
                </Button>
              )}
            </div>
          </div>

          {/* Current Step */}
          <AnimatePresence mode="wait">
            {isActive && currentStep && (
              <motion.div
                key={currentStep.stepNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 border-b border-border ${adaptationLevel >= 1 ? 'p-5' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">
                    Step {currentStep.stepNumber} of {taskFlow?.steps.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipStep}
                    className="text-xs h-auto py-1 px-2"
                  >
                    Skip <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                
                <p className={`font-medium leading-relaxed ${adaptationLevel >= 2 ? 'text-lg' : ''}`}>
                  {adaptationLevel >= 2 ? currentStep.shortInstruction : currentStep.instructionText}
                </p>
                
                {/* Hint button for level 1+ */}
                {adaptationLevel >= 1 && currentStep.hint && !showHint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="mt-3 text-muted-foreground"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Need a hint?
                  </Button>
                )}
                
                {showHint && currentStep.hint && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 text-sm text-muted-foreground bg-background p-3 rounded-lg"
                  >
                    💡 {currentStep.hint}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Friction Meter */}
          {isActive && (
            <div className="px-4 py-3 border-b border-border">
              <FrictionMeter 
                score={frictionScore} 
                level={adaptationLevel}
                onWhyClick={() => setShowWhyChanged(true)}
              />
            </div>
          )}

          {/* Controls */}
          <div className="p-4 space-y-4 flex-1 overflow-auto">
            <h3 className="text-sm font-medium text-muted-foreground">Controls</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-calm" className="text-sm cursor-pointer">
                  Auto-Calm
                </Label>
                <Switch
                  id="auto-calm"
                  checked={preferences.autoCalm}
                  onCheckedChange={(v) => handleUpdatePreference('autoCalm', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="text-sm cursor-pointer">
                  Reduce Motion
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={preferences.reduceMotion}
                  onCheckedChange={(v) => handleUpdatePreference('reduceMotion', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="text-sm cursor-pointer">
                  Larger Text
                </Label>
                <Switch
                  id="large-text"
                  checked={preferences.largeText}
                  onCheckedChange={(v) => handleUpdatePreference('largeText', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm cursor-pointer">
                  High Contrast
                </Label>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={(v) => handleUpdatePreference('highContrast', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-assist" className="text-sm cursor-pointer">
                  Focus Assist
                </Label>
                <Switch
                  id="focus-assist"
                  checked={preferences.focusAssist}
                  onCheckedChange={(v) => handleUpdatePreference('focusAssist', v)}
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLog}
              className="w-full justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Session Log
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              className="w-full justify-start"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Demo
            </Button>
            
            <p className="text-xs text-muted-foreground text-center pt-2">
              All data stays on this device
            </p>
          </div>
        </aside>
      </div>

      {/* Why Changed Drawer */}
      <WhyChangedDrawer
        open={showWhyChanged}
        onOpenChange={setShowWhyChanged}
        currentStep={currentStep?.stepNumber || 0}
        totalSteps={taskFlow?.steps.length || 0}
        frictionScore={frictionScore}
        adaptationLevel={adaptationLevel}
        topSignals={getTopSignals()}
      />
    </div>
  );
};

export default Demo;
