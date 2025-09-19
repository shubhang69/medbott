'use server';
/**
 * @fileOverview Summarizes user's symptom descriptions for clarity.
 *
 * - summarizeSymptomDescription - A function that summarizes the symptom description.
 * - SummarizeSymptomDescriptionInput - The input type for the summarizeSymptomDescription function.
 * - SummarizeSymptomDescriptionOutput - The return type for the summarizeSymptomDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSymptomDescriptionInputSchema = z.object({
  symptomDescription: z
    .string()
    .describe('The user-provided description of their symptoms.'),
});
export type SummarizeSymptomDescriptionInput = z.infer<
  typeof SummarizeSymptomDescriptionInputSchema
>;

const SummarizeSymptomDescriptionOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the user provided symptom description.'),
});
export type SummarizeSymptomDescriptionOutput = z.infer<
  typeof SummarizeSymptomDescriptionOutputSchema
>;

export async function summarizeSymptomDescription(
  input: SummarizeSymptomDescriptionInput
): Promise<SummarizeSymptomDescriptionOutput> {
  return summarizeSymptomDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSymptomDescriptionPrompt',
  input: {schema: SummarizeSymptomDescriptionInputSchema},
  output: {schema: SummarizeSymptomDescriptionOutputSchema},
  prompt: `Summarize the following symptom description to ensure clarity for the chatbot:

Symptom Description: {{{symptomDescription}}}`,
});

const summarizeSymptomDescriptionFlow = ai.defineFlow(
  {
    name: 'summarizeSymptomDescriptionFlow',
    inputSchema: SummarizeSymptomDescriptionInputSchema,
    outputSchema: SummarizeSymptomDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
