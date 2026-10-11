import json
import boto3
from config import settings

class BedrockService:
    def __init__(self):
        self.mode = settings.AWS_MODE
        if self.mode == "live":
            try:
                self.client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)
            except Exception:
                self.mode = "mock"
                self.client = None

    def generate_risk_explanation(self, zone_id: str, risk_score: int) -> dict:
        if self.mode == "live" and self.client:
            prompt = f"Analyze fulfillment bottleneck at zone {zone_id} with risk score {risk_score}%. Return JSON with rootCause, recommendedAction, and confidenceScore."
            try:
                response = self.client.invoke_model(
                    modelId=settings.BEDROCK_MODEL_ID,
                    body=json.dumps({"prompt": prompt, "max_tokens_to_sample": 300})
                )
                res_body = json.loads(response['body'].read())
                return json.loads(res_body.get("completion", "{}"))
            except Exception as e:
                print(f"Bedrock Live Error: {e}, falling back to mock")

        # Mock fallback
        return {
            "title": f"BOTTLENECK DETECTED IN {zone_id}",
            "rootCause": f"Unexpected +34% order volume surge combined with packing station tape dispenser calibration delay.",
            "bottleneckZone": zone_id,
            "forecastMinutes": 22,
            "confidenceScore": 94,
            "recommendedAction": "Reallocate 6 workers from Buffer D & Picking A to Packing Station C.",
            "impactBefore": {"risk": risk_score, "backlog": 1840, "sla": 88.4},
            "impactAfter": {"risk": 9, "backlog": 420, "sla": 97.8}
        }

bedrock_service = BedrockService()
