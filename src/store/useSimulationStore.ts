import { create } from 'zustand';
import { 
  SimulationState, 
  ZoneId, 
  AICoreState, 
  AlertMessage, 
  EventStreamItem, 
  AIExplanation, 
  ActiveTab, 
  AWSStatus,
  VisionAnalysisResult,
  VoiceLanguage,
  VoiceLanguageMode,
  VoiceHistoryItem
} from '../types';
import { parseLocalCommand } from '../services/localCommandRouter';

interface State extends SimulationState {
  activeTab: ActiveTab;
  selectedZone: ZoneId | null;
  eventStream: EventStreamItem[];
  explanation: AIExplanation | null;
  awsStatus: AWSStatus;
  visionResult: VisionAnalysisResult | null;
  
  // Voice State
  isVoiceListening: boolean;
  voiceTranscript: string;
  voiceResponse: string | null;
  voiceLanguageMode: VoiceLanguageMode;
  detectedVoiceLang: VoiceLanguage;
  voiceHistory: VoiceHistoryItem[];
  
  cameraFocusZone: ZoneId | null;
  mousePosition: { x: number; y: number };
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedZone: (zoneId: ZoneId | null) => void;
  setAICoreState: (state: AICoreState) => void;
  setScenarioMultiplier: (key: 'orderLoad' | 'workforce' | 'shippingCapacity', val: number) => void;
  toggleAutonomousMode: (enable?: boolean) => void;
  executeMitigation: () => void;
  setMousePosition: (pos: { x: number; y: number }) => void;
  addEventStreamItem: (item: Omit<EventStreamItem, 'id' | 'timestamp'>) => void;
  triggerOrderSurge: () => void;
  resetSimulation: () => void;
  setVisionResult: (res: VisionAnalysisResult | null) => void;
  setVoiceLanguageMode: (mode: VoiceLanguageMode) => void;
  setVoiceState: (listening: boolean, transcript?: string, response?: string | null, lang?: VoiceLanguage) => void;
  executeCommand: (command: string) => Promise<{ text: string; language: VoiceLanguage }>;
  startDemoScenario: () => void;
  setAwsStatus: (status: AWSStatus) => void;
  updateTick: () => void;
}

const initialZones = {
  PICKING: {
    id: 'PICKING' as ZoneId,
    name: 'Picking Zone A',
    utilization: 64,
    capacity: 2500,
    activeWorkers: 320,
    backlog: 420,
    packagesPerHour: 1850,
    status: 'OPTIMAL' as const,
    coordinates: { x: -14, y: 0, z: 8 },
    color: '#00F0FF',
  },
  SORTING: {
    id: 'SORTING' as ZoneId,
    name: 'Sorting Hub B',
    utilization: 71,
    capacity: 3000,
    activeWorkers: 280,
    backlog: 510,
    packagesPerHour: 2100,
    status: 'MODERATE' as const,
    coordinates: { x: -6, y: 0, z: -6 },
    color: '#8B5CF6',
  },
  PACKING: {
    id: 'PACKING' as ZoneId,
    name: 'Packing Station C',
    utilization: 91,
    capacity: 2200,
    activeWorkers: 240,
    backlog: 1840,
    packagesPerHour: 1420,
    status: 'CRITICAL' as const,
    coordinates: { x: 6, y: 0, z: -6 },
    color: '#EF4444',
  },
  BUFFER: {
    id: 'BUFFER' as ZoneId,
    name: 'Buffer / Staging D',
    utilization: 52,
    capacity: 4000,
    activeWorkers: 160,
    backlog: 290,
    packagesPerHour: 1200,
    status: 'OPTIMAL' as const,
    coordinates: { x: 14, y: 0, z: 6 },
    color: '#10B981',
  },
  SHIPPING: {
    id: 'SHIPPING' as ZoneId,
    name: 'Shipping Docks E',
    utilization: 82,
    capacity: 3500,
    activeWorkers: 248,
    backlog: 780,
    packagesPerHour: 2400,
    status: 'MODERATE' as const,
    coordinates: { x: 0, y: 0, z: 14 },
    color: '#F59E0B',
  },
};

const defaultExplanation: AIExplanation = {
  title: 'PACKING BOTTLENECK DETECTED',
  rootCause: 'Order volume spike of +34% matched with localized packing tape supply delay.',
  bottleneckZone: 'PACKING',
  forecastMinutes: 22,
  confidenceScore: 94,
  recommendedAction: 'Dynamically reallocate 6 workers from Buffer D & Picking A to Packing Station C.',
  impactBefore: {
    risk: 71,
    backlog: 1840,
    sla: 88.4,
  },
  impactAfter: {
    risk: 9,
    backlog: 420,
    sla: 97.8,
  },
};

export const useSimulationStore = create<State>((set, get) => ({
  orderRate: 18400,
  slaPercentage: 96.2,
  totalActiveWorkers: 1248,
  totalBacklog: 3840,
  overallRiskScore: 71,
  isAutonomous: false,
  isDemoActive: false,
  demoStep: 0,
  zones: initialZones,
  aiCoreState: 'RISK_DETECTED',
  activeAlert: {
    id: 'alert-1',
    timestamp: new Date().toLocaleTimeString(),
    type: 'CRITICAL',
    title: 'PACKING BOTTLENECK DETECTED',
    message: 'Expected SLA degradation in ~22 minutes if unmitigated.',
    zoneId: 'PACKING',
  },
  scenarioMultiplier: {
    orderLoad: 1.0,
    workforce: 1.0,
    shippingCapacity: 1.0,
  },
  activeTab: 'OVERVIEW',
  selectedZone: null,
  eventStream: [
    { id: '1', timestamp: '12:41:02', text: 'PACKING CAPACITY FALLING BELOW THRESHOLD', category: 'ZONE', severity: 'critical' },
    { id: '2', timestamp: '12:41:06', text: 'BEDROCK FORECAST MODEL UPDATED (CONFIDENCE 94%)', category: 'AI', severity: 'warning' },
    { id: '3', timestamp: '12:41:09', text: 'RISK THRESHOLD EXCEEDED (71% SLA IMPACT RISK)', category: 'SYSTEM', severity: 'critical' },
    { id: '4', timestamp: '12:41:11', text: 'AUTONOMOUS WORKFLOW ACTION PLAN GENERATED', category: 'AI', severity: 'normal' },
  ],
  explanation: defaultExplanation,
  awsStatus: {
    awsMode: 'mock',
    region: 'us-east-1',
    services: {
      bedrock: 'MOCK',
      lambda: 'MOCK',
      dynamoDb: 'MOCK',
      s3: 'MOCK',
      eventBridge: 'MOCK',
      stepFunctions: 'MOCK',
      apiGateway: 'MOCK',
    },
  },
  visionResult: null,
  isVoiceListening: false,
  voiceTranscript: '',
  voiceResponse: null,
  voiceLanguageMode: 'auto',
  detectedVoiceLang: 'en',
  voiceHistory: [
    { id: 'h1', timestamp: '12:41:00', speaker: 'USER', text: 'Zone B mein kya problem hai?', language: 'hinglish' },
    { id: 'h2', timestamp: '12:41:01', speaker: 'FLOWGUARD', text: 'Zone B mein workload kaafi high hai. Current trend ke according approximately 20 minutes mein packing delay ho sakta hai.', language: 'hinglish' }
  ],
  cameraFocusZone: null,
  mousePosition: { x: 0, y: 0 },

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedZone: (selectedZone) => set({ selectedZone, cameraFocusZone: selectedZone }),
  setAICoreState: (aiCoreState) => set({ aiCoreState }),
  
  setScenarioMultiplier: (key, val) => {
    const prev = get().scenarioMultiplier;
    const nextMultiplier = { ...prev, [key]: val };
    
    // Calculate new risk score dynamically based on multipliers
    const loadFactor = nextMultiplier.orderLoad;
    const workerFactor = nextMultiplier.workforce;
    const shipFactor = nextMultiplier.shippingCapacity;

    const baseRisk = 25;
    const calculatedRisk = Math.min(99, Math.max(5, Math.round(baseRisk * (loadFactor / (workerFactor * 0.7 + shipFactor * 0.3)))));

    const calculatedBacklog = Math.round(1200 * loadFactor * (2 - workerFactor));
    const calculatedSla = Math.max(75, Math.min(99.5, Number((100 - calculatedRisk * 0.25).toFixed(1))));

    set((state) => ({
      scenarioMultiplier: nextMultiplier,
      overallRiskScore: calculatedRisk,
      totalBacklog: calculatedBacklog,
      slaPercentage: calculatedSla,
      aiCoreState: calculatedRisk > 60 ? 'RISK_DETECTED' : calculatedRisk > 30 ? 'ANALYZING' : 'MONITORING',
      zones: {
        ...state.zones,
        PACKING: {
          ...state.zones.PACKING,
          utilization: Math.min(99, Math.round(75 * loadFactor / workerFactor)),
          status: calculatedRisk > 60 ? 'CRITICAL' : calculatedRisk > 40 ? 'CONGESTED' : 'OPTIMAL',
        }
      }
    }));
  },

  setMousePosition: (mousePosition) => set({ mousePosition }),

  addEventStreamItem: (item) => {
    const newItem: EventStreamItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({
      eventStream: [newItem, ...state.eventStream.slice(0, 19)],
    }));
  },

  toggleAutonomousMode: (enable) => {
    const isNext = enable !== undefined ? enable : !get().isAutonomous;
    set({ isAutonomous: isNext });
    
    get().addEventStreamItem({
      text: isNext ? 'AUTONOMOUS MODE ACTIVATED — FLOWGUARD IS OPERATING' : 'MANUAL OVERRIDE RESTORED',
      category: 'AUTONOMOUS',
      severity: isNext ? 'success' : 'normal',
    });

    if (isNext && get().overallRiskScore > 40) {
      setTimeout(() => {
        get().executeMitigation();
      }, 1500);
    }
  },

  executeMitigation: () => {
    set({ aiCoreState: 'PLANNING' });
    get().addEventStreamItem({ text: 'STEP FUNCTIONS: Executing worker reallocation workflow...', category: 'AUTONOMOUS', severity: 'normal' });

    setTimeout(() => {
      set({ aiCoreState: 'EXECUTING' });
      get().addEventStreamItem({ text: 'LAMBDA ACTION: Moving 6 workers to Packing Station C', category: 'AUTONOMOUS', severity: 'normal' });
    }, 1200);

    setTimeout(() => {
      set({ aiCoreState: 'VERIFYING' });
      get().addEventStreamItem({ text: 'EVENTBRIDGE: Verifying real-time throughput metrics...', category: 'AUTONOMOUS', severity: 'normal' });
    }, 2400);

    setTimeout(() => {
      set((state) => ({
        aiCoreState: 'RESOLVED',
        overallRiskScore: 9,
        slaPercentage: 97.8,
        totalBacklog: 420,
        activeAlert: {
          id: 'alert-mitigated',
          timestamp: new Date().toLocaleTimeString(),
          type: 'SUCCESS',
          title: 'MITIGATION COMPLETE',
          message: 'Packing utilization dropped 91% → 72%. SLA risk resolved.',
          zoneId: 'PACKING',
        },
        zones: {
          ...state.zones,
          PACKING: {
            ...state.zones.PACKING,
            utilization: 72,
            activeWorkers: 246,
            backlog: 420,
            status: 'OPTIMAL',
          },
          BUFFER: {
            ...state.zones.BUFFER,
            activeWorkers: 157,
          },
          PICKING: {
            ...state.zones.PICKING,
            activeWorkers: 317,
          }
        }
      }));

      get().addEventStreamItem({ text: 'SUCCESS: Packing utilization lowered from 91% to 72% (Risk: 9%)', category: 'AUTONOMOUS', severity: 'success' });
      
      setTimeout(() => {
        set({ aiCoreState: 'MONITORING' });
      }, 3000);
    }, 3800);
  },

  triggerOrderSurge: () => {
    set((state) => ({
      overallRiskScore: 84,
      aiCoreState: 'RISK_DETECTED',
      slaPercentage: 86.5,
      totalBacklog: 2400,
      activeAlert: {
        id: 'surge-alert',
        timestamp: new Date().toLocaleTimeString(),
        type: 'CRITICAL',
        title: 'ORDER SURGE DETECTED (2x)',
        message: 'Severe congestion spreading to Packing and Sorting hubs.',
        zoneId: 'PACKING',
      },
      zones: {
        ...state.zones,
        PACKING: { ...state.zones.PACKING, utilization: 96, status: 'CRITICAL' },
        SORTING: { ...state.zones.SORTING, utilization: 88, status: 'CONGESTED' },
      }
    }));
    get().addEventStreamItem({ text: 'CRITICAL: 2x Order Load injected into simulation engine', category: 'SYSTEM', severity: 'critical' });
  },

  resetSimulation: () => {
    set({
      overallRiskScore: 71,
      slaPercentage: 96.2,
      totalBacklog: 3840,
      aiCoreState: 'RISK_DETECTED',
      isAutonomous: false,
      zones: initialZones,
      scenarioMultiplier: { orderLoad: 1.0, workforce: 1.0, shippingCapacity: 1.0 },
      explanation: defaultExplanation,
    });
    get().addEventStreamItem({ text: 'SIMULATION STATE RESET TO BASELINE', category: 'SYSTEM', severity: 'normal' });
  },

  setVisionResult: (visionResult) => set({ visionResult }),
  
  setVoiceLanguageMode: (voiceLanguageMode) => set({ voiceLanguageMode }),

  setVoiceState: (isVoiceListening, voiceTranscript = '', voiceResponse = null, lang = 'en') => 
    set({ isVoiceListening, voiceTranscript, voiceResponse, detectedVoiceLang: lang }),

  executeCommand: async (commandText: string) => {
    const forcedLang = get().voiceLanguageMode;
    const parsed = parseLocalCommand(commandText, forcedLang);

    // Apply simulation side-effects instantly based on parsed action
    if (parsed.action === 'SELECT_ZONE' && parsed.zoneId) {
      get().setSelectedZone(parsed.zoneId);
    } else if (parsed.action === 'SURGE') {
      if ((parsed as any).orderMultiplier && (parsed as any).orderMultiplier !== 2.0) {
        get().setScenarioMultiplier('orderLoad', (parsed as any).orderMultiplier);
      } else {
        get().triggerOrderSurge();
      }
    } else if (parsed.action === 'AUTONOMOUS') {
      get().toggleAutonomousMode(true);
    } else if (parsed.action === 'RESET') {
      get().resetSimulation();
    } else if (parsed.action === 'EXPLAIN') {
      set({ activeTab: 'OVERVIEW' });
    } else if (parsed.action === 'WHAT_IF' && (parsed as any).orderMultiplier) {
      get().setScenarioMultiplier('orderLoad', (parsed as any).orderMultiplier);
    }

    get().addEventStreamItem({ text: `COMMAND (${parsed.language.toUpperCase()}): "${commandText}"`, category: 'AI', severity: 'normal' });

    // Record into voice history log
    const nowStr = new Date().toLocaleTimeString();
    const userHistory: VoiceHistoryItem = {
      id: Math.random().toString(36).substring(7),
      timestamp: nowStr,
      speaker: 'USER',
      text: commandText,
      language: parsed.language,
    };
    const flowguardHistory: VoiceHistoryItem = {
      id: Math.random().toString(36).substring(7),
      timestamp: nowStr,
      speaker: 'FLOWGUARD',
      text: parsed.text,
      language: parsed.language,
    };

    set((state) => ({
      voiceHistory: [flowguardHistory, userHistory, ...state.voiceHistory.slice(0, 10)],
      detectedVoiceLang: parsed.language,
    }));

    return { text: parsed.text, language: parsed.language };
  },

  startDemoScenario: () => {
    set({ isDemoActive: true, demoStep: 1 });
    get().resetSimulation();
    get().addEventStreamItem({ text: 'DEMO MODE INITIATED: 9-Step Operations Walkthrough', category: 'AI', severity: 'success' });
  },

  setAwsStatus: (awsStatus) => set({ awsStatus }),

  updateTick: () => {
    set((state) => {
      const noise = (Math.random() - 0.5) * 2;
      const rateDrift = Math.round(state.orderRate + noise * 10);
      return { orderRate: rateDrift };
    });
  }
}));
