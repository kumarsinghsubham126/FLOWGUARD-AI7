import { detectLanguage, DetectedLanguage } from './languageDetector';
import { conversationMemory } from './conversationMemory';

export interface CommandResult {
  text: string;
  language: DetectedLanguage;
  action: 'SELECT_ZONE' | 'SURGE' | 'AUTONOMOUS' | 'RESET' | 'EXPLAIN' | 'WHAT_IF' | 'GENERAL';
  zoneId?: 'PICKING' | 'SORTING' | 'PACKING' | 'BUFFER' | 'SHIPPING';
  isComplex?: boolean;
  orderMultiplier?: number; // for what-if scenarios
}

// Zone name mappings (English and Hindi/Hinglish variants)
const ZONE_PATTERNS: Record<string, 'PICKING' | 'SORTING' | 'PACKING' | 'BUFFER' | 'SHIPPING'> = {
  // English
  'zone a': 'PICKING', 'picking': 'PICKING', 'zone 1': 'PICKING',
  'zone b': 'SORTING', 'sorting': 'SORTING', 'zone 2': 'SORTING',
  'zone c': 'PACKING', 'packing': 'PACKING', 'zone 3': 'PACKING',
  'zone d': 'BUFFER', 'buffer': 'BUFFER', 'zone 4': 'BUFFER', 'staging': 'BUFFER',
  'zone e': 'SHIPPING', 'shipping': 'SHIPPING', 'zone 5': 'SHIPPING', 'dispatch': 'SHIPPING',
  // Hindi/Hinglish
  'पैकिंग': 'PACKING', 'शिपिंग': 'SHIPPING', 'पिकिंग': 'PICKING', 'सॉर्टिंग': 'SORTING', 'बफर': 'BUFFER',
  'paicking': 'PICKING', 'sorting hub': 'SORTING', 'packing station': 'PACKING',
};

function detectZone(lower: string): 'PICKING' | 'SORTING' | 'PACKING' | 'BUFFER' | 'SHIPPING' | null {
  for (const [pattern, zone] of Object.entries(ZONE_PATTERNS)) {
    if (lower.includes(pattern.toLowerCase())) return zone;
  }
  return null;
}

// ORDER MULTIPLIER DETECTION (what-if)
function detectOrderMultiplier(lower: string): number | null {
  if (/\b2x\b|200%|double|dono guna|दोगुना/.test(lower)) return 2.0;
  if (/\b1\.5x\b|150%|halfa guna/.test(lower)) return 1.5;
  if (/\b1\.25x\b|125%/.test(lower)) return 1.25;
  if (/normal|baseline|reset|wapas|सामान्य/.test(lower)) return 1.0;
  return null;
}

export function parseLocalCommand(rawText: string, forcedLang: 'auto' | 'en' | 'hi' = 'auto'): CommandResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Language detection
  const det = detectLanguage(text);
  let lang: DetectedLanguage = det.language;
  if (forcedLang === 'hi') lang = 'hi';
  if (forcedLang === 'en') lang = 'en';

  conversationMemory.setLastContext({ text, language: lang });

  // 2. Context resolution: "Why?" / "Kyun?" — resolve from last context
  const isFollowUp = /^(why|kyun|kyun\?|क्यों\??|why\?|explain that|isko explain karo|samjhao)$/i.test(lower.trim());
  if (isFollowUp) {
    if (lang === 'hi') {
      return {
        text: 'पैकिंग क्षेत्र में जोखिम इसलिए बढ़ा है क्योंकि ऑर्डर वॉल्यूम में 34% की वृद्धि हुई है और पैकिंग टेप की आपूर्ति में देरी हो रही है। इससे अगले 22 मिनट में SLA प्रभावित हो सकती है।',
        language: 'hi',
        action: 'EXPLAIN',
        zoneId: 'PACKING',
      };
    } else if (lang === 'hinglish') {
      return {
        text: 'Packing bottleneck isliye hai kyunki order volume +34% badh gaya hai aur packing tape supply mein delay chal raha hai. Agar abhi action nahi liya toh 22 minutes mein SLA impact aa sakta hai.',
        language: 'hinglish',
        action: 'EXPLAIN',
        zoneId: 'PACKING',
      };
    } else {
      return {
        text: 'The packing bottleneck is caused by a 34% order surge combined with a localized supply delay on packing materials. Without action, SLA will degrade in approximately 22 minutes.',
        language: 'en',
        action: 'EXPLAIN',
        zoneId: 'PACKING',
      };
    }
  }

  // 3. MITIGATION / FIX commands
  const isMitigate = /\b(fix|resolve|reduce|mitigate|isko reduce|reduce karo|theek karo|सुधारो|ठीक करो|कम करो)\b/.test(lower);
  if (isMitigate) {
    if (lang === 'hi') {
      return { text: 'बिल्कुल। ऑटोनॉमस मिटिगेशन वर्कफ़्लो शुरू किया जा रहा है। बफर ज़ोन से 6 कर्मचारी पैकिंग स्टेशन पर भेजे जा रहे हैं।', language: 'hi', action: 'AUTONOMOUS' };
    } else if (lang === 'hinglish') {
      return { text: 'Bilkul. Autonomous mitigation workflow chalu ho gaya. 6 workers Buffer D se Packing Station C mein move kar rahe hain.', language: 'hinglish', action: 'AUTONOMOUS' };
    } else {
      return { text: 'Initiating autonomous mitigation. Reallocating 6 workers from Buffer D to Packing Station C immediately.', language: 'en', action: 'AUTONOMOUS' };
    }
  }

  // 4. ZONE NAVIGATION
  const detectedZone = detectZone(lower);
  const isZoneQuery = detectedZone && (
    /\b(show|navigate|dikhao|status|kya|problem|zoom|focus|go to|view|देखो|बताओ)\b/.test(lower) || lower.includes('zone')
  );

  if (isZoneQuery && detectedZone) {
    const zoneNames: Record<string, string> = {
      PICKING: 'Picking Zone A', SORTING: 'Sorting Hub B',
      PACKING: 'Packing Station C', BUFFER: 'Buffer Zone D', SHIPPING: 'Shipping Docks E',
    };
    const zoneHindi: Record<string, string> = {
      PICKING: 'पिकिंग ज़ोन A', SORTING: 'सॉर्टिंग हब B',
      PACKING: 'पैकिंग स्टेशन C', BUFFER: 'बफर ज़ोन D', SHIPPING: 'शिपिंग डॉक E',
    };

    if (lang === 'hi') {
      return { text: `${zoneHindi[detectedZone]} पर नेविगेट किया। वर्तमान स्थिति स्क्रीन पर दिखाई जा रही है।`, language: 'hi', action: 'SELECT_ZONE', zoneId: detectedZone };
    } else if (lang === 'hinglish') {
      return { text: `${zoneNames[detectedZone]} pe navigate kar diya. Current status screen pe dekh sakte ho.`, language: 'hinglish', action: 'SELECT_ZONE', zoneId: detectedZone };
    } else {
      return { text: `Navigated to ${zoneNames[detectedZone]}. Zone details are now shown on screen.`, language: 'en', action: 'SELECT_ZONE', zoneId: detectedZone };
    }
  }

  // 5. PACKING RISK EXPLANATION (when asking about risk without zone context)
  const isRiskQuery = /\b(risk|risky|problem|bottleneck|kya problem|kyun|danger|critical|कितना जोखिम|जोखिम|खतरा)\b/.test(lower);
  if (isRiskQuery) {
    if (lang === 'hi') {
      return { text: 'वर्तमान में पैकिंग स्टेशन C में 71% जोखिम है। ऑर्डर में 34% की वृद्धि और आपूर्ति में देरी के कारण बैकलॉग बढ़ रहा है। लगभग 22 मिनट में SLA प्रभावित होगी।', language: 'hi', action: 'EXPLAIN', zoneId: 'PACKING' };
    } else if (lang === 'hinglish') {
      return { text: 'Abhi Packing Station C ka risk 71% hai. Order volume +34% badh gaya hai aur supply delay ke wajah se backlog 1,840 packages ho gaya hai. Agar action nahi liya, 22 minutes mein SLA impact hoga.', language: 'hinglish', action: 'EXPLAIN', zoneId: 'PACKING' };
    } else {
      return { text: 'Current risk is 71% at Packing Station C. A 34% order volume surge combined with supply delay has pushed the backlog to 1,840 packages. SLA impact projected in ~22 minutes without mitigation.', language: 'en', action: 'EXPLAIN', zoneId: 'PACKING' };
    }
  }

  // 6. ORDER SURGE / WHAT-IF
  const isOrderSurge = /\b(surge|double|2x|200%|dono guna|order double|orders double|simulate surge|order load|ऑर्डर दोगुने|simulation)\b/.test(lower);
  if (isOrderSurge) {
    const mult = detectOrderMultiplier(lower) || 2.0;
    if (lang === 'hi') {
      return { text: `बिल्कुल। ${Math.round(mult * 100)}% ऑर्डर-लोड सिमुलेशन शुरू किया जा रहा है। पैकिंग और सॉर्टिंग में भीड़ बढ़ेगी।`, language: 'hi', action: 'SURGE', orderMultiplier: mult };
    } else if (lang === 'hinglish') {
      return { text: `Zaroor. ${Math.round(mult * 100)}% order-load simulation start ho gaya. Packing aur Sorting mein congestion badhega.`, language: 'hinglish', action: 'SURGE', orderMultiplier: mult };
    } else {
      return { text: `Running ${Math.round(mult * 100)}% order load simulation. Expect increased congestion at Packing and Sorting zones.`, language: 'en', action: 'SURGE', orderMultiplier: mult };
    }
  }

  // 7. AUTONOMOUS MODE
  const isAutonomous = /\b(autonomous|auto mode|let ai|flowguard handle|ai handle|on kar|activate|ऑटोनॉमस|स्वचालित|mode on)\b/.test(lower);
  if (isAutonomous) {
    if (lang === 'hi') {
      return { text: 'ऑटोनॉमस मोड सक्रिय कर दिया गया है। फ्लोगार्ड AI अब ऑपरेशन संभाल रहा है और मिटिगेशन वर्कफ़्लो निष्पादित कर रहा है।', language: 'hi', action: 'AUTONOMOUS' };
    } else if (lang === 'hinglish') {
      return { text: 'Autonomous mode activate kar diya gaya. FlowGuard AI ab operations handle kar raha hai. Worker reallocation workflow chalu hai.', language: 'hinglish', action: 'AUTONOMOUS' };
    } else {
      return { text: 'Autonomous mode engaged. FlowGuard AI is now managing operations and executing the mitigation workflow.', language: 'en', action: 'AUTONOMOUS' };
    }
  }

  // 8. RESET
  const isReset = /\b(reset|restore|normal|baseline|wapas|सामान्य|रीसेट)\b/.test(lower);
  if (isReset) {
    if (lang === 'hi') {
      return { text: 'सिमुलेशन बेसलाइन पर रीसेट किया जा रहा है।', language: 'hi', action: 'RESET' };
    } else if (lang === 'hinglish') {
      return { text: 'Simulation baseline pe reset ho gaya. Sab normal hai ab.', language: 'hinglish', action: 'RESET' };
    } else {
      return { text: 'Simulation reset to baseline operational state.', language: 'en', action: 'RESET' };
    }
  }

  // 9. STATUS / OVERVIEW
  const isStatus = /\b(status|overview|kya chal|how are|facility|sab theek|सब कुछ|overview)\b/.test(lower);
  if (isStatus) {
    if (lang === 'hi') {
      return { text: 'फ्लोगार्ड AI सुविधा की निगरानी कर रहा है। पैकिंग स्टेशन C में उच्च जोखिम (71%) है। बाकी सभी ज़ोन सामान्य रूप से काम कर रहे हैं।', language: 'hi', action: 'EXPLAIN' };
    } else if (lang === 'hinglish') {
      return { text: 'FlowGuard facility monitor kar raha hai. Packing Station C mein high risk (71%) hai, baaki sab zones normal chal rahe hain. Orders 18,400/hr aa rahe hain.', language: 'hinglish', action: 'EXPLAIN' };
    } else {
      return { text: 'FlowGuard is monitoring the facility. Packing Station C is at high risk (71%). All other zones are operating normally. Current throughput: 18,400 orders/hour.', language: 'en', action: 'EXPLAIN' };
    }
  }

  // 10. Complex queries → flag for potential Bedrock call (future)
  const isComplex = /\b(would|if orders|what if|trend|predict|forecast|project|future|अगर ऑर्डर|भविष्य)\b/.test(lower);
  if (isComplex) {
    // Still respond with a useful answer from our simulation data
    if (lang === 'hi') {
      return { text: 'मौजूदा रुझान के आधार पर, यदि ऑर्डर वॉल्यूम 200% तक बढ़ता है तो SLA जोखिम 84% तक पहुंच जाएगा। FlowGuard 6 कर्मचारियों को रीअलोकेट करके इसे 9% तक कम कर सकता है।', language: 'hi', action: 'EXPLAIN', isComplex: true };
    } else if (lang === 'hinglish') {
      return { text: 'Current trend ke hisaab se, agar order volume 200% ho jaaye toh SLA risk 84% tak pahunch sakta hai. FlowGuard autonomous mode se 6 workers reallocate karke isko 9% tak la sakta hai.', language: 'hinglish', action: 'EXPLAIN', isComplex: true };
    } else {
      return { text: 'Based on current trends, a 200% order surge would push SLA risk to 84%. FlowGuard autonomous mode can reduce this to 9% by reallocating 6 workers from Buffer to Packing.', language: 'en', action: 'EXPLAIN', isComplex: true };
    }
  }

  // 11. GENERAL fallback
  if (lang === 'hi') {
    return { text: `फ्लोगार्ड AI ने आपका अनुरोध प्राप्त किया: "${text}"। मैं ऑपरेशनल डेटा की निगरानी कर रहा हूं। आप "पैकिंग जोखिम बताओ" या "ऑटोनॉमस मोड चालू करो" जैसे कमांड दे सकते हैं।`, language: 'hi', action: 'GENERAL' };
  } else if (lang === 'hinglish') {
    return { text: `FlowGuard ne sun liya: "${text}". Aap "Zone B dikhao", "packing risk kya hai", ya "autonomous mode on karo" bol sakte ho.`, language: 'hinglish', action: 'GENERAL' };
  } else {
    return { text: `FlowGuard received your command: "${text}". You can ask about zones, risk levels, or say "Let AI handle it" to activate autonomous mode.`, language: 'en', action: 'GENERAL' };
  }
}
