export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system' | 'ui';
  text?: string | React.ReactNode;
  content?: React.ReactNode;
  isLoading?: boolean;
}

export type Question = {
  id: number;
  key: 'initial' | 'location' | 'pain-scale' | 'duration' | 'summary' | 'final';
  text: string;
  type: 'initial' | 'location' | 'pain-scale' | 'duration' | 'summary' | 'final';
  options?: string[];
};

export type Answers = {
  initial?: string;
  understanding?: string;
  location?: string;
  'pain-scale'?: number;
  duration?: string;
};
