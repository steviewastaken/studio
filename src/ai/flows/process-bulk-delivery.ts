
'use server';
/**
 * @fileOverview An AI flow to process and optimize a bulk CSV upload of deliveries.
 *
 * - processBulkDelivery - Analyzes a CSV and returns an optimized dispatch plan.
 * - ProcessBulkDeliveryInput - Input for the flow.
 * - ProcessBulkDeliveryOutput - Output for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessBulkDeliveryInputSchema = z.object({
  csvData: z.string().describe("A CSV string containing a list of deliveries. The expected header is `destination_address,package_size,notes`."),
});
export type ProcessBulkDeliveryInput = z.infer<typeof ProcessBulkDeliveryInputSchema>;

const ProcessBulkDeliveryOutputSchema = z.object({
  uploadSummary: z.object({
    totalPackages: z.number().describe("The total number of packages parsed from the CSV."),
    validPackages: z.number().describe("The number of packages with valid Parisian addresses."),
    invalidPackages: z.number().describe("The number of packages with invalid or out-of-zone addresses."),
    totalQuote: z.number().describe("The total estimated price in Euros for all valid deliveries."),
  }),
  consolidatedRoutes: z.array(z.object({
    zone: z.string().describe("The name of the geographic zone or neighborhood."),
    addresses: z.array(z.string()).describe("A list of addresses within this zone."),
    routeSuggestion: z.string().describe("A brief, human-readable suggestion for an efficient delivery path within this zone."),
  })).describe("A list of delivery routes, grouped by zone for optimized dispatch."),
  smartPricingSuggestion: z.object({
    window: z.string().describe("The suggested 2-hour window for the most cost-effective dispatch (e.g., '2-4 PM')."),
    savingsPercentage: z.number().describe("The estimated percentage of savings if dispatched in this window."),
    reason: z.string().describe("A brief explanation for why this window is optimal."),
  }),
  demandForecast: z.object({
    prediction: z.string().describe("A prediction about potential recurring deliveries based on patterns in the data."),
    confidence: z.enum(['Low', 'Medium', 'High']).describe("The AI's confidence level in this recurring delivery prediction."),
  }),
});
export type ProcessBulkDeliveryOutput = z.infer<typeof ProcessBulkDeliveryOutputSchema>;

export async function processBulkDelivery(input: ProcessBulkDeliveryInput): Promise<ProcessBulkDeliveryOutput> {
  return processBulkDeliveryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processBulkDeliveryPrompt',
  input: {schema: ProcessBulkDeliveryInputSchema},
  output: {schema: ProcessBulkDeliveryOutputSchema},
  prompt: `You are an advanced AI Logistics Engine for Dunlivrer, a delivery service in Paris. Your task is to process a CSV string containing a list of deliveries and return a comprehensive optimization plan.

**Input CSV Format:**
The CSV will have three columns: \`destination_address\`, \`package_size\`, \`notes\`.

**Your Analysis Tasks:**

1.  **Parse & Summarize:**
    *   Parse all rows from the CSV data.
    *   Count the total number of packages, the number of valid Parisian addresses, and the number of invalid/out-of-zone addresses (e.g., London).

2.  **AI Quote Generation (Total Cost):**
    *   For each **valid** Parisian delivery, calculate an estimated price.
    *   **Pricing Model:**
        *   Base Fare: €5.00
        *   Package Size Surcharge: 'small' = €0, 'medium' = €1.50, 'large' = €3.00.
        *   Distance Cost: Use your geographical knowledge of Paris to estimate the distance between a central dispatch point (like Châtelet) and the destination address. Apply a cost of €0.80 per estimated kilometer.
    *   Sum the costs for all valid packages to get the \`totalQuote\`.
    *   Exclude any invalid addresses from this calculation.

3.  **AI Route Consolidation (Grouped Dispatch):**
    *   Group the **valid** deliveries by their geographical zone or neighborhood (e.g., 'Le Marais', 'Montmartre', 'La Défense').
    *   For each zone, create a consolidated route plan. Briefly describe an efficient path for the deliveries within that zone. For example: "Start at the northernmost address and work south."
    *   List the full addresses included in each consolidated route.

4.  **AI Smart Pricing (Best Delivery Window):**
    *   Analyze the entire list of deliveries.
    *   Based on typical Parisian traffic patterns, identify the most cost-effective 2-hour window to dispatch these deliveries (e.g., "2-4 PM").
    *   The optimal window should be during off-peak hours (avoiding 8-10 AM and 5-7 PM).
    *   Provide a compelling reason for your suggestion (e.g., "by avoiding morning rush hour and having lighter traffic").
    *   Invent a plausible percentage saving (between 10-25%).

5.  **Demand Forecast (Recurring Deliveries):**
    *   Analyze the addresses and notes for patterns that suggest recurring business needs (e.g., multiple deliveries to office buildings, notes like "weekly restock", "monthly supplies").
    *   If a pattern is found, suggest a recurring delivery schedule (e.g., "A recurring delivery every Monday at 9 AM seems likely for the Montmartre cafe restock.").
    *   Provide a confidence score (Low, Medium, High) for your prediction.
    *   If no clear pattern exists, state that and suggest monitoring for future patterns (e.g., "No clear recurring pattern detected yet. Monitor for future uploads to confirm.").

**Input Data:**
\`\`\`csv
{{{csvData}}}
\`\`\`

Now, perform the full analysis and provide the output in the required structured JSON format.
`,
});

const processBulkDeliveryFlow = ai.defineFlow(
  {
    name: 'processBulkDeliveryFlow',
    inputSchema: ProcessBulkDeliveryInputSchema,
    outputSchema: ProcessBulkDeliveryOutputSchema,
  },
  async (input) => {
    if (!input.csvData || input.csvData.trim().split('\n').length < 2) {
      throw new Error("CSV data is empty or contains only a header. Please provide valid delivery data.");
    }
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a dispatch plan.');
    }
    return output;
  }
);
