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
  prompt: `You are a JSON API. Your response must be a valid JSON object and nothing else.

Your task is to estimate delivery time based on the provided details.

**Delivery Details:**
*   Pickup: {{{pickupAddress}}}
*   Destinations: {{#each destinationAddresses}}{{{this}}}{{/each}}
*   Package Size: {{{packageSize}}}
*   Service: {{{deliveryType}}}

You must return a JSON object with two fields:
1.  \`estimatedTime\`: A string containing ONLY the total estimated minutes as a number (e.g., "45").
2.  \`confidence\`: A number between 0.0 and 1.0 representing your confidence.

The final output MUST be ONLY a valid JSON object. Do not add any text, explanations, or markdown.

Example of a valid response:
{
  "estimatedTime": "35",
  "confidence": 0.9
}`,
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
