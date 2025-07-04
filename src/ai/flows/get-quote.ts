
'use server';

/**
 * @fileOverview Generates a delivery quote using the Google Maps Directions API and a dynamic pricing model.
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
  etaConfidenceRange: z.string().describe('The confidence range for the ETA, e.g., "42–50 min".'),
  etaConfidencePercentage: z.number().describe('The confidence percentage for the ETA prediction, e.g., 94.'),
  co2Emission: z.string().describe('The estimated CO2 equivalent emission for the delivery, in grams (e.g., "3040g CO₂e").')
});
export type GetQuoteOutput = z.infer<typeof GetQuoteOutputSchema>;

// The main exported function that the client calls.
export async function getQuote(input: GetQuoteInput): Promise<GetQuoteOutput> {
  return getQuoteFlow(input);
}


const etaPredictionPrompt = ai.definePrompt({
    name: 'etaPredictionPrompt',
    input: { schema: z.object({
        baseDurationMinutes: z.number(),
        distanceKm: z.number(),
        timeOfDay: z.string(),
        dayOfWeek: z.string(),
        packageSize: z.enum(['small', 'medium', 'large']),
        deliveryType: z.enum(['standard', 'express', 'night']),
        hasBadWeather: z.boolean(),
        isHighDemand: z.boolean(),
    })},
    output: { schema: z.object({
        predictedEtaMinutes: z.number().describe('The final predicted ETA in total minutes, including all factors.'),
        minEtaMinutes: z.number().describe('The lower bound of the estimated time of arrival in minutes. This should be a few minutes less than the predicted ETA.'),
        maxEtaMinutes: z.number().describe('The upper bound of the estimated time of arrival in minutes. This should be a few minutes more than the predicted ETA.'),
        confidencePercentage: z.number().min(85).max(98).describe('Your confidence level in this ETA prediction, as an integer percentage (e.g., 94).'),
    })},
    prompt: `You are an expert logistics AI specializing in hyper-accurate delivery time estimation for a service called Dunlivrer.
Your task is to predict the final Estimated Time of Arrival (ETA) in minutes by adjusting a base travel time from a mapping service.

You must consider the following factors and adjust the base ETA accordingly:

- **Base ETA:** The initial travel time is {{{baseDurationMinutes}}} minutes for a distance of {{{distanceKm}}} km. This is your starting point.
- **Time of Day:** It is currently {{{timeOfDay}}} on a {{{dayOfWeek}}}.
  - **Peak Hours (8-10am, 5-7pm):** Add 5-15 minutes for traffic congestion.
  - **Night Delivery (for 'night' type):** Night deliveries are often faster due to less traffic, but might have a small delay for finding addresses in the dark. Adjust by -5 to +5 minutes.
- **Delivery Type:** The requested service is '{{{deliveryType}}}'.
  - **'express':** This is a priority delivery. Reduce the final ETA by 10-20% compared to standard, but don't go below the base mapping service time. The driver will be rushed.
  - **'standard' / 'night':** No special adjustment for speed.
- **Package Size:** The package size is '{{{packageSize}}}'.
  - **'large':** Add 3-5 minutes for extra handling time at pickup and dropoff.
  - **'medium' / 'small':** No significant adjustment.
- **Real-World Conditions:**
  - **Bad Weather:** {{{hasBadWeather}}}. If true, add 5-10 minutes for slower travel speeds.
  - **High Demand:** {{{isHighDemand}}}. If true, add 2-5 minutes as the network is busier.

**Pickup/Dropoff Buffer:** ALWAYS add a base buffer of 10 minutes to the travel time to account for parking, finding the exact door, and handover. This should be added ON TOP of the base duration *before* other adjustments.

**Analysis and Output:**
Based on all factors, provide:
1.  **predictedEtaMinutes:** Your best single-point estimate for the total delivery time in minutes.
2.  **minEtaMinutes & maxEtaMinutes:** A realistic time range for the delivery. The range should be reasonable, reflecting the potential for minor, common variations.
3.  **confidencePercentage:** Your confidence in the \`predictedEtaMinutes\` estimate, as an integer percentage between 85 and 98. Higher confidence for shorter, simpler routes during off-peak hours; lower confidence for complex routes in bad weather or peak traffic.

Analyze all these factors and provide your final results in the required JSON format.
`,
});


// This flow now uses the Google Maps Directions API for reliable distance calculation.
const getQuoteFlow = ai.defineFlow(
  {
    name: 'getQuoteFlow',
    inputSchema: GetQuoteInputSchema,
    outputSchema: GetQuoteOutputSchema,
  },
  async (input) => {
    // This is a simulation. In a real app, you would use a mapping service
    // like Google Maps Directions API to get the real distance and duration.
    const MOCK_KM_PER_DESTINATION = 7.5;
    const MOCK_MINUTES_PER_KM = 2.5;

    let totalDistanceMeters = (MOCK_KM_PER_DESTINATION * input.destinationAddresses.length * 1000);
    let totalDurationSeconds = (totalDistanceMeters / 1000) * MOCK_MINUTES_PER_KM * 60;
    
    if (totalDistanceMeters === 0) {
        throw new Error('Could not calculate a valid route for the given addresses. The distance is zero.');
    }

    const distanceInKm = totalDistanceMeters / 1000;
    
    // --- Dynamic Pricing Engine ---
    const BASE_FARE = 5.00; 
    const BASE_DISTANCE_KM = 2;

    // 1. Distance-based Cost
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

    // 2. Package Size Surcharge
    const weightSurchargeMap = { small: 0, medium: 1.00, large: 2.00 };
    const weightSurcharge = weightSurchargeMap[input.packageSize];

    // 3. Delivery Type Surcharge
    const speedSurchargeMap = { standard: 0, express: 3.00, night: 2.50 };
    const speedSurcharge = speedSurchargeMap[input.deliveryType];
    
    // 4. Time-based Surcharges (Peak Hours)
    const now = new Date();
    let timeSurcharge = 0;
    const currentHour = now.getHours();
    // Peak hours: 8-10am and 5-7pm
    if ((currentHour >= 8 && currentHour < 10) || (currentHour >= 17 && currentHour < 19)) {
        timeSurcharge = 1.25; // €1.25 peak hour surcharge
    }

    // 5. Simulated Real-time Factors
    let weatherSurcharge = 0;
    if (Math.random() < 0.15) { // 15% chance of bad weather
        weatherSurcharge = 1.50; // €1.50 bad weather surcharge
    }

    let supplySurcharge = 0;
    if (Math.random() < 0.20) { // 20% chance of high demand / low courier supply
        supplySurcharge = 0.75 * (distanceInKm / 10); // Surcharge increases with distance during high demand
    }
    
    // Final Price Calculation
    let totalCost = BASE_FARE + distanceCost + weightSurcharge + speedSurcharge + timeSurcharge + weatherSurcharge + supplySurcharge;
    const finalPrice = Math.round(totalCost * 100) / 100;

    // --- AI-Powered ETA Prediction ---
    const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"
    const timeOfDay = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); // e.g., "14:30"
    const baseDurationMinutes = Math.round(totalDurationSeconds / 60);

    const etaPredictionInput = {
        baseDurationMinutes,
        distanceKm: distanceInKm,
        timeOfDay,
        dayOfWeek,
        packageSize: input.packageSize,
        deliveryType: input.deliveryType,
        hasBadWeather: weatherSurcharge > 0,
        isHighDemand: supplySurcharge > 0,
    };

    const { output: etaOutput } = await etaPredictionPrompt(etaPredictionInput);
    if (!etaOutput) {
        throw new Error('The AI model failed to predict an ETA.');
    }
    const { predictedEtaMinutes, minEtaMinutes, maxEtaMinutes, confidencePercentage } = etaOutput;
    
    const co2EmissionGrams = Math.round(distanceInKm * 200); // 200g CO2e per km heuristic

    return {
      price: finalPrice,
      distance: `${distanceInKm.toFixed(1)} km`,
      eta: `${predictedEtaMinutes} minutes`,
      etaConfidenceRange: `${minEtaMinutes}–${maxEtaMinutes} min`,
      etaConfidencePercentage: confidencePercentage,
      co2Emission: `${co2EmissionGrams}g CO₂e`,
    };
  }
);
