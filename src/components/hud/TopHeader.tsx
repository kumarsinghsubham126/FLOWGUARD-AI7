import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { ShieldCheck, Activity, Users, AlertCircle, Cpu, Cloud } from 'lucide-react';

interface TopHeaderProps {
  onOpenAwsModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenAwsModal }) => {
  const { orderRate, slaPercentage, totalActiveWorkers, overallRiskScore, awsStatus, isAutonomous } = useSimulationStore();

  const isCritical = overallRiskScore > 60;
  const isWarning = overallRiskScore > 30 && overallRiskScore <= 60;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-none font-sans">
      {/* Left Branding */}
      <div className="flex items-center gap-3.5 pointer-events-auto">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-bold text-sm tracking-wider text-white">FLOWGUARD AI</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1.5" />
              LIVE
            </span>
            {isAutonomous && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-950/90 text-violet-300 border border-violet-700 animate-pulse">
                AUTONOMOUS
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-sans tracking-wide">
            Autonomous Fulfillment Operations Intelligence
          </p>
        </div>
      </div>

      {/* Right Core Telemetry Strip */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Metric 1: Orders */}
        <div className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl">
          <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Orders / Hr</div>
            <div className="text-xs font-mono font-bold text-white">{(orderRate / 1000).toFixed(1)}K</div>
          </div>
        </div>

        {/* Metric 2: SLA */}
        <div className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">SLA Target</div>
            <div className={`text-xs font-mono font-bold ${slaPercentage < 90 ? 'text-red-400' : 'text-emerald-400'}`}>
              {slaPercentage}%
            </div>
          </div>
        </div>

        {/* Metric 3: Active Workers */}
        <div className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl">
          <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Active Workers</div>
            <div className="text-xs font-mono font-bold text-white">{totalActiveWorkers}</div>
          </div>
        </div>

        {/* Metric 4: Operational Risk */}
        <div className={`bg-slate-950/80 border backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl ${
          isCritical ? 'border-red-500/50' : 'border-slate-800/80'
        }`}>
          <AlertCircle className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400 animate-pulse' : isWarning ? 'text-amber-400' : 'text-cyan-400'}`} />
          <div>
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Risk Level</div>
            <div className={`text-xs font-mono font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'}`}>
              {overallRiskScore}%
            </div>
          </div>
        </div>

        {/* AWS Status Trigger */}
        <button
          onClick={onOpenAwsModal}
          className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2 hover:border-aws-orange/60 transition-all text-slate-300 hover:text-white"
          title="Inspect AWS Cloud Architecture Diagnostics"
        >
          <Cloud className="w-3.5 h-3.5 text-aws-orange" />
          <span className="text-[11px] font-mono font-medium">AWS {awsStatus.awsMode.toUpperCase()}</span>
        </button>
      </div>
    </header>
  );
};
