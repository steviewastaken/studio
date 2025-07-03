
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
  price: z.number().describe('The total cost of the delivery in Euros, rounded to 2 decimal places.'),
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('The API key is not configured on the server. Please contact support.');
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
            const errorMessage = data.error_message || `API Error: ${data.status}`;
            console.error('Directions API Error:', errorMessage, 'Status:', data.status);
            
            if (data.status === 'NOT_FOUND' || data.status === 'ZERO_RESULTS') {
                throw new Error('No route could be found. Please check that the addresses are correct and try again.');
            }
            if (data.status === 'REQUEST_DENIED') {
                throw new Error('The request was denied. This may be an issue with the API key configuration.');
            }
            throw new Error(`Failed to get directions. Please try again later.`);
        }

        if (!data.routes || data.routes.length === 0 || !data.routes[0].legs || data.routes[0].legs.length === 0) {
            console.error('Directions API Error: No routes or legs found for the given addresses.');
            throw new Error('No valid route could be found between the specified addresses. They may be too far apart or on disconnected road networks.');
        }

        data.routes[0].legs.forEach((leg: any) => {
            totalDistanceMeters += leg.distance.value;
            totalDurationSeconds += leg.duration.value;
        });

    } catch (e: any) {
        console.error("Error fetching or processing Directions API response:", e.message);
        // Re-throw specific, user-friendly messages
        throw new Error(e.message || 'An unknown error occurred while calculating the route.');
    }
    
    if (totalDistanceMeters === 0) {
        throw new Error('Could not calculate a valid route for the given addresses. The distance is zero.');
    }

    const distanceInKm = totalDistanceMeters / 1000;
    
    // Use duration from API for ETA, add buffer
    const etaInMinutes = Math.round(totalDurationSeconds / 60) + 10; // 10 min buffer for pickup/dropoff

    // --- France-Based Pricing Logic ---
    const BASE_FARE = 5.00; 
    const BASE_DISTANCE_KM = 2;

    let distanceCost = 0;
    let remainingDistance = distanceInKm > BASE_DISTANCE_KM ? distanceInKm - BASE_DISTANCE_KM : 0;

    if (remainingDistance > 0) {
        const distInSlab = Math.min(remainingDistance, 3);
        distanceCost += distInSlab * 1.00;
        remainingDistance -= distInSlab;
    }
    if (remainingDistance > 0) {
        const distInSlab = Math.min(remainingDistance, 5);
        distanceCost += distInSlab * 0.80;
        remainingDistance -= distInSlab;
    }
    if (remainingDistance > 0) {
        const distInSlab = Math.min(remainingDistance, 10);
        distanceCost += distInSlab * 0.70;
        remainingDistance -= distInSlab;
    }
    if (remainingDistance > 0) {
        distanceCost += remainingDistance * 0.60;
    }

    const weightSurchargeMap = { small: 0, medium: 1.00, large: 2.00 };
    const weightSurcharge = weightSurchargeMap[input.packageSize];

    const speedSurchargeMap = { standard: 0, express: 3.00, night: 2.50 };
    const speedSurcharge = speedSurchargeMap[input.deliveryType];
    
    let totalCost = BASE_FARE + distanceCost + weightSurcharge + speedSurcharge;

    const finalPrice = Math.round(totalCost * 100) / 100;

    return {
      price: finalPrice,
      distance: `${distanceInKm.toFixed(1)} km`,
      eta: `${etaInMinutes} minutes`,
    };
  }
);
