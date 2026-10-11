import random

class SimulationEngine:
    def __init__(self):
        self.order_rate = 18400
        self.sla_percentage = 96.2
        self.total_workers = 1248
        self.total_backlog = 3840
        self.risk_score = 71
        self.is_autonomous = False
        self.ai_core_state = "RISK_DETECTED"
        
        self.zones = {
            "PICKING": {
                "id": "PICKING",
                "name": "Picking Zone A",
                "utilization": 64,
                "capacity": 2500,
                "activeWorkers": 320,
                "backlog": 420,
                "packagesPerHour": 1850,
                "status": "OPTIMAL",
                "color": "#00F0FF"
            },
            "SORTING": {
                "id": "SORTING",
                "name": "Sorting Hub B",
                "utilization": 71,
                "capacity": 3000,
                "activeWorkers": 280,
                "backlog": 510,
                "packagesPerHour": 2100,
                "status": "MODERATE",
                "color": "#8B5CF6"
            },
            "PACKING": {
                "id": "PACKING",
                "name": "Packing Station C",
                "utilization": 91,
                "capacity": 2200,
                "activeWorkers": 240,
                "backlog": 1840,
                "packagesPerHour": 1420,
                "status": "CRITICAL",
                "color": "#EF4444"
            },
            "BUFFER": {
                "id": "BUFFER",
                "name": "Buffer / Staging D",
                "utilization": 52,
                "capacity": 4000,
                "activeWorkers": 160,
                "backlog": 290,
                "packagesPerHour": 1200,
                "status": "OPTIMAL",
                "color": "#10B981"
            },
            "SHIPPING": {
                "id": "SHIPPING",
                "name": "Shipping Docks E",
                "utilization": 82,
                "capacity": 3500,
                "activeWorkers": 248,
                "backlog": 780,
                "packagesPerHour": 2400,
                "status": "MODERATE",
                "color": "#F59E0B"
            }
        }

    def get_overview(self):
        return {
            "orderRate": self.order_rate,
            "slaPercentage": self.sla_percentage,
            "totalActiveWorkers": self.total_workers,
            "totalBacklog": self.total_backlog,
            "overallRiskScore": self.risk_score,
            "isAutonomous": self.is_autonomous,
            "aiCoreState": self.ai_core_state,
            "zones": self.zones
        }

    def apply_scenario(self, order_load: float, workforce: float, shipping_capacity: float):
        self.risk_score = min(99, max(5, int(25 * (order_load / (workforce * 0.7 + shipping_capacity * 0.3)))))
        self.total_backlog = int(1200 * order_load * (2 - workforce))
        self.sla_percentage = max(75.0, min(99.5, round(100.0 - self.risk_score * 0.25, 1)))
        self.zones["PACKING"]["utilization"] = min(99, int(75 * order_load / workforce))
        self.zones["PACKING"]["status"] = "CRITICAL" if self.risk_score > 60 else "MODERATE"
        return self.get_overview()

    def execute_mitigation(self):
        self.risk_score = 9
        self.sla_percentage = 97.8
        self.total_backlog = 420
        self.ai_core_state = "RESOLVED"
        self.zones["PACKING"]["utilization"] = 72
        self.zones["PACKING"]["activeWorkers"] = 246
        self.zones["PACKING"]["status"] = "OPTIMAL"
        return self.get_overview()

simulation_engine = SimulationEngine()
