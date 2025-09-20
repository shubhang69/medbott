'use server';
/**
 * @fileOverview Analyzes a patient's case description and provides a structured summary for a doctor.
 *
 * - summarizeSymptomDescription - A function that analyzes the case description.
 * - SummarizeSymptomDescriptionInput - The input type for the summarizeSymptomDescription function.
 * - SummarizeSymptomDescriptionOutput - The return type for the summarizeSymptomDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSymptomDescriptionInputSchema = z.object({
  symptomDescription: z
    .string()
    .describe("The doctor-provided description of the patient's case, including symptoms, history, and findings."),
});
export type SummarizeSymptomDescriptionInput = z.infer<
  typeof SummarizeSymptomDescriptionInputSchema
>;

const SummarizeSymptomDescriptionOutputSchema = z.object({
  summary: z
    .string()
    .describe('A structured analysis including potential differential diagnoses, questions to ask, and recommended tests.'),
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
  prompt: `You are an expert AI medical assistant for doctors. Your role is to analyze a patient's case as described by a physician and provide decision support.

Analyze the following case details:
Case Description: {{{symptomDescription}}}

Based on the provided information, generate a structured analysis that includes:
1.  A list of potential differential diagnoses, ordered from most to least likely.
2.  Key follow-up questions to ask the patient to further narrow down the diagnosis.
3.  Recommendations for relevant diagnostic tests or labs.

Present this information clearly and concisely to assist the doctor in their diagnostic process.`,
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
