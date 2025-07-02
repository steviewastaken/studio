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
});
export type EstimateETAInput = z.infer<typeof EstimateETAInputSchema>;

const EstimateETAOutputSchema = z.object({
  estimatedTime: z.string().describe('The estimated time of arrival (ETA) in minutes.'),
  confidence: z.number().describe('A confidence score (0-1) indicating the reliability of the ETA estimate.'),
});
export type EstimateETAOutput = z.infer<typeof EstimateETAOutputSchema>;

export async function estimateETA(input: EstimateETAInput): Promise<EstimateETAOutput> {
  return estimateETAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateETAPrompt',
  input: {schema: EstimateETAInputSchema},
  output: {schema: EstimateETAOutputSchema},
  prompt: `You are a delivery time estimator. You take into account the pickup address, a list of destination addresses, and package size to estimate the total delivery time in minutes for a multi-drop route. You should optimize the order of the destinations to create the most efficient route.

  Pickup Address: {{{pickupAddress}}}
  Destination Addresses:
  {{#each destinationAddresses}}
  - {{{this}}}
  {{/each}}
  Package Size: {{{packageSize}}}

  Provide your estimate in minutes and include a confidence score (0-1) for how reliable you believe your estimate is. The output must be parsable as a JSON object.`,
});

const estimateETAFlow = ai.defineFlow(
  {
    name: 'estimateETAFlow',
    inputSchema: EstimateETAInputSchema,
    outputSchema: EstimateETAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
