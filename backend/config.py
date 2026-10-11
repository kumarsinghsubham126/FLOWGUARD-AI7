import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    AWS_MODE: str = os.getenv("AWS_MODE", "mock")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")
    BEDROCK_VISION_MODEL_ID: str = os.getenv("BEDROCK_VISION_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
    DYNAMODB_TABLE: str = os.getenv("DYNAMODB_TABLE", "FlowGuardSimulationState")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "flowguard-warehouse-vision-bucket")
    STEP_FUNCTIONS_ARN: str = os.getenv("STEP_FUNCTIONS_ARN", "arn:aws:states:us-east-1:123456789012:stateMachine:FlowGuardMitigation")

settings = Settings()
