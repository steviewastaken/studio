'use server';

/**
 * @fileOverview Estimates the delivery time (ETA) based on delivery details.
 *
 * - estimateETA - A function that estimates the ETA.
 * - EstimateETAInput - The input type for the estimateETA function.
 * - EstimateETAOutput - The return type for the estimateETA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateETAInputSchema = z.object({
  pickupAddress: z.string().describe('The pickup address for the delivery.'),
  destinationAddresses: z.array(z.string()).describe('A list of destination addresses for the delivery.'),
  packageSize: z.enum(['small', 'medium', 'large']).describe('The size of the package being delivered.'),
  deliveryType: z.enum(['standard', 'express', 'night']).describe('The type of delivery service requested (e.g., standard, express). This will affect the urgency.'),
});
export type EstimateETAInput = z.infer<typeof EstimateETAInputSchema>;

const EstimateETAOutputSchema = z.object({
  estimatedTime: z
    .string()
    .regex(/^\d+$/, { message: 'Estimated time must be a string containing only digits.' })
    .describe('The estimated time of arrival (ETA) in minutes, as a string containing only numbers (e.g., "45").'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('A confidence score (0-1) indicating the reliability of the ETA estimate.'),
});
export type EstimateETAOutput = z.infer<typeof EstimateETAOutputSchema>;

export async function estimateETA(input: EstimateETAInput): Promise<EstimateETAOutput> {
  return estimateETAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateETAPrompt',
  input: {schema: EstimateETAInputSchema},
  output: {schema: EstimateETAOutputSchema},
  prompt: `You are a machine that only returns JSON. Do not write any text, explanation, or markdown. Your entire response MUST be a single, valid JSON object that conforms to the required schema.

Estimate a delivery time in minutes based on these details:
Pickup: {{{pickupAddress}}}
Destinations:
{{#each destinationAddresses}}
- {{{this}}}
{{/each}}
Package Size: {{{packageSize}}}
Service: {{{deliveryType}}}

Return a JSON object with "estimatedTime" (a string of only digits) and "confidence" (a number between 0.0 and 1.0).`,
});

const estimateETAFlow = ai.defineFlow(
  {
    name: 'estimateETAFlow',
    inputSchema: EstimateETAInputSchema,
    outputSchema: EstimateETAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to return a valid estimate.');
    }
    return output;
  }
);
