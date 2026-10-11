import React from 'react';
import { ActiveTab } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';
import { LayoutDashboard, Radio, TrendingUp, Sliders, Scan, Terminal } from 'lucide-react';

const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
  { id: 'LIVE_OPS', label: 'Live Ops', icon: Radio },
  { id: 'FORECAST', label: 'Forecast', icon: TrendingUp },
  { id: 'SIMULATOR', label: 'Simulator', icon: Sliders },
  { id: 'VISION', label: 'Vision AI', icon: Scan },
  { id: 'AI_COMMAND', label: 'Command Bar', icon: Terminal },
];

export const FloatingNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSimulationStore();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none font-sans">
      <div className="p-1.5 rounded-2xl flex items-center gap-1 shadow-2xl pointer-events-auto border border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-4 py-2 rounded-xl text-xs font-sans font-medium flex items-center gap-2 transition-all duration-300 ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{t.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00F0FF]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
