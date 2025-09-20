'use server';
/**
 * @fileOverview A Genkit flow for transcribing audio data using Groq's Whisper API.
 *
 * This flow takes an audio data URI, sends it to Groq for transcription,
 * and returns the transcribed text.
 *
 * - transcribeAudio - A function to trigger the audio transcription flow.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import Groq from 'groq-sdk';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data to transcribe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<
  typeof TranscribeAudioOutputSchema
>;

export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        'GROQ_API_KEY is not set in the environment variables.'
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Extract content type and base64 data from data URI
    const match = input.audioDataUri.match(/^data:(audio\/\w+);base64,(.*)$/);
    if (!match) {
      throw new Error('Invalid audio data URI format.');
    }
    
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Groq SDK's `toFile` expects a Buffer-like object.
    const file = await Groq.toFile(buffer, 'audio.webm');

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
    });

    return { transcription: transcription.text };
  }
);
