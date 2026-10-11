import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, Cpu, Zap } from 'lucide-react';

export const EventStream: React.FC = () => {
  const eventStream = useSimulationStore((state) => state.eventStream);

  const getIcon = (category: string, severity?: string) => {
    if (severity === 'critical') return <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    if (category === 'AUTONOMOUS') return <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0" />;
    if (category === 'AI') return <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    return <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div className="fixed bottom-6 left-6 z-30 w-96 max-h-48 pointer-events-none">
      <div className="spatial-panel rounded-2xl p-3 text-xs font-mono pointer-events-auto shadow-2xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 tracking-wider">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            LIVE OPERATIONAL EVENT STREAM
          </span>
          <span className="text-[10px] text-slate-500 font-sans">SYNTHETIC FEED</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {eventStream.slice(0, 5).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-1.5 rounded flex items-center gap-2 text-[11px] ${
                  item.severity === 'critical'
                    ? 'bg-red-950/40 text-red-300 border border-red-900/50'
                    : item.severity === 'warning'
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50'
                    : item.severity === 'success'
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50'
                    : 'bg-slate-900/50 text-slate-300'
                }`}
              >
                {getIcon(item.category, item.severity)}
                <span className="text-[10px] text-slate-500 shrink-0">{item.timestamp}</span>
                <span className="truncate font-mono">{item.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
