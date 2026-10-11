import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { demoRunner } from '../../services/demoSequence';
import { Play, Zap, Flame, RotateCcw } from 'lucide-react';

export const DemoControlBar: React.FC = () => {
  const { isDemoActive, demoStep, isAutonomous, toggleAutonomousMode, triggerOrderSurge, resetSimulation } = useSimulationStore();

  const handleToggleDemo = () => {
    if (isDemoActive) {
      demoRunner.stop();
    } else {
      demoRunner.start();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 pointer-events-auto font-sans">
      {/* 1-Click Guided Demo Trigger */}
      <button
        onClick={handleToggleDemo}
        className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold flex items-center gap-2 transition-all shadow-xl ${
          isDemoActive
            ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
        }`}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        {isDemoActive ? `DEMO RUNNING (STEP ${demoStep}/9)` : 'START DEMO'}
      </button>

      {/* Autonomous Operations Rail Toggle */}
      <button
        onClick={() => toggleAutonomousMode()}
        className={`px-4 py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-2 transition-all border ${
          isAutonomous
            ? 'bg-violet-950/90 text-violet-200 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600'
        }`}
      >
        <Zap className={`w-3.5 h-3.5 ${isAutonomous ? 'text-violet-400 animate-bounce' : 'text-slate-400'}`} />
        AUTONOMOUS MODE
      </button>

      {/* Surge Simulation Injector */}
      <button
        onClick={triggerOrderSurge}
        className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all"
        title="Inject 2x Order Load Surge"
      >
        <Flame className="w-4 h-4 text-red-400" />
      </button>

      {/* Reset Simulation State */}
      <button
        onClick={resetSimulation}
        className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
        title="Reset Baseline State"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
};
