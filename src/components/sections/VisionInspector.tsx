import React, { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { apiService } from '../../services/api';
import { Scan, Upload, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Loader2 } from 'lucide-react';

export const VisionInspector: React.FC = () => {
  const { visionResult, setVisionResult } = useSimulationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setPreviewUrl(URL.createObjectURL(file));

    const result = await apiService.analyzeVisionImage(file);
    setVisionResult(result);
    setIsLoading(false);
  };

  const handleRunDemoImage = async () => {
    setIsLoading(true);
    // Synthetic canvas sample image
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0B111A';
      ctx.fillRect(0, 0, 640, 400);
      ctx.strokeStyle = '#00F0FF';
      ctx.strokeRect(40, 40, 560, 320);
      ctx.fillStyle = '#8B5CF6';
      ctx.fillText('DEMO WAREHOUSE CONVEYOR LANE 3', 60, 80);
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'demo_warehouse.png', { type: 'image/png' });
        setPreviewUrl(URL.createObjectURL(file));
        const result = await apiService.analyzeVisionImage(file);
        setVisionResult(result);
      }
      setIsLoading(false);
    });
  };

  return (
    <div className="relative z-10 p-8 pt-24 max-w-5xl mx-auto space-y-6 pointer-events-auto font-mono">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Scan className="w-6 h-6 text-cyan-400" />
            COMPUTER VISION OPERATIONAL INSPECTION
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Upload warehouse camera feed or snapshot to run Bedrock multimodal vision object detection & obstruction risk analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <div className="spatial-panel p-5 rounded-2xl space-y-4 lg:col-span-1">
          <h3 className="font-bold text-sm text-cyan-300 tracking-wider">IMAGE INPUT</h3>

          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 cursor-pointer bg-slate-950/60 transition-all group">
            <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" />
            <span className="text-xs text-slate-300 font-semibold text-center">UPLOAD WAREHOUSE SNAPSHOT</span>
            <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 10MB</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-500">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            onClick={handleRunDemoImage}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            RUN DEMO SNAPSHOT INSPECTION
          </button>
        </div>

        {/* Right Inspection Viewer & Bounding Box Overlays */}
        <div className="lg:col-span-2 space-y-4">
          <div className="spatial-panel p-4 rounded-2xl relative min-h-[320px] flex items-center justify-center overflow-hidden border border-cyan-500/20">
            {previewUrl ? (
              <div className="relative w-full h-full max-h-[380px] flex items-center justify-center">
                <img src={previewUrl} alt="Inspection Feed" className="rounded-xl object-contain max-h-[360px]" />

                {/* Render Detection Bounding Box Overlays */}
                {visionResult?.detections.map((d) => {
                  const [ymin, xmin, ymax, xmax] = d.bbox;
                  const isObstruction = d.type === 'BLOCKED_LANE' || d.type === 'CONGESTED_STATION';
                  return (
                    <div
                      key={d.id}
                      className={`absolute border-2 rounded ${
                        isObstruction ? 'border-red-500 bg-red-500/20' : 'border-cyan-400 bg-cyan-400/20'
                      }`}
                      style={{
                        top: `${ymin * 100}%`,
                        left: `${xmin * 100}%`,
                        width: `${(xmax - xmin) * 100}%`,
                        height: `${(ymax - ymin) * 100}%`,
                      }}
                    >
                      <span className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white ${
                        isObstruction ? 'bg-red-600' : 'bg-cyan-600'
                      }`}>
                        {d.label} ({Math.round(d.confidence * 100)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                <Scan className="w-12 h-12 mx-auto mb-2 opacity-40 text-cyan-400" />
                Upload an image or run demo snapshot to view computer vision detections
              </div>
            )}
          </div>

          {/* Results Analytics Panel */}
          {visionResult && (
            <div className="spatial-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  BEDROCK VISION ANALYSIS SUMMARY
                </h4>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  visionResult.overallRisk === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  RISK: {visionResult.overallRisk}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {visionResult.summary}
              </p>

              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">PACKAGES</div>
                  <div className="text-white font-bold mt-0.5">{visionResult.packagesCount}</div>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">WORKERS</div>
                  <div className="text-white font-bold mt-0.5">{visionResult.workersCount}</div>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">BLOCKED LANES</div>
                  <div className="text-red-400 font-bold mt-0.5">{visionResult.blockedLanesCount}</div>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">CONGESTION</div>
                  <div className="text-amber-400 font-bold mt-0.5">{visionResult.congestedStationsCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
