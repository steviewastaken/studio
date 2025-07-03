
'use server';

/**
 * @fileOverview Generates a delivery quote using the Google Maps Directions API for accuracy.
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

// The main exported function that the client calls.
export async function getQuote(input: GetQuoteInput): Promise<GetQuoteOutput> {
  return getQuoteFlow(input);
}

// This flow now uses the Google Maps Directions API for reliable distance calculation.
const getQuoteFlow = ai.defineFlow(
  {
    name: 'getQuoteFlow',
    inputSchema: GetQuoteInputSchema,
    outputSchema: GetQuoteOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured on the server.');
    }

    const origin = input.pickupAddress;
    const destination = input.destinationAddresses[input.destinationAddresses.length - 1];
    const waypoints = input.destinationAddresses.slice(0, -1).join('|');

    const params = new URLSearchParams({
        origin,
        destination,
        key: apiKey,
    });

    if (waypoints) {
        params.append('waypoints', `optimize:true|${waypoints}`);
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;

    let totalDistanceMeters = 0;
    let totalDurationSeconds = 0;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Directions API Error:', data.error_message || data.status);
            throw new Error(`Failed to get directions from Google Maps API: ${data.status}`);
        }

        data.routes[0].legs.forEach((leg: any) => {
            totalDistanceMeters += leg.distance.value;
            totalDurationSeconds += leg.duration.value;
        });

    } catch (e: any) {
        console.error("Error calling Directions API:", e);
        throw new Error(`Failed to calculate route. Please check addresses and API key permissions. Reason: ${e.message}`);
    }
    
    if (totalDistanceMeters === 0) {
        throw new Error('Could not calculate a route for the given addresses.');
    }

    const distanceInKm = totalDistanceMeters / 1000;
    
    // Use duration from API for ETA, add buffer
    const etaInMinutes = Math.round(totalDurationSeconds / 60) + 10; // 10 min buffer for pickup/dropoff

    // Reliable price calculation
    const BASE_FARE = 5;
    const PER_KM_RATE = 1.5;

    const sizeCostMap = {small: 0, medium: 3, large: 7};
    const typeMultiplierMap = {standard: 1, express: 1.5, night: 2};

    const distanceCost = distanceInKm * PER_KM_RATE;
    const sizeCost = sizeCostMap[input.packageSize];
    let totalCost = (BASE_FARE + distanceCost + sizeCost) * typeMultiplierMap[input.deliveryType];

    // Round to 2 decimal places.
    const finalPrice = Math.round(totalCost * 100) / 100;

    return {
      price: finalPrice,
      distance: `${distanceInKm.toFixed(1)} km`,
      eta: `${etaInMinutes} minutes`,
    };
  }
);
