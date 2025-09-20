export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system' | 'ui';
  text?: string | React.ReactNode;
  content?: React.ReactNode;
  isLoading?: boolean;
}

export type Question = {
  id: number;
  key: 'initial' | 'summary' | 'final';
  text: string;
  type: 'initial' | 'summary' | 'final';
  options?: string[];
};

export type Answers = {
  caseDetails?: string;
  analysis?: string;
};
