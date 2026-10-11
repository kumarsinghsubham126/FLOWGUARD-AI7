import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Package, Activity, AlertCircle, ArrowUpRight } from 'lucide-react';

export const ZoneDetailDrawer: React.FC = () => {
  const { selectedZone, zones, setSelectedZone, triggerOrderSurge } = useSimulationStore();

  if (!selectedZone) return null;

  const zone = zones[selectedZone];
  if (!zone) return null;

  const isCritical = zone.status === 'CRITICAL';
  const isCongested = zone.status === 'CONGESTED';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="fixed top-24 left-6 z-20 w-80 spatial-panel rounded-2xl p-5 shadow-2xl pointer-events-auto border border-cyan-500/30 font-mono text-xs"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: isCritical ? '#EF4444' : isCongested ? '#F59E0B' : zone.color }}
            />
            <h3 className="font-bold text-sm tracking-wider text-white">{zone.name}</h3>
          </div>
          <button
            onClick={() => setSelectedZone(null)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Utilization Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Utilization Rate</span>
              <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-cyan-400'}`}>{zone.utilization}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${zone.utilization}%`,
                  backgroundColor: isCritical ? '#EF4444' : isCongested ? '#F59E0B' : zone.color,
                }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Active Workers</div>
              <div className="text-white font-bold flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-violet-400" />
                {zone.activeWorkers}
              </div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Backlog Queued</div>
              <div className="text-white font-bold flex items-center gap-1 mt-0.5">
                <Package className="w-3 h-3 text-cyan-400" />
                {zone.backlog} pkgs
              </div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Throughput</div>
              <div className="text-white font-bold flex items-center gap-1 mt-0.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                {zone.packagesPerHour} / hr
              </div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Health Status</div>
              <div className={`font-bold uppercase text-[10px] mt-0.5 ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                {zone.status}
              </div>
            </div>
          </div>

          {/* Quick Zone Action */}
          <button
            onClick={triggerOrderSurge}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all mt-2"
          >
            INJECT WORKLOAD SURGE
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
