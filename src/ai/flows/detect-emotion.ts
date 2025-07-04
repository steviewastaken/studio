'use server';
/**
 * @fileOverview An AI flow to analyze emotions from facial expressions in an image.
 *
 * - detectEmotion - A function that analyzes an image to detect the predominant emotion.
 * - DetectEmotionInput - The input type for the detectEmotion function.
 * - DetectEmotionOutput - The return type for the detectEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectEmotionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectEmotionInput = z.infer<typeof DetectEmotionInputSchema>;

const DetectEmotionOutputSchema = z.object({
  emotion: z.enum(['Positive', 'Neutral', 'Negative']).describe("The dominant emotion detected in the interaction (Positive, Neutral, or Negative)."),
  analysis: z.string().describe("A brief, constructive analysis of the detected emotion and potential implications for customer service."),
  flagged: z.boolean().describe("A boolean flag set to true if the interaction is Negative and requires follow-up."),
  coaching_feedback: z.string().describe("Actionable coaching feedback for the courier if the interaction was Negative, or positive reinforcement if it was Positive."),
});
export type DetectEmotionOutput = z.infer<typeof DetectEmotionOutputSchema>;

export async function detectEmotion(input: DetectEmotionInput): Promise<DetectEmotionOutput> {
  return detectEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectEmotionPrompt',
  input: {schema: DetectEmotionInputSchema},
  output: {schema: DetectEmotionOutputSchema},
  prompt: `You are an expert in behavioral psychology and customer service training for a delivery company called Dunlivrer.
Your task is to analyze the facial expression of the person in the provided photo, which was taken at the moment of a delivery handover.

Based on the visual cues in the photo, you must:
1.  **Categorize the Emotion:** Classify the dominant emotion of the interaction as 'Positive', 'Neutral', or 'Negative'.
    - **Positive:** Look for smiles, relaxed facial muscles, and direct eye contact.
    - **Neutral:** Look for a lack of strong emotional expression, relaxed posture.
    - **Negative:** Look for frowns, furrowed brows, tense jaw, downcast eyes, or other signs of frustration, anger, or sadness.
2.  **Provide Analysis:** Write a short, professional analysis explaining your classification.
3.  **Flag for Review:** If the emotion is 'Negative', set the 'flagged' field to true. Otherwise, set it to false.
4.  **Generate Coaching Feedback:**
    - If 'Negative', provide specific, constructive coaching feedback for the courier on how they might improve customer interactions. Example: "The customer appears distressed. In these situations, it's helpful to use empathetic language like, 'I hope everything is okay with your day.' to show you care."
    - If 'Positive', provide positive reinforcement. Example: "Great job! The customer looks happy and satisfied. Keep up the excellent work in creating positive delivery experiences."
    - If 'Neutral', provide gentle encouragement. Example: "This was a standard, neutral interaction. Aim to create a moment of positive connection on your next delivery."

**Photo for Analysis:**
{{media url=photoDataUri}}

Produce the output in the required JSON format.
`,
});

const detectEmotionFlow = ai.defineFlow(
  {
    name: 'detectEmotionFlow',
    inputSchema: DetectEmotionInputSchema,
    outputSchema: DetectEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide an emotion analysis.');
    }
    return output;
  }
);
