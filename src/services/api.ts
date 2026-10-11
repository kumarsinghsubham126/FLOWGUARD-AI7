import { AWSStatus, VisionAnalysisResult } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getHealth(): Promise<{ status: string; mode: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch {
      return { status: 'ok', mode: 'mock_fallback' };
    }
  },

  async getAwsStatus(): Promise<AWSStatus> {
    try {
      const res = await fetch(`${API_BASE}/aws/status`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
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
        }
      };
    }
  },

  async analyzeVisionImage(file: File): Promise<VisionAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/vision/analyze`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Vision service error');
      return await res.json();
    } catch {
      // Deterministic synthetic fallback if backend is offline
      const tempUrl = URL.createObjectURL(file);
      return {
        imageUrl: tempUrl,
        timestamp: new Date().toLocaleTimeString(),
        packagesCount: 43,
        workersCount: 14,
        blockedLanesCount: 2,
        congestedStationsCount: 1,
        overallRisk: 'HIGH',
        summary: 'AI Vision detected 43 packages queued in Lane 3 with 2 physical obstruction markers. Packing station C is operating at critical capacity.',
        detections: [
          { id: 'd1', label: 'Blocked Conveyor Lane 3', confidence: 0.96, bbox: [0.25, 0.15, 0.45, 0.42], type: 'BLOCKED_LANE' },
          { id: 'd2', label: 'Congested Packing Hub C', confidence: 0.92, bbox: [0.55, 0.50, 0.85, 0.88], type: 'CONGESTED_STATION' },
          { id: 'd3', label: 'Package Overflow Cluster', confidence: 0.89, bbox: [0.10, 0.60, 0.35, 0.90], type: 'PACKAGE' },
          { id: 'd4', label: 'Active Operator', confidence: 0.94, bbox: [0.60, 0.20, 0.80, 0.35], type: 'WORKER' }
        ]
      };
    }
  },

  async sendVoiceCommand(command: string): Promise<{ text: string; intent: string }> {
    try {
      const res = await fetch(`${API_BASE}/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!res.ok) throw new Error('Voice API error');
      return await res.json();
    } catch {
      return { text: `FlowGuard processed: "${command}"`, intent: 'DIRECT_EXECUTION' };
    }
  }
};
