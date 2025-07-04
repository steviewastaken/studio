'use server';
/**
 * @fileOverview An AI-driven insurance quote engine for deliveries.
 *
 * - getInsuranceQuote - A function that provides an insurance quote for a package.
 * - GetInsuranceQuoteInput - The input type for the getInsuranceQuote function.
 * - GetInsuranceQuoteOutput - The return type for the getInsuranceQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetInsuranceQuoteInputSchema = z.object({
  deliveryValue: z.number().describe("The declared value of the package in Euros."),
  packageCategory: z.string().describe("The category of the item being shipped (e.g., 'Electronics', 'Jewelry', 'Documents')."),
  pickupAddress: z.string().describe("The pickup address for the delivery."),
  destinationAddress: z.string().describe("The final destination address for the delivery."),
  // For demonstration, we'll use a simulated score. In a real app, this would come from a courier database.
  courierTrustScore: z.number().min(0).max(100).describe("A simulated trust score for the assigned courier (0-100)."),
});
export type GetInsuranceQuoteInput = z.infer<typeof GetInsuranceQuoteInputSchema>;

const GetInsuranceQuoteOutputSchema = z.object({
  isHighRisk: z.boolean().describe("A boolean flag indicating if the delivery is considered high-risk."),
  premium: z.number().describe("The calculated insurance premium in Euros, rounded to 2 decimal places."),
  riskAnalysis: z.string().describe("A brief, user-friendly explanation of the key factors influencing the insurance premium."),
  coverageAmount: z.number().describe("The total amount covered by the insurance, which is the declared value."),
});
export type GetInsuranceQuoteOutput = z.infer<typeof GetInsuranceQuoteOutputSchema>;

export async function getInsuranceQuote(input: GetInsuranceQuoteInput): Promise<GetInsuranceQuoteOutput> {
  return getInsuranceQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getInsuranceQuotePrompt',
  input: {schema: GetInsuranceQuoteInputSchema},
  output: {schema: GetInsuranceQuoteOutputSchema},
  prompt: `You are an expert AI insurance underwriter for a delivery service called Dunlivrer.
Your task is to assess the risk of a delivery and provide an instant insurance quote based on the provided data.

**Risk Assessment Heuristics:**

1.  **Base Premium:** The starting premium is 1.5% of the package's declared value ({{{deliveryValue}}} EUR).
2.  **Category Risk Multiplier:**
    *   'Jewelry', 'Luxury Goods', 'Art': High Risk (Multiplier: 1.8x)
    *   'Electronics', 'Laptops', 'Phones': Medium Risk (Multiplier: 1.4x)
    *   'Documents', 'Clothing', 'Books': Low Risk (Multiplier: 1.0x)
    *   Apply the multiplier to the base premium.
3.  **Location Risk Surcharge (Paris-specific):**
    *   If pickup or destination contains 'Gare du Nord', 'Barbès', or 'Stalingrad', add a fixed €3.00 surcharge due to higher theft rates.
4.  **Courier Trust Discount:**
    *   A high courier trust score indicates reliability. Apply a discount to the premium (after multipliers/surcharges).
    *   Score 95-100: -15% discount
    *   Score 85-94: -10% discount
    *   Score 75-84: -5% discount
    *   Below 75: No discount.

**Calculation Steps:**
1.  Calculate Base Premium = {{{deliveryValue}}} * 0.015
2.  Apply Category Multiplier based on '{{{packageCategory}}}'.
3.  Add Location Surcharge if applicable based on '{{{pickupAddress}}}' and '{{{destinationAddress}}}'.
4.  Apply Courier Trust Discount based on the score of {{{courierTrustScore}}}.
5.  The final result is the **premium**. Round to 2 decimal places.

**Analysis and Output:**
- **isHighRisk**: Set to \`true\` if the Category is High Risk OR a Location Surcharge was applied.
- **premium**: The final calculated premium.
- **riskAnalysis**: Provide a very brief, 1-2 sentence summary of your findings. Example: "The premium reflects the high value of the electronics and the standard risk profile of the route. A discount was applied due to the courier's excellent record." or "This route passes through a high-risk area, which is reflected in the premium."
- **coverageAmount**: This should be equal to the '{{{deliveryValue}}}'.

Now, analyze the data and provide the results in the required JSON format.
`,
});

const getInsuranceQuoteFlow = ai.defineFlow(
  {
    name: 'getInsuranceQuoteFlow',
    inputSchema: GetInsuranceQuoteInputSchema,
    outputSchema: GetInsuranceQuoteOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide an insurance quote.');
    }
    return output;
  }
);
