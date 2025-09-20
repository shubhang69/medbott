'use server';
/**
 * @fileOverview A Genkit flow for transcribing audio data using Groq's Whisper API.
 *
 * This flow takes an audio data URI and a language code, sends it to Groq for transcription,
 * and returns the transcribed text. Restricted to English ('en'), Hindi ('hi'), and Marathi ('mr').
 *
 * - transcribeAudio - A function to trigger the audio transcription flow.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Groq from 'groq-sdk';

// Define allowed languages (ISO-639-1 codes)
const allowedLanguages = ['en', 'hi', 'mr'] as const;

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data to transcribe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.enum(allowedLanguages).describe('Language code for transcription (en: English, hi: Hindi, mr: Marathi).'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

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
  async (input) => {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in the environment variables.');
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Extract MIME type and base64 data from data URI
    const match = input.audioDataUri.match(/^data:(audio\/(\w+));base64,(.*)$/);
    if (!match) {
      throw new Error('Invalid audio data URI format. Must be "data:audio/<type>;base64,<data>".');
    }

    const [, mimeType, fileExtension, base64Data] = match;
    if (!['mp3', 'wav', 'webm', 'ogg', 'flac', 'm4a'].includes(fileExtension)) {
      throw new Error(`Unsupported audio format: ${mimeType}. Supported: mp3, m4a, wav, webm, ogg, flac.`);
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // Prepare file for Groq API
    const file = await groq.toFile(buffer, `audio.${fileExtension}`);

    try {
      const transcription = await groq.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3',
        language: input.language, // Restricts and guides transcription to specified language
      });

      if (!transcription.text) {
        throw new Error('Transcription failed: No text returned from API.');
      }

      return { transcription: transcription.text.trim() };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio. Please check the input and try again.');
    }
  }
);
