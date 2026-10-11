export type AICoreState = 
  | 'IDLE' 
  | 'MONITORING' 
  | 'ANALYZING' 
  | 'RISK_DETECTED' 
  | 'PLANNING' 
  | 'EXECUTING' 
  | 'VERIFYING' 
  | 'RESOLVED';

export type ZoneId = 'PICKING' | 'SORTING' | 'PACKING' | 'BUFFER' | 'SHIPPING';

export interface ZoneData {
  id: ZoneId;
  name: string;
  utilization: number; // 0-100
  capacity: number;
  activeWorkers: number;
  backlog: number;
  packagesPerHour: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  coordinates: { x: number; y: number; z: number };
  color: string;
}

export interface SimulationState {
  orderRate: number; // e.g. 18400
  slaPercentage: number; // e.g. 96.2
  totalActiveWorkers: number; // e.g. 1248
  totalBacklog: number;
  overallRiskScore: number; // 0 - 100
  isAutonomous: boolean;
  isDemoActive: boolean;
  demoStep: number;
  zones: Record<ZoneId, ZoneData>;
  aiCoreState: AICoreState;
  activeAlert: AlertMessage | null;
  scenarioMultiplier: {
    orderLoad: number; // 1.0 = 100%, 2.0 = 200%
    workforce: number; // 1.0 = 100%
    shippingCapacity: number; // 1.0 = 100%
  };
}

export interface AlertMessage {
  id: string;
  timestamp: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  zoneId?: ZoneId;
}

export interface EventStreamItem {
  id: string;
  timestamp: string;
  text: string;
  category: 'SYSTEM' | 'AI' | 'ZONE' | 'AUTONOMOUS';
  severity?: 'normal' | 'warning' | 'critical' | 'success';
}

export interface AIExplanation {
  title: string;
  rootCause: string;
  bottleneckZone: ZoneId;
  forecastMinutes: number;
  confidenceScore: number; // e.g., 94
  recommendedAction: string;
  impactBefore: {
    risk: number;
    backlog: number;
    sla: number;
  };
  impactAfter: {
    risk: number;
    backlog: number;
    sla: number;
  };
}

export interface VisionDetection {
  id: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] relative 0-1
  type: 'PACKAGE' | 'WORKER' | 'BLOCKED_LANE' | 'CONGESTED_STATION';
}

export interface VisionAnalysisResult {
  imageUrl: string;
  timestamp: string;
  packagesCount: number;
  workersCount: number;
  blockedLanesCount: number;
  congestedStationsCount: number;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  detections: VisionDetection[];
}

export interface AWSStatus {
  awsMode: 'mock' | 'live';
  region: string;
  services: {
    bedrock: 'CONNECTED' | 'MOCK' | 'ERROR';
    lambda: 'CONNECTED' | 'MOCK' | 'ERROR';
    dynamoDb: 'CONNECTED' | 'MOCK' | 'ERROR';
    s3: 'CONNECTED' | 'MOCK' | 'ERROR';
    eventBridge: 'CONNECTED' | 'MOCK' | 'ERROR';
    stepFunctions: 'CONNECTED' | 'MOCK' | 'ERROR';
    apiGateway: 'CONNECTED' | 'MOCK' | 'ERROR';
  };
}

export type VoiceLanguage = 'en' | 'hi' | 'hinglish';
export type VoiceLanguageMode = 'auto' | 'en' | 'hi';

export interface VoiceHistoryItem {
  id: string;
  timestamp: string;
  speaker: 'USER' | 'FLOWGUARD';
  text: string;
  language: VoiceLanguage;
}

export type ActiveTab = 'OVERVIEW' | 'LIVE_OPS' | 'FORECAST' | 'SIMULATOR' | 'VISION' | 'AI_COMMAND';
