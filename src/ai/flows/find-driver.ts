'use server';

/**
 * @fileOverview Finds an available delivery driver for a new pickup.
 *
 * - findDriver - A function that finds a nearby driver.
 * - FindDriverInput - The input type for the findDriver function.
 * - FindDriverOutput - The return type for the findDriver function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindDriverInputSchema = z.object({
  pickupAddress: z.string().describe('The pickup address for the delivery.'),
});
export type FindDriverInput = z.infer<typeof FindDriverInputSchema>;

const FindDriverOutputSchema = z.object({
  driverName: z.string().describe("The name of the assigned delivery driver (a 'DunGuy')."),
  driverEta: z.string().describe('The estimated time in minutes for the driver to arrive at the pickup location.'),
});
export type FindDriverOutput = z.infer<typeof FindDriverOutputSchema>;

export async function findDriver(input: FindDriverInput): Promise<FindDriverOutput> {
  return findDriverFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findDriverPrompt',
  input: {schema: FindDriverInputSchema},
  output: {schema: FindDriverOutputSchema},
  prompt: `You are a dispatch system for a delivery service called Dunlivrer. Our drivers are called 'DunGuys'.

A new delivery has been requested for pickup at the following address: {{{pickupAddress}}}.

Your task is to find the closest available DunGuy. Invent a cool, memorable, and friendly-sounding name for the driver.

Then, estimate their arrival time in minutes to the pickup location. The ETA should be short and believable, between 3 and 15 minutes.

Return the driver's name and their ETA.`,
});

const findDriverFlow = ai.defineFlow(
  {
    name: 'findDriverFlow',
    inputSchema: FindDriverInputSchema,
    outputSchema: FindDriverOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to find a driver.');
    }
    return output;
  }
);
