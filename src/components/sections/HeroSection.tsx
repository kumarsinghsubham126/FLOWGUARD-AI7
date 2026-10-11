import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Cpu, ShieldCheck, Zap, Activity } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveTab, startDemoScenario, overallRiskScore, slaPercentage, totalActiveWorkers } = useSimulationStore();

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-between p-8 md:p-12 pointer-events-none">
      {/* First Viewport Headline & Clean Hero CTAs (Section 9) */}
      <div className="mt-16 max-w-xl pointer-events-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium shadow-lg backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            FLOWGUARD AI
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans text-white leading-none drop-shadow-md">
            SEE THE BOTTLENECK <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400">
              BEFORE IT HAPPENS.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-sm md:text-base font-sans text-slate-300 leading-relaxed max-w-lg drop-shadow">
            Autonomous operational intelligence for complex fulfillment environments. Predicts SLA risk, explains root causes, and executes closed-loop recovery workflows.
          </p>

          {/* Elegant Action Controls */}
          <div className="flex items-center gap-4 pt-3">
            <button
              onClick={() => setActiveTab('LIVE_OPS')}
              className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-bold text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all hover:scale-105"
            >
              ENTER LIVE OPS
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={startDemoScenario}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-sans font-semibold text-xs flex items-center gap-2 transition-all hover:border-slate-500 backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-current" />
              RUN DEMO
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Bottom Telemetry Strip (Non-blocking) */}
      <div className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl pointer-events-auto">
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Operational SLA</div>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{slaPercentage}%</div>
          <div className="text-[10px] text-slate-500 font-sans">Target: 95.0%</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Operational Risk</div>
          <div className={`text-lg font-mono font-bold mt-0.5 ${overallRiskScore > 50 ? 'text-red-400' : 'text-cyan-400'}`}>
            {overallRiskScore}%
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Packing Bottleneck</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Workforce</div>
          <div className="text-lg font-mono font-bold text-violet-300 mt-0.5">{totalActiveWorkers}</div>
          <div className="text-[10px] text-slate-500 font-sans">Across 5 Zones</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Autonomous Engine</div>
          <div className="text-lg font-sans font-bold text-violet-400 mt-0.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            READY
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Step Functions Bus</div>
        </div>
      </div>
    </div>
  );
};
