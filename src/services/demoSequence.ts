import { useSimulationStore } from '../store/useSimulationStore';

export class DemoSequenceRunner {
  private timer: any = null;

  public start() {
    const store = useSimulationStore.getState();
    store.startDemoScenario();

    const sequence = [
      {
        step: 1,
        delay: 500,
        action: () => {
          store.resetSimulation();
          store.setActiveTab('OVERVIEW');
          store.addEventStreamItem({ text: 'DEMO STEP 1: Baseline operations monitoring across all 5 zones.', category: 'AI', severity: 'normal' });
        }
      },
      {
        step: 2,
        delay: 4000,
        action: () => {
          store.triggerOrderSurge();
          store.addEventStreamItem({ text: 'DEMO STEP 2: Sudden 2x e-commerce order surge detected at Picking hub.', category: 'SYSTEM', severity: 'critical' });
        }
      },
      {
        step: 3,
        delay: 8000,
        action: () => {
          store.setAICoreState('ANALYZING');
          store.setSelectedZone('PACKING');
          store.addEventStreamItem({ text: 'DEMO STEP 3: Bedrock predictive model calculates 71% SLA risk window in ~22 min.', category: 'AI', severity: 'warning' });
        }
      },
      {
        step: 4,
        delay: 12000,
        action: () => {
          store.setAICoreState('RISK_DETECTED');
          store.addEventStreamItem({ text: 'DEMO STEP 4: Packing Station C bottleneck confirmed (utilization 91%).', category: 'ZONE', severity: 'critical' });
        }
      },
      {
        step: 5,
        delay: 16000,
        action: () => {
          store.setActiveTab('OVERVIEW');
          store.addEventStreamItem({ text: 'DEMO STEP 5: Root cause explanation generated — tape station delay & worker imbalance.', category: 'AI', severity: 'normal' });
        }
      },
      {
        step: 6,
        delay: 20000,
        action: () => {
          store.setAICoreState('PLANNING');
          store.addEventStreamItem({ text: 'DEMO STEP 6: Recommending relocation of 6 operators from Buffer D to Packing C.', category: 'AI', severity: 'normal' });
        }
      },
      {
        step: 7,
        delay: 24000,
        action: () => {
          store.toggleAutonomousMode(true);
          store.addEventStreamItem({ text: 'DEMO STEP 7: Autonomous execution initiated via AWS Step Functions state machine.', category: 'AUTONOMOUS', severity: 'success' });
        }
      },
      {
        step: 8,
        delay: 30000,
        action: () => {
          store.addEventStreamItem({ text: 'DEMO STEP 8: Facility recovering — Packing utilization drops 91% → 72%, SLA risk → 9%.', category: 'SYSTEM', severity: 'success' });
        }
      },
      {
        step: 9,
        delay: 36000,
        action: () => {
          store.setActiveTab('SIMULATOR');
          store.addEventStreamItem({ text: 'DEMO STEP 9: Scenario Simulator comparison loaded — "With FlowGuard" vs "Without".', category: 'AI', severity: 'success' });
        }
      }
    ];

    let currentStep = 0;
    const runNext = () => {
      if (currentStep < sequence.length) {
        const item = sequence[currentStep];
        item.action();
        useSimulationStore.setState({ demoStep: item.step });
        currentStep++;
        this.timer = setTimeout(runNext, item.delay);
      } else {
        useSimulationStore.setState({ isDemoActive: false });
      }
    };

    runNext();
  }

  public stop() {
    if (this.timer) clearTimeout(this.timer);
    useSimulationStore.setState({ isDemoActive: false });
  }
}

export const demoRunner = new DemoSequenceRunner();
