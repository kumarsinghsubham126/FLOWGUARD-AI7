import { DetectedLanguage } from './languageDetector';

export interface ConversationTurn {
  speaker: 'USER' | 'FLOWGUARD';
  text: string;
  topic?: 'PACKING_RISK' | 'ZONE_STATUS' | 'AUTONOMOUS' | 'SIMULATION' | 'GENERAL';
  zoneId?: 'PICKING' | 'SORTING' | 'PACKING' | 'BUFFER' | 'SHIPPING';
  language: DetectedLanguage;
}

class ConversationMemory {
  private history: ConversationTurn[] = [];

  public addTurn(turn: ConversationTurn) {
    this.history.unshift(turn);
    if (this.history.length > 10) {
      this.history.pop();
    }
  }

  public getLastContext(): { topic?: string; zoneId?: string; lastLanguage?: DetectedLanguage } {
    for (const turn of this.history) {
      if (turn.topic) {
        return {
          topic: turn.topic,
          zoneId: turn.zoneId,
          lastLanguage: turn.language,
        };
      }
    }
    return {};
  }

  public getRecentHistoryText(): string {
    return this.history
      .slice(0, 4)
      .reverse()
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');
  }

  public clear() {
    this.history = [];
  }
}

export const conversationMemory = new ConversationMemory();
