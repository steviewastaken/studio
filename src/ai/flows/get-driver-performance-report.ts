'use server';
/**
 * @fileOverview An AI flow to generate a performance report for a delivery driver.
 *
 * - getDriverPerformanceReport - Analyzes a driver's performance and provides coaching.
 * - GetDriverPerformanceReportInput - Input for the flow.
 * - GetDriverPerformanceReportOutput - Output for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeliveryRecordSchema = z.object({
  deliveryId: z.string(),
  zone: z.string().describe("The delivery zone or neighborhood, e.g., 'Le Marais', 'Montmartre'."),
  estimatedMinutes: z.number(),
  actualMinutes: z.number(),
});

const GetDriverPerformanceReportInputSchema = z.object({
  driverId: z.string(),
  deliveryHistory: z.array(DeliveryRecordSchema).describe("The driver's delivery records for the period."),
  cityAverageDeliveryMinutes: z.number().describe("The average delivery time for all couriers in the city."),
});
export type GetDriverPerformanceReportInput = z.infer<typeof GetDriverPerformanceReportInputSchema>;


const TimePerZoneSchema = z.object({
    zone: z.string().describe("The name of the delivery zone."),
    averageTime: z.number().describe("The driver's average delivery time in minutes for this zone."),
});

const GetDriverPerformanceReportOutputSchema = z.object({
  driverAverageTime: z.number().describe("The driver's average delivery time in minutes across all deliveries."),
  missedOrLateDeliveries: z.number().describe("The total count of deliveries where actual time exceeded estimated time."),
  timePerZone: z.array(TimePerZoneSchema).describe("A breakdown of the driver's average time per delivery zone."),
  aiSuggestions: z.array(z.string()).describe("A list of 2-3 actionable, personalized suggestions for improvement based on the data."),
});
export type GetDriverPerformanceReportOutput = z.infer<typeof GetDriverPerformanceReportOutputSchema>;

export async function getDriverPerformanceReport(input: GetDriverPerformanceReportInput): Promise<GetDriverPerformanceReportOutput> {
  return getDriverPerformanceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'driverPerformancePrompt',
  input: {schema: GetDriverPerformanceReportInputSchema},
  output: {schema: GetDriverPerformanceReportOutputSchema},
  prompt: `You are an expert performance coach for Dunlivrer, a delivery service. Your task is to analyze a driver's performance data and provide a structured report with actionable feedback.

**Analysis Steps:**
1.  **Calculate Driver's Average Time:** Compute the average of 'actualMinutes' from the delivery history.
2.  **Count Late Deliveries:** Count how many deliveries have 'actualMinutes' greater than 'estimatedMinutes'.
3.  **Calculate Time Per Zone:** For each unique zone in the history, calculate the average 'actualMinutes'.
4.  **Generate AI Suggestions:** Based on all the data, generate 2-3 personalized and constructive tips.
    *   If the driver is faster than the city average, praise them and suggest focusing on consistency.
    *   If they are slower, provide specific advice. Look at the zones where they are slowest. Is there a pattern? Suggest things like "You seem to be taking longer in Le Marais. Try planning your parking spot in advance in that area to save time." or "To reduce late deliveries, consider taking a short break after a long trip to stay focused."
    *   The suggestions should be encouraging and helpful, not punitive.

**Driver Data:**
- Driver ID: {{{driverId}}}
- City-wide Average Delivery Time: {{{cityAverageDeliveryMinutes}}} minutes

**Driver's Delivery History:**
{{#each deliveryHistory}}
- Delivery in {{this.zone}}: ETA {{this.estimatedMinutes}} min, Actual {{this.actualMinutes}} min
{{/each}}

Now, perform the analysis and return the results in the required JSON format.
`,
});

const getDriverPerformanceReportFlow = ai.defineFlow(
  {
    name: 'getDriverPerformanceReportFlow',
    inputSchema: GetDriverPerformanceReportInputSchema,
    outputSchema: GetDriverPerformanceReportOutputSchema,
  },
  async (input) => {
    // In a real application, you might do some pre-calculation here.
    // For this demo, we'll let the prompt handle the calculations based on the raw data.
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a performance report.');
    }
    return output;
  }
);
