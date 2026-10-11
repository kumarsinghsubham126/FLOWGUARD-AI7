import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { speechService } from '../../services/speech';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Sparkles, Languages, History, X, Loader2 } from 'lucide-react';
import { VoiceLanguageMode } from '../../types';

type VoiceUIState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING';

export const VoiceBar: React.FC = () => {
  const {
    isVoiceListening,
    voiceTranscript,
    voiceResponse,
    voiceLanguageMode,
    setVoiceLanguageMode,
    detectedVoiceLang,
    voiceHistory,
    setVoiceState,
    executeCommand,
  } = useSimulationStore();

  const [uiState, setUiState] = useState<VoiceUIState>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Sync language mode to speech service
  useEffect(() => {
    speechService.setLanguage(voiceLanguageMode);
  }, [voiceLanguageMode]);

  const handleMicToggle = () => {
    if (isVoiceListening) {
      speechService.stopListening();
      setVoiceState(false);
      setUiState('IDLE');
    } else {
      setErrorMsg(null);
      setUiState('LISTENING');
      setVoiceState(true, '', null);

      speechService.startListening(
        async (text, isFinal, lang) => {
          // Show live transcript
          setVoiceState(true, text, null, lang);

          if (isFinal && text.trim().length > 2) {
            speechService.stopListening();
            setUiState('PROCESSING');
            setVoiceState(false, text, null, lang);

            try {
              const result = await executeCommand(text);
              setUiState('RESPONDING');
              setVoiceState(false, text, result.text, result.language);
              speechService.speak(result.text, result.language);

              // Auto-clear response after 6s
              setTimeout(() => {
                setUiState('IDLE');
              }, 6000);
            } catch (err) {
              setErrorMsg('Failed to process command. Please try again.');
              setUiState('IDLE');
            }
          }
        },
        (err) => {
          const errMsg = typeof err === 'string' ? err : 'Voice recognition unavailable. Please use Chrome or Edge.';
          setErrorMsg(errMsg);
          setVoiceState(false);
          setUiState('IDLE');
          // Auto-clear error
          setTimeout(() => setErrorMsg(null), 5000);
        }
      );
    }
  };

  const isActive = uiState !== 'IDLE';

  const langLabel = (l: string) => {
    if (l === 'hi') return '🇮🇳 HINDI';
    if (l === 'hinglish') return '🇮🇳 HINGLISH';
    return '🇺🇸 ENGLISH';
  };

  return (
    <div className="fixed top-20 left-6 z-40 flex flex-col items-start pointer-events-auto font-sans max-w-sm">
      {/* Control Row */}
      <div className="flex items-center gap-2">
        {/* Main mic button */}
        <button
          onClick={handleMicToggle}
          className={`px-4 py-2 rounded-xl flex items-center gap-2.5 transition-all duration-200 border shadow-xl backdrop-blur-xl text-xs font-mono font-bold ${
            uiState === 'LISTENING'
              ? 'bg-violet-900/95 border-violet-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]'
              : uiState === 'PROCESSING'
              ? 'bg-blue-900/95 border-blue-400 text-white'
              : uiState === 'RESPONDING'
              ? 'bg-emerald-900/90 border-emerald-400 text-white'
              : 'bg-slate-950/90 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
          }`}
          title="Voice AI (English / Hindi / Hinglish)"
        >
          {uiState === 'LISTENING' ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-violet-400 rounded animate-[bounce_0.6s_infinite]" style={{ height: '100%' }} />
              <span className="w-0.5 bg-cyan-400 rounded animate-[bounce_0.6s_0.1s_infinite]" style={{ height: '75%' }} />
              <span className="w-0.5 bg-violet-300 rounded animate-[bounce_0.6s_0.2s_infinite]" style={{ height: '50%' }} />
              <span className="w-0.5 bg-cyan-300 rounded animate-[bounce_0.6s_0.1s_infinite]" style={{ height: '75%' }} />
              <span className="w-0.5 bg-violet-400 rounded animate-[bounce_0.6s_0s_infinite]" style={{ height: '100%' }} />
            </div>
          ) : uiState === 'PROCESSING' ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          ) : uiState === 'RESPONDING' ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="tracking-wider">
            {uiState === 'LISTENING' ? 'LISTENING...' :
             uiState === 'PROCESSING' ? 'PROCESSING...' :
             uiState === 'RESPONDING' ? 'SPEAKING' :
             'VOICE AI'}
          </span>
        </button>

        {/* Language mode selector */}
        <div className="p-1 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center gap-0.5 text-[10px] font-mono">
          {(['auto', 'en', 'hi'] as VoiceLanguageMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setVoiceLanguageMode(mode)}
              className={`px-2 py-1 rounded-lg uppercase transition-all ${
                voiceLanguageMode === mode
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title={mode === 'auto' ? 'Auto-detect language' : mode === 'en' ? 'English only' : 'Hindi (hi-IN)'}
            >
              {mode === 'auto' ? 'AUTO' : mode === 'en' ? 'EN' : 'HI'}
            </button>
          ))}
        </div>

        {/* History toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-400 hover:text-white backdrop-blur-xl transition-all"
          title="Voice Command History"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live feedback panel */}
      <AnimatePresence>
        {(isActive || voiceResponse || errorMsg) && (
          <motion.div
            key="voice-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="mt-2 p-3.5 rounded-xl bg-slate-950/97 border border-slate-700/70 w-80 font-sans text-xs shadow-2xl backdrop-blur-xl text-slate-200 space-y-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Languages className="w-3 h-3 text-cyan-400" />
                {voiceTranscript || voiceResponse ? langLabel(detectedVoiceLang) : 'WAITING FOR SPEECH...'}
              </span>
              <span className="text-slate-600">FAST ROUTER ACTIVE</span>
            </div>

            {/* Listening indicator */}
            {uiState === 'LISTENING' && (
              <div className="flex items-center gap-2 text-violet-300 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                <span>Speak now — English, Hindi, or Hinglish</span>
              </div>
            )}

            {/* Live transcript */}
            {voiceTranscript && uiState === 'LISTENING' && (
              <div className="text-slate-300 text-[11px] italic border-l-2 border-cyan-600 pl-2 py-0.5">
                "{voiceTranscript}"
              </div>
            )}

            {/* Processing */}
            {uiState === 'PROCESSING' && (
              <div className="flex items-center gap-2 text-blue-300 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Analyzing command...</span>
              </div>
            )}

            {/* User said (final transcript, after processing) */}
            {voiceTranscript && (uiState === 'RESPONDING' || uiState === 'IDLE') && voiceResponse && (
              <div>
                <div className="text-[9px] text-slate-500 mb-0.5 uppercase tracking-wider">You said</div>
                <div className="text-slate-400 text-[11px] italic border-l-2 border-slate-600 pl-2">
                  "{voiceTranscript}"
                </div>
              </div>
            )}

            {/* AI Response */}
            {voiceResponse && (uiState === 'RESPONDING' || uiState === 'IDLE') && (
              <div>
                <div className="text-[9px] text-cyan-600 mb-0.5 uppercase tracking-wider">FlowGuard AI</div>
                <div className="text-cyan-200 text-[11px] leading-relaxed flex items-start gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{voiceResponse}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="text-red-400 text-[11px] flex items-start gap-2">
                <MicOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Try these examples */}
            {uiState === 'LISTENING' && (
              <div className="text-[9px] text-slate-600 border-t border-slate-800 pt-1.5 space-y-0.5">
                <div>Try: "Show me Zone B" · "Zone B dikhao" · "Why is packing risky?"</div>
                <div>"Autonomous mode on karo" · "Double orders" · "Orders double kar do"</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 p-3.5 rounded-xl bg-slate-950/97 border border-slate-800 w-80 max-h-64 overflow-y-auto font-sans text-xs shadow-2xl backdrop-blur-xl space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white font-mono text-[10px] tracking-wider">COMMAND HISTORY</span>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {voiceHistory.length === 0 && (
              <div className="text-slate-600 text-center py-2 text-[10px]">No commands yet. Try speaking!</div>
            )}

            {voiceHistory.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-600">
                  <span className={item.speaker === 'USER' ? 'text-cyan-400 font-bold' : 'text-violet-400 font-bold'}>
                    {item.speaker === 'USER' ? '👤 YOU' : '🤖 FLOWGUARD'}
                  </span>
                  <span>{item.timestamp} · {item.language.toUpperCase()}</span>
                </div>
                <div className="text-slate-300 text-[10px] pl-1">{item.text}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VoiceOrb = VoiceBar;
