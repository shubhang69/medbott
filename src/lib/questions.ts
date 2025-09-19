import type { Question } from './types';

export const questions: Question[] = [
  { id: 1, key: 'initial', text: "Hello! I'm MediMind. What's bothering you today?", type: 'initial' },
  { id: 2, key: 'location', text: 'I understand. Where exactly do you feel the pain or discomfort?', type: 'location' },
  { id: 3, key: 'pain-scale', text: 'Thank you. On a scale of 1 to 10, how would you rate the pain?', type: 'pain-scale' },
  { id: 4, key: 'duration', text: 'Got it. How long have you been experiencing this?', type: 'duration', options: ['A few hours', 'A day', 'A few days', 'A week or more'] },
  { id: 5, key: 'summary', text: "Thank you for providing this information. Here's a summary of what you've told me:", type: 'summary' },
  { id: 6, key: 'final', text: "We've logged your symptoms. Please remember, I am an AI assistant and not a medical professional. For any medical advice, please consult a doctor.", type: 'final'}
];
