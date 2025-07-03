
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

// This is the schema for the AI's output. It's internal to this file.
const AiEstimateSchema = z.object({
  distanceInKm: z
    .number()
    .describe(
      'A realistic total travel distance for the delivery, as a single number in kilometers.'
    ),
  etaInMinutes: z
    .number()
    .int()
    .describe('A realistic total travel time, as a single number in minutes.'),
});

// The main exported function that the client calls.
export async function getQuote(input: GetQuoteInput): Promise<GetQuoteOutput> {
  return getQuoteFlow(input);
}

// The prompt now only asks the AI to do what it's good at: estimation.
const getEstimatePrompt = ai.definePrompt({
  name: 'getEstimatePrompt',
  input: {schema: GetQuoteInputSchema},
  output: {schema: AiEstimateSchema},
  prompt: `You are a logistics estimation API. Based on the pickup and destination addresses, calculate a realistic total distance and estimated time of arrival.
Return ONLY the specified JSON.

Pickup: {{{pickupAddress}}}
Destinations:
{{#each destinationAddresses}}
- {{{this}}}
{{/each}}
`,
});

// The flow orchestrates the AI call and the reliable price calculation.
const getQuoteFlow = ai.defineFlow(
  {
    name: 'getQuoteFlow',
    inputSchema: GetQuoteInputSchema,
    outputSchema: GetQuoteOutputSchema,
  },
  async (input) => {
    // Step 1: Get distance and time estimation from the AI.
    const {output: estimate} = await getEstimatePrompt(input);
    if (!estimate) {
      throw new Error('The AI model failed to provide a distance and ETA estimate.');
    }

    // Step 2: Perform reliable price calculation in code.
    const BASE_FARE = 5;
    const PER_KM_RATE = 1.5;

    const sizeCostMap = {small: 0, medium: 3, large: 7};
    const typeMultiplierMap = {standard: 1, express: 1.5, night: 2};

    const distanceCost = estimate.distanceInKm * PER_KM_RATE;
    const sizeCost = sizeCostMap[input.packageSize];
    let totalCost = (BASE_FARE + distanceCost + sizeCost) * typeMultiplierMap[input.deliveryType];

    // Round to 2 decimal places.
    const finalPrice = Math.round(totalCost * 100) / 100;

    // Step 3: Format the final output to match what the client expects.
    return {
      price: finalPrice,
      distance: `${estimate.distanceInKm.toFixed(1)} km`,
      eta: `${estimate.etaInMinutes} minutes`,
    };
  }
);
