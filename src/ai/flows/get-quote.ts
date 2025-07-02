
'use server';

/**
 * @fileOverview Generates a delivery quote including price, distance, and ETA.
 *
 * - getQuote - A function that gets a delivery quote.
 * - GetQuoteInput - The input type for the getQuote function.
 * - GetQuoteOutput - The return type for the getQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetQuoteInputSchema = z.object({
  pickupAddress: z.string().describe('The starting address for the delivery.'),
  destinationAddresses: z
    .array(z.string())
    .describe('A list of destination addresses.'),
  packageSize: z
    .enum(['small', 'medium', 'large'])
    .describe('The size of the package.'),
  deliveryType: z
    .enum(['standard', 'express', 'night'])
    .describe('The type of delivery service.'),
});
export type GetQuoteInput = z.infer<typeof GetQuoteInputSchema>;

const GetQuoteOutputSchema = z.object({
  price: z.number().describe('The total cost of the delivery in USD, rounded to 2 decimal places.'),
  distance: z.string().describe('The total travel distance for the delivery, in kilometers (e.g., "15.2 km").'),
  eta: z.string().describe('The estimated time of arrival in minutes (e.g., "25 minutes").'),
});
export type GetQuoteOutput = z.infer<typeof GetQuoteOutputSchema>;

export async function getQuote(input: GetQuoteInput): Promise<GetQuoteOutput> {
  return getQuoteFlow(input);
}

const getQuotePrompt = ai.definePrompt({
  name: 'getQuotePrompt',
  input: {schema: GetQuoteInputSchema},
  output: {schema: GetQuoteOutputSchema},
  prompt: `You are a JSON API for a delivery service called Dunlivrer. Your task is to calculate a price, total distance, and ETA for a delivery request.

Base the price on the following:
- Base fare: $5
- Per kilometer: $1.5
- Package size: small (+$0), medium (+$3), large (+$7)
- Delivery type: standard (x1), express (x1.5), night (x2)

- Calculate a realistic total distance in kilometers for the entire journey.
- Calculate a realistic total travel time in minutes.

Pickup: {{{pickupAddress}}}
Destinations:
{{#each destinationAddresses}}
- {{{this}}}
{{/each}}
Package Size: {{{packageSize}}}
Delivery Type: {{{deliveryType}}}

Provide the response ONLY in the specified JSON format. Do not add any extra text or explanations.

Example of a valid response for a 4.2 km express delivery of a medium package:
{
  "price": 21.45,
  "distance": "4.2 km",
  "eta": "15 minutes"
}
`,
});

const getQuoteFlow = ai.defineFlow(
  {
    name: 'getQuoteFlow',
    inputSchema: GetQuoteInputSchema,
    outputSchema: GetQuoteOutputSchema,
  },
  async (input) => {
    const {output} = await getQuotePrompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a quote.');
    }
    return output;
  }
);
