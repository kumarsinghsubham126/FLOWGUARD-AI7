import React, { useEffect, useState } from 'react';
import { useSimulationStore } from './store/useSimulationStore';
import { FacilityCanvas } from './components/3d/FacilityCanvas';
import { TopHeader } from './components/hud/TopHeader';
import { EventStream } from './components/hud/EventStream';
import { FloatingNav } from './components/hud/FloatingNav';
import { DemoControlBar } from './components/hud/DemoControlBar';
import { VoiceOrb } from './components/voice/VoiceOrb';
import { AIExplanationPanel } from './components/panels/AIExplanationPanel';
import { AutonomousModeOverlay } from './components/panels/AutonomousModeOverlay';
import { AWSStatusModal } from './components/panels/AWSStatusModal';
import { ZoneDetailDrawer } from './components/panels/ZoneDetailDrawer';

import { HeroSection } from './components/sections/HeroSection';
import { ScrollStorySection } from './components/sections/ScrollStorySection';
import { ForecastView } from './components/sections/ForecastView';
import { SimulatorView } from './components/sections/SimulatorView';
import { VisionInspector } from './components/sections/VisionInspector';
import { LiveOpsView } from './components/sections/LiveOpsView';
import { CommandBar } from './components/command/CommandBar';
import { apiService } from './services/api';

export const App: React.FC = () => {
  const { activeTab, updateTick, setAwsStatus } = useSimulationStore();
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);

  // Interval for real-time telemetry drift simulation
  useEffect(() => {
    const interval = setInterval(() => {
      updateTick();
    }, 2000);
    return () => clearInterval(interval);
  }, [updateTick]);

  // Fetch AWS Status on launch
  useEffect(() => {
    apiService.getAwsStatus().then((status) => {
      setAwsStatus(status);
    });
  }, [setAwsStatus]);

  return (
    <div className="relative min-h-screen bg-[#141414] text-slate-100 overflow-x-hidden select-none">
      {/* 3D HERO FACILITY CANVAS — full viewport */}
      <FacilityCanvas />

      {/* SPATIAL HUD OVERLAYS */}
      <TopHeader onOpenAwsModal={() => setIsAwsModalOpen(true)} />
      <EventStream />
      <FloatingNav />
      <DemoControlBar />
      <VoiceOrb />

      {/* SPATIAL PANELS */}
      <AIExplanationPanel />
      <AutonomousModeOverlay />
      <ZoneDetailDrawer />
      <AWSStatusModal isOpen={isAwsModalOpen} onClose={() => setIsAwsModalOpen(false)} />

      {/* TAB VIEWS ROUTER — scroll sections below the 3D hero */}
      <main className="relative z-10 min-h-screen pb-32">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <HeroSection />
            <ScrollStorySection />
            <div className="px-8 pb-12 relative z-20 pointer-events-auto">
              <CommandBar />
            </div>
          </div>
        )}

        {activeTab === 'LIVE_OPS' && <LiveOpsView />}
        {activeTab === 'FORECAST' && <ForecastView />}
        {activeTab === 'SIMULATOR' && <SimulatorView />}
        {activeTab === 'VISION' && <VisionInspector />}
        {activeTab === 'AI_COMMAND' && (
          <div className="pt-28 px-8 pointer-events-auto max-w-3xl mx-auto">
            <CommandBar />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
