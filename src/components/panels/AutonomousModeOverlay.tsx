import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export const AutonomousModeOverlay: React.FC = () => {
  const { isAutonomous, aiCoreState } = useSimulationStore();

  if (!isAutonomous) return null;

  const isExecuting = aiCoreState === 'PLANNING' || aiCoreState === 'EXECUTING' || aiCoreState === 'VERIFYING';
  const isResolved = aiCoreState === 'RESOLVED';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-24 left-6 z-20 w-80 spatial-panel-violet rounded-2xl p-4 shadow-2xl pointer-events-auto border border-violet-500/40 font-mono text-xs"
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-violet-900/50">
          <Zap className="w-4 h-4 text-violet-400 animate-bounce" />
          <span className="font-bold text-violet-200 tracking-wider">FLOWGUARD IS OPERATING AUTONOMOUSLY</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Real-time Monitoring
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Bedrock Forecasting Model
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">READY</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              {isExecuting ? (
                <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              Step Functions Decision Engine
            </span>
            <span className={`text-[10px] font-bold ${isExecuting ? 'text-violet-400' : 'text-emerald-400'}`}>
              {isExecuting ? 'EXECUTING' : 'READY'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Autonomous Action Planner
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Closed-Loop Verification
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">VERIFIED</span>
          </div>
        </div>

        {isResolved && (
          <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 text-emerald-200 text-[11px] mb-2">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              AUTONOMOUS MITIGATION COMPLETE
            </div>
            <div>Packing utilization: <strong className="text-white">91% → 72%</strong></div>
            <div>SLA Risk score: <strong className="text-white">71% → 9%</strong></div>
            <div>Backlog packages: <strong className="text-white">1,840 → 420</strong></div>
          </div>
        )}

        <div className="text-[9px] text-slate-500 text-center font-sans tracking-tight">
          * Synthetic operational simulation environment
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
