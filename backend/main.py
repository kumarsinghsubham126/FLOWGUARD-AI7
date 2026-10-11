from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from config import settings
from models import ScenarioRequest, AIPlanRequest, VoiceCommandRequest, AWSStatusResponse
from simulation import simulation_engine
from bedrock_service import bedrock_service
from vision_service import vision_service

app = FastAPI(
    title="FlowGuard AI Backend Service",
    description="Autonomous Fulfillment Operations Intelligence Backend for FlowGuard AI",
    version="1.0.0"
)

# CORS configuration for frontend Vite app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "mode": settings.AWS_MODE, "region": settings.AWS_REGION}

@app.get("/api/overview")
def get_overview():
    return simulation_engine.get_overview()

@app.get("/api/zones")
def get_zones():
    return simulation_engine.zones

@app.get("/api/alerts")
def get_alerts():
    return [
        {
            "id": "alert-1",
            "timestamp": "12:41:09",
            "type": "CRITICAL",
            "title": "PACKING BOTTLENECK DETECTED",
            "message": "Expected SLA degradation in ~22 minutes if unmitigated.",
            "zoneId": "PACKING"
        }
    ]

@app.get("/api/events")
def get_events():
    return [
        {"id": "1", "timestamp": "12:41:02", "text": "PACKING CAPACITY FALLING BELOW THRESHOLD", "category": "ZONE", "severity": "critical"},
        {"id": "2", "timestamp": "12:41:06", "text": "BEDROCK FORECAST MODEL UPDATED (CONFIDENCE 94%)", "category": "AI", "severity": "warning"},
        {"id": "3", "timestamp": "12:41:09", "text": "RISK THRESHOLD EXCEEDED (71% SLA IMPACT RISK)", "category": "SYSTEM", "severity": "critical"},
        {"id": "4", "timestamp": "12:41:11", "text": "AUTONOMOUS WORKFLOW ACTION PLAN GENERATED", "category": "AI", "severity": "normal"}
    ]

@app.post("/api/simulation/start")
def start_simulation():
    return {"status": "started", "state": simulation_engine.get_overview()}

@app.post("/api/simulation/stop")
def stop_simulation():
    return {"status": "stopped"}

@app.post("/api/simulation/scenario")
def apply_scenario(req: ScenarioRequest):
    return simulation_engine.apply_scenario(req.orderLoad, req.workforce, req.shippingCapacity)

@app.post("/api/ai/analyze")
def analyze_risk(zoneId: str = "PACKING", riskScore: int = 71):
    return bedrock_service.generate_risk_explanation(zoneId, riskScore)

@app.post("/api/ai/plan")
def create_plan(req: AIPlanRequest):
    return bedrock_service.generate_risk_explanation(req.bottleneckZone, req.riskScore)

@app.post("/api/action/execute")
def execute_action():
    return simulation_engine.execute_mitigation()

@app.post("/api/vision/analyze")
async def analyze_vision(image: UploadFile = File(...)):
    contents = await image.read()
    return vision_service.analyze_image(contents)

@app.post("/api/voice/command")
def voice_command(req: VoiceCommandRequest):
    cmd = req.command.lower()
    if "zone b" in cmd or "sorting" in cmd:
        return {"text": "Navigated view to Sorting Hub B. Current utilization is 71%.", "intent": "NAVIGATE_ZONE"}
    elif "packing" in cmd or "zone c" in cmd:
        return {"text": "Navigated view to Packing Station C. Risk: High (91% utilization).", "intent": "NAVIGATE_ZONE"}
    elif "simulate" in cmd or "surge" in cmd:
        simulation_engine.apply_scenario(2.0, 1.0, 1.0)
        return {"text": "Running a 2x order-load simulation.", "intent": "SIMULATE_SURGE"}
    elif "autonomous" in cmd or "act" in cmd:
        simulation_engine.execute_mitigation()
        return {"text": "Autonomous mode activated. Executing mitigation plan.", "intent": "AUTONOMOUS_ACT"}
    else:
        return {"text": f"FlowGuard processed: '{req.command}'", "intent": "GENERAL_QUERY"}

@app.get("/api/aws/status", response_model=AWSStatusResponse)
def get_aws_status():
    mode_str = settings.AWS_MODE
    status_label = "MOCK" if mode_str == "mock" else "CONNECTED"
    return {
        "awsMode": mode_str,
        "region": settings.AWS_REGION,
        "services": {
            "bedrock": status_label,
            "lambda": status_label,
            "dynamoDb": status_label,
            "s3": status_label,
            "eventBridge": status_label,
            "stepFunctions": status_label,
            "apiGateway": status_label,
        }
    }

# AWS Lambda Compatibility Handler via Mangum
handler = Mangum(app)
