export interface DebugHistoryItem {
  id: string;
  timestamp: number;
  input: string;
  language: string;
  hasImage: boolean;
  result: DebugResult;
}

export interface DebugResult {
  summary: string;
  beginnerExplanation: string;
  rootCause: string;
  suggestedFix: string;
  correctedCode: string;
  preventionTips: string;
}

export type LoadingState = 'idle' | 'analyzing' | 'error';
