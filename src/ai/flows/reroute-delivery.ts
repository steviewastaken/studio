'use server';

/**
 * @fileOverview An AI flow to handle mid-delivery rerouting requests.
 *
 * - rerouteDelivery - A function that assesses the feasibility and cost of changing a destination.
 * - RerouteDeliveryInput - The input type for the rerouteDelivery function.
 * - RerouteDeliveryOutput - The return type for the rerouteDelivery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RerouteDeliveryInputSchema = z.object({
  originalDestination: z.string().describe('The original destination address of the delivery.'),
  newDestination: z.string().describe('The new destination address requested by the user.'),
  remainingOriginalEtaMinutes: z.number().describe('The estimated minutes remaining to reach the original destination.'),
});
export type RerouteDeliveryInput = z.infer<typeof RerouteDeliveryInputSchema>;

const RerouteDeliveryOutputSchema = z.object({
  isFeasible: z.boolean().describe('Whether the requested reroute is feasible.'),
  reason: z.string().describe('A brief explanation for the decision, especially if not feasible.'),
  additionalCost: z.number().describe('The additional cost in Euros for the reroute. Can be 0 if the change is minor.'),
  newTotalEtaMinutes: z.number().describe('The new total estimated time of arrival in minutes from the present moment.'),
});
export type RerouteDeliveryOutput = z.infer<typeof RerouteDeliveryOutputSchema>;

export async function rerouteDelivery(input: RerouteDeliveryInput): Promise<RerouteDeliveryOutput> {
  return rerouteDeliveryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rerouteDeliveryPrompt',
  input: {schema: RerouteDeliveryInputSchema},
  output: {schema: RerouteDeliveryOutputSchema},
  prompt: `You are a master logistics coordinator AI for Dunlivrer, a delivery service operating in Paris, France.
A customer has requested to change their delivery destination while the package is already in transit.
Your task is to analyze the feasibility of this change and calculate the impact on cost and delivery time.

**Context:**
- The delivery was originally going to: {{{originalDestination}}}
- The customer now wants it delivered to: {{{newDestination}}}
- The remaining time to the original destination was: {{{remainingOriginalEtaMinutes}}} minutes.

**Your Heuristics for Decision Making (Apply Parisian logic):**
1.  **Feasibility:**
    - If the new destination is in a completely different 'arrondissement' (district) or crosses the Seine river from the original, it might add significant time.
    - If the new address is very far (e.g., looks like it's outside the main Paris area or in a distant suburb), mark it as not feasible.
    - If the new address is within 1-2 km of the original, it's almost always feasible.

2.  **Additional Cost Calculation:**
    - There is a base "rerouting fee" of €2.50 for any confirmed change.
    - **Minor Change:** If the new destination is very close to the original (e.g., a few blocks away in the same neighborhood), the additional cost is just the rerouting fee.
    - **Moderate Change:** If the new destination is in a nearby district, add €3.00 to €7.00 on top of the base fee.
    - **Significant Change:** If it requires crossing the city, add €8.00 to €15.00 on top of the base fee.

3.  **New ETA Calculation:**
    - **Minor Change:** Add 5-10 minutes to the \`remainingOriginalEtaMinutes\`.
    - **Moderate Change:** Add 10-20 minutes to the \`remainingOriginalEtaMinutes\`.
    - **Significant Change:** Add 20-40 minutes to the \`remainingOriginalEtaMinutes\`.

**Analysis Request:**
Based on the addresses provided, perform your analysis following the heuristics. Provide a concise reason for your decision. The final output must be in the required JSON format.
`,
});

const rerouteDeliveryFlow = ai.defineFlow(
  {
    name: 'rerouteDeliveryFlow',
    inputSchema: RerouteDeliveryInputSchema,
    outputSchema: RerouteDeliveryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide a rerouting assessment.');
    }
    return output;
  }
);
