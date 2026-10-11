import json

def lambda_handler(event, context):
    print("Executing RedistributeWorkers Lambda handler...")
    return {
        "statusCode": 200,
        "actionExecuted": "REALLOCATE_WORKERS",
        "workersRelocated": 6,
        "fromZone": "BUFFER",
        "toZone": "PACKING",
        "packingUtilizationBefore": 91,
        "packingUtilizationAfter": 72
    }
