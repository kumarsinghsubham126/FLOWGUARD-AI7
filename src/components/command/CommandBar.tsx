import React, { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Terminal, Send, Sparkles } from 'lucide-react';

export const CommandBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const { executeCommand } = useSimulationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await executeCommand(input);
    setLastOutput(res.text);
    setInput('');
  };

  const quickPrompts = [
    'Why is packing risky?',
    'Orders double kar do',
    'Zone B mein kya problem hai?',
    'Show Zone B',
    'Activate autonomous mode',
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 font-sans">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-cyan-400">
          <Terminal className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about operations, risk, forecasts or actions... (English / Hindi / Hinglish)"
          className="w-full py-3.5 pl-11 pr-12 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all backdrop-blur-md"
        />
        <button
          type="submit"
          className="absolute right-3 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggested Multi-lingual Commands */}
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        <span className="text-slate-500 flex items-center gap-1 font-mono text-[10px]">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          SUGGESTIONS:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={async () => {
              const res = await executeCommand(prompt);
              setLastOutput(res.text);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-all font-sans"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Output Feedback */}
      {lastOutput && (
        <div className="bg-slate-950/90 p-3 rounded-2xl border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mt-1 shrink-0" />
          <p className="leading-relaxed">{lastOutput}</p>
        </div>
      )}
    </div>
  );
};
