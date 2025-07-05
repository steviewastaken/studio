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


// This schema is for the AI prompt that only generates the text analysis.
const analysisPromptInputSchema = z.object({
    deliveryValue: z.number(),
    packageCategory: z.string(),
    pickupAddress: z.string(),
    destinationAddress: z.string(),
    premium: z.number(),
    factors: z.object({
        categoryMultiplier: z.number(),
        hasCategoryMultiplier: z.boolean(),
        locationSurcharge: z.number(),
        hasLocationSurcharge: z.boolean(),
        courierDiscountPercentage: z.number(),
        hasCourierDiscount: z.boolean(),
    }),
});

// This prompt's only job is to generate the human-friendly summary text.
const analysisPrompt = ai.definePrompt({
  name: 'insuranceAnalysisPrompt',
  input: { schema: analysisPromptInputSchema },
  output: { schema: z.object({ riskAnalysis: z.string() }) },
  prompt: `You are an expert AI insurance underwriter. Your task is to write a brief, user-friendly explanation (1-2 sentences) for a calculated insurance premium. Be reassuring and professional.

**Data used for the quote:**
- Declared Value: €{{{deliveryValue}}}
- Package Category: {{{packageCategory}}}
- Route: from {{{pickupAddress}}} to {{{destinationAddress}}}

**Calculated Factors:**
- **Final Premium:** €{{{premium}}}
- **Factors considered:**
  {{#if factors.hasCategoryMultiplier}}
  - A risk multiplier of {{factors.categoryMultiplier}}x was applied for the '{{{packageCategory}}}' category.
  {{/if}}
  {{#if factors.hasLocationSurcharge}}
  - A surcharge of €{{factors.locationSurcharge}} was added because the route involves a higher-risk area.
  {{/if}}
  {{#if factors.hasCourierDiscount}}
  - A discount of {{factors.courierDiscountPercentage}}% was applied due to the courier's excellent reliability score.
  {{/if}}

Now, write the 'riskAnalysis' field based on the factors above.
Example 1 (standard): "The premium reflects the standard risk for this route and item category. A discount was applied due to the courier's excellent record."
Example 2 (high risk): "This premium includes a surcharge for insuring a high-value electronics item and for a route that passes through a higher-risk area."
`,
});


const getInsuranceQuoteFlow = ai.defineFlow(
  {
    name: 'getInsuranceQuoteFlow',
    inputSchema: GetInsuranceQuoteInputSchema,
    outputSchema: GetInsuranceQuoteOutputSchema,
  },
  async (input) => {
    // --- Perform all calculations in code for reliability ---
    const { deliveryValue, packageCategory, pickupAddress, destinationAddress, courierTrustScore } = input;

    // 1. Base Premium
    const basePremium = deliveryValue * 0.015;

    // 2. Category Risk Multiplier
    const categoryMultipliers: { [key: string]: number } = {
        'Jewelry': 1.8, 'Luxury Goods': 1.8, 'Art': 1.8,
        'Electronics': 1.4, 'Laptops': 1.4, 'Phones': 1.4,
        'Documents': 1.0, 'Clothing': 1.0, 'Books': 1.0,
        'Other': 1.1,
    };
    const categoryMultiplier = categoryMultipliers[packageCategory] || 1.1;
    let calculatedPremium = basePremium * categoryMultiplier;

    // 3. Location Risk Surcharge
    const highRiskLocations = ['Gare du Nord', 'Barbès', 'Stalingrad'];
    let locationSurcharge = 0;
    const isHighRiskLocation = highRiskLocations.some(loc => 
        pickupAddress.includes(loc) || destinationAddress.includes(loc)
    );
    if (isHighRiskLocation) {
        locationSurcharge = 3.00;
        calculatedPremium += locationSurcharge;
    }

    // 4. Courier Trust Discount
    let courierDiscountPercentage = 0;
    if (courierTrustScore >= 95) courierDiscountPercentage = 15;
    else if (courierTrustScore >= 85) courierDiscountPercentage = 10;
    else if (courierTrustScore >= 75) courierDiscountPercentage = 5;
    
    if (courierDiscountPercentage > 0) {
        calculatedPremium *= (1 - courierDiscountPercentage / 100);
    }
    
    const finalPremium = Math.round(calculatedPremium * 100) / 100;

    // 5. Determine high risk flag
    const isHighRiskCategory = categoryMultiplier > 1.4;
    const isHighRisk = isHighRiskCategory || isHighRiskLocation;
    
    // --- Use AI only for the natural language analysis ---
    const analysisInput = {
        ...input,
        premium: finalPremium,
        factors: {
            categoryMultiplier,
            hasCategoryMultiplier: categoryMultiplier > 1,
            locationSurcharge,
            hasLocationSurcharge: locationSurcharge > 0,
            courierDiscountPercentage,
            hasCourierDiscount: courierDiscountPercentage > 0,
        }
    };
    
    const { output } = await analysisPrompt(analysisInput);
    if (!output) {
        throw new Error('The AI model failed to provide a risk analysis.');
    }
    
    // --- Construct final output ---
    return {
        isHighRisk,
        premium: finalPremium,
        riskAnalysis: output.riskAnalysis,
        coverageAmount: deliveryValue,
    };
  }
);
