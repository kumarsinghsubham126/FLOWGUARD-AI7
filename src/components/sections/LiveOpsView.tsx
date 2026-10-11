import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Radio, Users, Package, Activity, ArrowUpRight } from 'lucide-react';

export const LiveOpsView: React.FC = () => {
  const { zones, setSelectedZone, triggerOrderSurge } = useSimulationStore();

  return (
    <div className="relative z-10 p-8 pt-24 max-w-6xl mx-auto space-y-6 pointer-events-auto font-mono">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            LIVE ZONAL OPERATIONS METRICS
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Real-time telemetry across all 5 physical fulfillment facility zones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(zones).map((z) => {
          const isCritical = z.status === 'CRITICAL';
          const isCongested = z.status === 'CONGESTED';
          return (
            <div
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`spatial-panel p-5 rounded-2xl cursor-pointer hover:border-cyan-400 transition-all duration-300 space-y-3 ${
                isCritical ? 'spatial-panel-amber border-red-500/50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: z.color }} />
                  <h3 className="font-bold text-sm text-white">{z.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isCritical ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {z.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Capacity Utilization</span>
                  <span className="font-bold text-white">{z.utilization}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${z.utilization}%`, backgroundColor: z.color }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Workers</div>
                  <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-violet-400" />
                    {z.activeWorkers}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Backlog</div>
                  <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Package className="w-3 h-3 text-cyan-400" />
                    {z.backlog} pkgs
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
