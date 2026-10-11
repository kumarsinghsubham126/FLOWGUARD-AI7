import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Sliders, Zap, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const { scenarioMultiplier, setScenarioMultiplier, overallRiskScore, totalBacklog, toggleAutonomousMode } = useSimulationStore();

  // Synthetic outcome math
  const unmitigatedRisk = Math.min(99, Math.round(overallRiskScore * 1.45));
  const unmitigatedBacklog = Math.round(totalBacklog * 1.6);

  const flowguardRisk = Math.round(overallRiskScore * 0.25);
  const flowguardBacklog = Math.round(totalBacklog * 0.3);

  return (
    <div className="relative z-10 p-8 pt-24 max-w-5xl mx-auto space-y-6 pointer-events-auto font-mono">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            WHAT-IF SCENARIO SIMULATOR
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Adjust facility variables to project real-time risk impact and evaluate FlowGuard autonomous recovery performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Sliders Controls */}
        <div className="spatial-panel p-5 rounded-2xl space-y-6 lg:col-span-1">
          <h3 className="font-bold text-sm text-cyan-300 tracking-wider">VARIABLE CONTROLS</h3>

          {/* Slider 1: Order Load */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">ORDER LOAD</span>
              <span className="text-cyan-400 font-bold">{Math.round(scenarioMultiplier.orderLoad * 100)}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.05"
              value={scenarioMultiplier.orderLoad}
              onChange={(e) => setScenarioMultiplier('orderLoad', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-900 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>100% (Baseline)</span>
              <span>200% (Surge)</span>
            </div>
          </div>

          {/* Slider 2: Workforce */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">WORKFORCE AVAILABILITY</span>
              <span className="text-violet-400 font-bold">{Math.round(scenarioMultiplier.workforce * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={scenarioMultiplier.workforce}
              onChange={(e) => setScenarioMultiplier('workforce', parseFloat(e.target.value))}
              className="w-full accent-violet-400 bg-slate-900 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50% (Staff Shortage)</span>
              <span>150% (Full Staff)</span>
            </div>
          </div>

          {/* Slider 3: Shipping Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">SHIPPING CAPACITY</span>
              <span className="text-emerald-400 font-bold">{Math.round(scenarioMultiplier.shippingCapacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={scenarioMultiplier.shippingCapacity}
              onChange={(e) => setScenarioMultiplier('shippingCapacity', parseFloat(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-900 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50% (Dock Congestion)</span>
              <span>150% (Peak Capacity)</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Split Outcome Comparison (Section 12) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Outcome 1: WITHOUT FLOWGUARD */}
          <div className="spatial-panel-amber p-6 rounded-2xl space-y-4 border border-amber-500/40">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-900/50">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-sm text-amber-200 tracking-wider">WITHOUT FLOWGUARD</h4>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-400">UNMITIGATED RISK</div>
                <div className="text-3xl font-extrabold text-red-400 mt-1">{unmitigatedRisk}%</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">PROJECTED BACKLOG</div>
                <div className="text-2xl font-bold text-amber-300 mt-1">{unmitigatedBacklog.toLocaleString()} pkgs</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">SLA IMPACT DEGRADATION</div>
                <div className="text-sm font-semibold text-red-300 mt-0.5">Severe Delay (~48 min)</div>
              </div>
            </div>
          </div>

          {/* Outcome 2: WITH FLOWGUARD */}
          <div className="spatial-panel-violet p-6 rounded-2xl space-y-4 border border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="flex items-center gap-2 pb-2 border-b border-violet-900/50">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm text-violet-200 tracking-wider">WITH FLOWGUARD AI</h4>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-400">AUTONOMOUS RISK</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">{flowguardRisk}%</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">MANAGED BACKLOG</div>
                <div className="text-2xl font-bold text-cyan-300 mt-1">{flowguardBacklog.toLocaleString()} pkgs</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">RECOVERY WORKFLOW</div>
                <div className="text-sm font-semibold text-emerald-300 mt-0.5">Auto-Redistribution Active</div>
              </div>
            </div>

            <button
              onClick={() => toggleAutonomousMode(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] mt-2"
            >
              ENGAGE AUTONOMOUS RECOVERY
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
