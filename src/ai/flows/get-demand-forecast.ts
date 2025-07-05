'use server';
/**
 * @fileOverview An AI flow to forecast delivery demand for different city zones.
 *
 * - getDemandForecast - Generates a demand forecast.
 * - GetDemandForecastInput - Input for the flow (can be empty for this demo).
 * - GetDemandForecastOutput - Output for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastSchema = z.object({
  zone: z.string().describe("The name of the city zone or neighborhood (e.g., 'Le Marais', '75001')."),
  predictedOrders: z.number().describe("The predicted number of orders for the next hour."),
  demandLevel: z.enum(['Very High', 'High', 'Medium', 'Low', 'Underserved']).describe("The categorized demand level."),
  analysis: z.string().describe("A brief, one-sentence explanation for the forecast (e.g., 'Driven by evening meal rush and good weather.')."),
  suggestion: z.string().describe("An actionable suggestion for the operations team (e.g., 'Shift 2 couriers from a Low demand zone to here.')."),
});

const GetDemandForecastInputSchema = z.object({
  // No input needed for this demo, it will generate a forecast for the current time.
});
export type GetDemandForecastInput = z.infer<typeof GetDemandForecastInputSchema>;

const GetDemandForecastOutputSchema = z.object({
  forecasts: z.array(ForecastSchema).describe("A list of demand forecasts for various city zones."),
  overallSummary: z.string().describe("A one-sentence summary of the city-wide demand situation."),
});
export type GetDemandForecastOutput = z.infer<typeof GetDemandForecastOutputSchema>;

export async function getDemandForecast(input: GetDemandForecastInput): Promise<GetDemandForecastOutput> {
  return getDemandForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'demandForecastPrompt',
  input: {schema: GetDemandForecastInputSchema},
  output: {schema: GetDemandForecastOutputSchema},
  prompt: `You are a sophisticated AI Logistics Analyst for Dunlivrer in Paris.
Your task is to generate a demand forecast for the next hour across several key Parisian zones.

**Simulated Real-Time Data (for this analysis):**
- **Time:** It's currently a weekday evening (19:00).
- **Weather:** Clear skies, pleasant temperature. Perfect for outdoor dining.
- **Events:**
    - A major concert is scheduled at the Accor Arena (Bercy, 75012).
    - A fashion week event is happening in Le Marais (75004).
- **Historical Data:** Weekday evenings consistently show high demand for food delivery across central Paris. Business districts like La Défense are quiet now.

**Analysis Steps:**
1.  **Analyze each zone:** Consider the time, weather, events, and historical data.
2.  **Predict Orders:** Estimate the number of orders for the next hour.
3.  **Categorize Demand:** Classify the demand level ('Very High', 'High', 'Medium', 'Low', 'Underserved'). 'Underserved' means there's likely more demand than available couriers.
4.  **Provide Analysis:** Briefly explain *why* you made that prediction.
5.  **Give Suggestions:** Offer a concrete, actionable suggestion for the operations team.
6.  **Generate Forecasts:** Create forecasts for the following zones:
    - Le Marais (75004)
    - Saint-Germain-des-Prés (75006)
    - Bercy (75012)
    - Montmartre (75018)
    - La Défense (Business District)
7.  **Overall Summary:** Write a single sentence that encapsulates the overall demand situation for the city.

Now, perform the analysis and return the results in the required JSON format.
`,
});

const getDemandForecastFlow = ai.defineFlow(
  {
    name: 'getDemandForecastFlow',
    inputSchema: GetDemandForecastInputSchema,
    outputSchema: GetDemandForecastOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a demand forecast.');
    }
    return output;
  }
);
