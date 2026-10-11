import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { X, Cloud, Server, Database, Box, Cpu, GitBranch, ShieldAlert } from 'lucide-react';

interface AWSStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AWSStatusModal: React.FC<AWSStatusModalProps> = ({ isOpen, onClose }) => {
  const { awsStatus } = useSimulationStore();

  if (!isOpen) return null;

  const servicesList = [
    { name: 'Amazon Bedrock', icon: Cpu, status: awsStatus.services.bedrock, desc: 'Generative AI operational risk explanation & Vision analysis' },
    { name: 'AWS Lambda', icon: Server, status: awsStatus.services.lambda, desc: 'Serverless execution microservices' },
    { name: 'Amazon DynamoDB', icon: Database, status: awsStatus.services.dynamoDb, desc: 'Low-latency simulation state & alert telemetry' },
    { name: 'Amazon S3', icon: Box, status: awsStatus.services.s3, desc: 'Warehouse visual inspection image storage' },
    { name: 'Amazon EventBridge', icon: Cloud, status: awsStatus.services.eventBridge, desc: 'Real-time operational event routing bus' },
    { name: 'AWS Step Functions', icon: GitBranch, status: awsStatus.services.stepFunctions, desc: 'Autonomous mitigation orchestration state machine' },
    { name: 'API Gateway', icon: Cloud, status: awsStatus.services.apiGateway, desc: 'REST API entry point & Lambda integration' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="spatial-panel w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-aws-orange/40 font-mono text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-aws-orange/10 border border-aws-orange/30">
            <Cloud className="w-6 h-6 text-aws-orange" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wider">AWS CLOUD SERVICES DIAGNOSTICS</h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Mode: <strong className="text-aws-orange">{awsStatus.awsMode.toUpperCase()}</strong> | Region: <strong className="text-white">{awsStatus.region}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-5 max-h-96 overflow-y-auto pr-1">
          {servicesList.map((s, idx) => {
            const Icon = s.icon;
            const isLive = s.status === 'CONNECTED';
            const isMock = s.status === 'MOCK';
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-aws-orange shrink-0" />
                  <div>
                    <div className="font-bold text-white text-xs">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{s.desc}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                  isLive
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : isMock
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  ● {s.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-[11px] text-slate-300 font-sans">
          <ShieldAlert className="w-4 h-4 text-aws-orange shrink-0" />
          <span>
            Set <code className="text-cyan-400 font-mono">AWS_MODE=live</code> and configure valid AWS IAM credentials in <code className="text-cyan-400 font-mono">backend/.env</code> to connect directly to live Amazon Bedrock and AWS services.
          </span>
        </div>
      </div>
    </div>
  );
};
