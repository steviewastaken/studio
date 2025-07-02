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
  prompt: `Analyze the following delivery details and provide an estimated delivery time in minutes and a confidence score.

**Delivery Details:**
*   **Pickup:** {{{pickupAddress}}}
*   **Destinations:**
    {{#each destinationAddresses}}
    *   {{{this}}}
    {{/each}}
*   **Package Size:** {{{packageSize}}}
*   **Service Level:** {{{deliveryType}}}

**Instructions:**
1.  Calculate the most efficient route for the given destinations.
2.  Factor in the \`deliveryType\`: 'express' should be fastest, 'night' may vary.
3.  The final output MUST be ONLY a valid JSON object conforming to the specified schema, with no extra text or explanations.

**Example JSON Output Format:**
{
  "estimatedTime": "45",
  "confidence": 0.85
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
