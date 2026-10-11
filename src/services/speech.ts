// Advanced Multi-Lingual Speech Service (English, Hindi, Hinglish)
// Architecture: MIC → STT → LANGUAGE DETECTION → LOCAL ROUTER → RESPONSE → TTS

type SpeechCallback = (text: string, isFinal: boolean, detectedLanguage: 'en' | 'hi' | 'hinglish') => void;

// Language detection standalone (also used for TTS decisions)
export function detectSpeechLanguage(text: string): 'en' | 'hi' | 'hinglish' {
  const lower = text.toLowerCase().trim();

  // 1. Devanagari script → definitive Hindi
  if (/[\u0900-\u097F]/.test(text)) return 'hi';

  // 2. Strong Hinglish indicators (romanized Hindi words commonly used)
  const hinglishWords = [
    'kya', 'hai', 'hain', 'mein', 'ko', 'kar', 'karo', 'karo', 'do', 'batao',
    'rahi', 'raha', 'kitna', 'aaj', 'kal', 'ka', 'ki', 'ke', 'kaafi', 'bilkul',
    'hoon', 'samjho', 'dikhao', 'dikhana', 'bata', 'woh', 'yeh', 'nahi', 'nahi',
    'isko', 'uska', 'uski', 'mere', 'mera', 'meri', 'theek', 'accha', 'chalao',
    'kab', 'kyun', 'kyunki', 'aur', 'par', 'lekin', 'toh', 'bhi', 'se', 'tak',
    'sab', 'kuch', 'koi', 'bahut', 'zyada', 'kam', 'zyada', 'thoda', 'zaroor',
    'zone', 'autonomous', 'mode', 'simulation', 'risk', 'order', 'double', 'reset'
  ];

  const words = lower.split(/\s+/);
  const hinglishCount = words.filter(w => hinglishWords.includes(w)).length;
  const totalWords = words.length;

  // If >30% words are Hindi/Hinglish → hinglish
  if (hinglishCount > 0 && hinglishCount / totalWords > 0.25) return 'hinglish';
  
  // 3. Check for specific Hinglish command patterns
  const hinglishPatterns = [
    /\b(zone|zones?)\s+[a-z]+\s+(dikhao|batao|kya|mein|ka|ki|ke)/i,
    /\b(karo|kar|chalao|chala|shuru|band)\b/i,
    /\b(aur|aura|par|lekin|toh|bhi)\b/i,
    /\b(orders?|simulation|risk|mode)\s+(double|dono|karo|kar)\b/i,
  ];
  if (hinglishPatterns.some(p => p.test(lower))) return 'hinglish';

  return 'en';
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLang: string = 'en-IN';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        // en-IN supports both English and Hinglish well
        // We set the language to en-IN by default (understands Indian English + Hinglish)
        this.recognition.lang = 'en-IN';
        this.recognition.maxAlternatives = 3;
      }
    }
  }

  // Set recognition language
  public setLanguage(lang: 'auto' | 'en' | 'hi'): void {
    if (!this.recognition) return;
    if (lang === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else if (lang === 'en') {
      this.recognition.lang = 'en-US';
    } else {
      // auto: use en-IN which covers Hinglish + Indian English well
      this.recognition.lang = 'en-IN';
    }
    this.currentLang = this.recognition.lang;
  }

  public startListening(onResult: SpeechCallback, onError: (err: any) => void): void {
    if (!this.recognition) {
      onError('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // Use the best alternative
        const result = event.results[i];
        const alternative = result[0].transcript;
        
        // Also check other alternatives for Hindi content
        let bestTranscript = alternative;
        for (let j = 1; j < Math.min(result.length, 3); j++) {
          const altText = result[j]?.transcript || '';
          if (/[\u0900-\u097F]/.test(altText) && !/[\u0900-\u097F]/.test(bestTranscript)) {
            bestTranscript = altText; // prefer Hindi script if available
          }
        }
        
        transcript += bestTranscript;
        if (result.isFinal) isFinal = true;
      }

      const lang = detectSpeechLanguage(transcript);
      onResult(transcript, isFinal, lang);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (event.error === 'not-allowed') {
        onError('Microphone permission denied. Please allow microphone access in browser settings.');
      } else if (event.error === 'no-speech') {
        onError('No speech detected. Please speak clearly and try again.');
      } else if (event.error === 'network') {
        onError('Speech recognition requires internet connection.');
      } else {
        onError(`Recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e: any) {
      if (e.message?.includes('already started')) {
        // Already running - stop and restart
        try {
          this.recognition.stop();
          setTimeout(() => {
            this.recognition.start();
            this.isListening = true;
          }, 300);
        } catch (_) {
          onError('Failed to start speech recognition.');
        }
      } else {
        onError(e?.message || 'Failed to start speech recognition.');
      }
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public speak(text: string, lang: 'en' | 'hi' | 'hinglish' = 'en'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      
      if (lang === 'hi') {
        // Try Hindi voice
        const hiVoice = voices.find(v =>
          v.lang === 'hi-IN' ||
          v.lang === 'hi' ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('lekha') || // Google Hindi (India)
          v.name.toLowerCase().includes('kalpana')  // MS Hindi
        );
        if (hiVoice) {
          utterance.voice = hiVoice;
          utterance.lang = 'hi-IN';
        } else {
          // Fallback to Indian English for Hindi (better than random voice)
          const inVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
          if (inVoice) utterance.voice = inVoice;
          utterance.lang = 'hi-IN';
        }
      } else if (lang === 'hinglish') {
        // Indian English voice for Hinglish
        const inVoice = voices.find(v =>
          v.lang === 'en-IN' ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('ravi') ||
          v.name.toLowerCase().includes('priya')
        );
        if (inVoice) utterance.voice = inVoice;
        utterance.lang = 'en-IN';
        utterance.rate = 0.88; // Slightly slower for natural Hinglish cadence
      } else {
        // English
        const enVoice = voices.find(v =>
          v.lang === 'en-US' ||
          v.lang === 'en-GB' ||
          (v.lang.startsWith('en') && v.default)
        );
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-US';
      }

      window.speechSynthesis.speak(utterance);
    };

    // Voices may not load immediately
    if (window.speechSynthesis.getVoices().length > 0) {
      selectVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        selectVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }

  public cancelSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
