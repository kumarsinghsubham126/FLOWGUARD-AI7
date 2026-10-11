import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight, CheckCircle2, Play, AlertTriangle } from 'lucide-react';

export const AIExplanationPanel: React.FC = () => {
  const { explanation, overallRiskScore, executeMitigation, setActiveTab, aiCoreState } = useSimulationStore();

  if (!explanation || overallRiskScore < 40) return null;

  const isResolved = aiCoreState === 'RESOLVED';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-20 right-8 z-30 w-96 rounded-2xl p-5 shadow-2xl pointer-events-auto border backdrop-blur-xl font-sans text-xs ${
          isResolved
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            : 'bg-slate-950/90 border-violet-500/40 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${isResolved ? 'text-emerald-400' : 'text-violet-400 animate-pulse'}`} />
            <h3 className="font-bold text-sm tracking-wide text-white">
              {isResolved ? 'MITIGATION COMPLETE' : 'WHY IS THIS HAPPENING?'}
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            isResolved ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-300 border border-red-800'
          }`}>
            RISK: {overallRiskScore}%
          </span>
        </div>

        {isResolved ? (
          <div className="space-y-3">
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/80 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Packing Utilization:</span>
                <span className="text-white font-bold">91% → 72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SLA Risk Score:</span>
                <span className="text-white font-bold">71% → 9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Queued Backlog:</span>
                <span className="text-white font-bold">1,840 → 420 pkgs</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center font-sans">
              * Synthetic operational simulation environment
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Title */}
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Alert Context</div>
              <div className="text-sm font-bold text-white mt-0.5">{explanation.title}</div>
            </div>

            {/* Root Cause */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1">Root Cause</div>
              <p className="text-slate-200 leading-relaxed font-sans">{explanation.rootCause}</p>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Bottleneck Zone</div>
                <div className="text-cyan-300 font-bold mt-0.5">{explanation.bottleneckZone}</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Forecast Horizon</div>
                <div className="text-amber-400 font-bold mt-0.5">~{explanation.forecastMinutes} Min</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">Bedrock Confidence</div>
                <div className="text-emerald-400 font-bold mt-0.5">{explanation.confidenceScore}%</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400">SLA Impact</div>
                <div className="text-violet-300 font-bold mt-0.5">{explanation.impactBefore.sla}% → {explanation.impactAfter.sla}%</div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-violet-950/40 p-3 rounded-xl border border-violet-800/60">
              <div className="text-[10px] text-violet-300 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                Recommended Action
              </div>
              <p className="text-slate-200 leading-relaxed font-sans text-[11px]">{explanation.recommendedAction}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 font-sans">
              <button
                onClick={() => setActiveTab('SIMULATOR')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                SIMULATE
              </button>
              <button
                onClick={executeMitigation}
                className="flex-1 py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all text-xs"
              >
                EXECUTE PLAN
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
