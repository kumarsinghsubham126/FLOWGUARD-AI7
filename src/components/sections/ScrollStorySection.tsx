import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, ArrowRight, ShieldCheck, Zap, AlertTriangle, Activity, Sliders, Cpu } from 'lucide-react';

const STORY_STAGES = [
  { stage: 1, title: 'OVERVIEW', subtitle: 'Spatial Operational Cockpit Monitoring' },
  { stage: 2, title: 'MONITOR', subtitle: 'Live Facility Telemetry & Traffic Flow' },
  { stage: 3, title: 'PREDICT', subtitle: 'SLA Risk Horizon & Bottleneck Detection' },
  { stage: 4, title: 'EXPLAIN', subtitle: 'Bedrock Root Cause Operational Analysis' },
  { stage: 5, title: 'ACT', subtitle: 'Autonomous Workforce Redistribution Plan' },
  { stage: 6, title: 'EXECUTE', subtitle: 'AWS Step Functions Live Execution' },
  { stage: 7, title: 'VERIFY', subtitle: 'Closed-Loop Throughput & SLA Recovery' },
  { stage: 8, title: 'WHAT IF', subtitle: 'Scenario Simulator & Load Testing' },
];

export const ScrollStorySection: React.FC = () => {
  const [activeStage, setActiveStage] = useState(1);
  const { 
    setSelectedZone, 
    triggerOrderSurge, 
    executeMitigation, 
    resetSimulation, 
    setActiveTab, 
    overallRiskScore,
    slaPercentage,
    totalBacklog
  } = useSimulationStore();

  const handleStageSelect = (stageNum: number) => {
    setActiveStage(stageNum);

    switch (stageNum) {
      case 1:
        resetSimulation();
        setSelectedZone(null);
        break;
      case 2:
        setSelectedZone('SORTING');
        break;
      case 3:
        triggerOrderSurge();
        setSelectedZone('PACKING');
        break;
      case 4:
        setSelectedZone('PACKING');
        break;
      case 5:
      case 6:
        executeMitigation();
        break;
      case 7:
        setSelectedZone(null);
        break;
      case 8:
        setActiveTab('SIMULATOR');
        break;
    }
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 pointer-events-auto font-sans">
      {/* Story Stage Navigation Rail */}
      <div className="bg-slate-950/90 p-2 rounded-2xl border border-slate-800 backdrop-blur-xl flex items-center justify-between mb-6 shadow-2xl overflow-x-auto">
        {STORY_STAGES.map((s) => (
          <button
            key={s.stage}
            onClick={() => handleStageSelect(s.stage)}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeStage === s.stage
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px]">
              {s.stage}
            </span>
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Stage Narrative Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-950/90 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">
                STAGE {activeStage} OF 8 • {STORY_STAGES[activeStage - 1].subtitle}
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {STORY_STAGES[activeStage - 1].title}: {
                  activeStage === 1 ? 'See the Entire Facility in 3D' :
                  activeStage === 2 ? 'Monitor Real-Time Package Traffic' :
                  activeStage === 3 ? 'Predict SLA Degradation Window' :
                  activeStage === 4 ? 'Bedrock Root Cause Explanation' :
                  activeStage === 5 ? 'AI Recommends Worker Relocation' :
                  activeStage === 6 ? '3D Worker Nodes Move in Real-Time' :
                  activeStage === 7 ? 'Operational Recovery & SLA Reset' :
                  'Interactive What-If Scenario Mode'
                }
              </h3>
            </div>

            {activeStage < 8 && (
              <button
                onClick={() => handleStageSelect(activeStage + 1)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
              >
                NEXT STAGE
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">RISK SCORE</div>
              <div className={`text-lg font-bold mt-0.5 ${overallRiskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                {overallRiskScore}%
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">SLA TARGET</div>
              <div className="text-lg font-bold text-white mt-0.5">{slaPercentage}%</div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">QUEUED BACKLOG</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">{totalBacklog.toLocaleString()} pkgs</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
