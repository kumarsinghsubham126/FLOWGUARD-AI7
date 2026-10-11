from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class ZoneModel(BaseModel):
    id: str
    name: str
    utilization: int
    capacity: int
    activeWorkers: int
    backlog: int
    packagesPerHour: int
    status: str
    color: str

class SimulationOverview(BaseModel):
    orderRate: int
    slaPercentage: float
    totalActiveWorkers: int
    totalBacklog: int
    overallRiskScore: int
    isAutonomous: bool
    aiCoreState: str
    zones: Dict[str, ZoneModel]

class ScenarioRequest(BaseModel):
    orderLoad: float = 1.0
    workforce: float = 1.0
    shippingCapacity: float = 1.0

class AIPlanRequest(BaseModel):
    bottleneckZone: str
    riskScore: int

class VoiceCommandRequest(BaseModel):
    command: str

class VisionDetectionModel(BaseModel):
    id: str
    label: str
    confidence: float
    bbox: List[float]
    type: str

class VisionAnalysisResponse(BaseModel):
    imageUrl: str
    timestamp: str
    packagesCount: int
    workersCount: int
    blockedLanesCount: int
    congestedStationsCount: int
    overallRisk: str
    summary: str
    detections: List[VisionDetectionModel]

class AWSStatusResponse(BaseModel):
    awsMode: str
    region: str
    services: Dict[str, str]
