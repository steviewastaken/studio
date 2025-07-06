
'use server';
/**
 * @fileOverview A flow to convert text to speech.
 *
 * - textToSpeech - A function that converts text to an audio data URI.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  language: z.string().optional().describe('The BCP-47 language code for the text (e.g., "en-US", "fr-FR", "es-ES"). Defaults to English if not provided.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
    audioDataUri: z.string().describe("The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    let voiceName = 'Algenib'; // Default English voice
    if (input.language) {
      if (input.language.startsWith('fr')) {
        voiceName = 'Caph'; // French voice
      } else if (input.language.startsWith('es')) {
        voiceName = 'Electra'; // Spanish voice
      } else if (input.language.startsWith('de')) {
        voiceName = 'Rigel'; // German voice
      } else if (input.language.startsWith('zh')) {
        voiceName = 'Hadar'; // Mandarin voice
      } else if (input.language.startsWith('ja')) {
        voiceName = 'Spica'; // Japanese voice
      } else if (input.language.startsWith('ar')) {
        voiceName = 'Antares'; // Arabic voice
      } else if (input.language.startsWith('pt')) {
        voiceName = 'Regulus'; // Portuguese voice
      } else if (input.language.startsWith('ru')) {
        voiceName = 'Vega'; // Russian voice
      } else if (input.language.startsWith('hi')) {
        voiceName = 'Procyon'; // Hindi voice
      } else if (input.language.startsWith('it')) {
        voiceName = 'Altair'; // Italian voice
      }
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
