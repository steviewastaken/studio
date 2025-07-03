'use server';
/**
 * @fileOverview An AI-powered fraud and abuse detection engine.
 *
 * - detectFraud - A function that analyzes delivery details to assess fraud risk.
 * - DetectFraudInput - The input type for the detectFraud function.
 * - DetectFraudOutput - The return type for the detectFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefundSchema = z.object({
  refundId: z.string(),
  reason: z.string(),
  amount: z.number(),
  date: z.string(),
});

const DetectFraudInputSchema = z.object({
  userId: z.string().describe("The user's unique identifier."),
  userAccountAgeDays: z.number().describe("The age of the user's account in days."),
  userTotalDeliveries: z.number().describe("The total number of deliveries this user has completed."),
  userRefundHistory: z.array(RefundSchema).describe("The user's recent refund history."),
  deliveryValue: z.number().describe("The declared value of the package being delivered in Euros."),
  pickupAddress: z.string().describe("The pickup address for the delivery."),
  destinationAddress: z.string().describe("The final destination address for the delivery."),
});
export type DetectFraudInput = z.infer<typeof DetectFraudInputSchema>;

const DetectFraudOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe("A numerical risk score from 0 (no risk) to 100 (high risk)."),
  isSuspicious: z.boolean().describe("A boolean flag indicating if the transaction is deemed suspicious."),
  reason: z.string().describe("A brief explanation for why the transaction was flagged as suspicious."),
  recommendedAction: z.enum(["ALLOW", "MANUAL_REVIEW", "BLOCK"]).describe("The recommended action to take."),
});
export type DetectFraudOutput = z.infer<typeof DetectFraudOutputSchema>;

export async function detectFraud(input: DetectFraudInput): Promise<DetectFraudOutput> {
  return detectFraudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFraudPrompt',
  input: {schema: DetectFraudInputSchema},
  output: {schema: DetectFraudOutputSchema},
  prompt: `You are an advanced AI Fraud & Abuse Detection Engine for a delivery service called Dunlivrer.
Your primary function is to analyze transaction data and user history to identify potentially fraudulent activities.
Based on the provided data, calculate a risk score from 0 to 100, determine if the transaction is suspicious, provide a reason, and recommend an action.

Here are the rules and heuristics you must follow:

1.  **New Account Risk (Fake Accounts):**
    *   Accounts less than 7 days old with a delivery value over €100 are highly suspicious. (Risk Score: +40)
    *   Accounts less than 30 days old with 0 completed deliveries are moderately suspicious, especially for high-value items. (Risk Score: +20)

2.  **Refund Abuse:**
    *   If a user has more than 2 refunds in their recent history, it's a major red flag. (Risk Score: +50)
    *   If a user has 1 refund for a high-value item (€100+) in their history, it's moderately suspicious. (Risk Score: +25)
    *   A high ratio of refunds to total deliveries (e.g., > 30% refund rate) is highly suspicious. (Risk Score: +60)

3.  **Unusual Delivery Patterns (Courier Avoidance Simulation):**
    *   (This is a placeholder for more complex analysis) For now, any delivery with a value over €500 should be flagged for manual review regardless of other factors, as a precaution. (Risk Score: +30, Action: MANUAL_REVIEW)

4.  **Risk Score & Action Mapping:**
    *   **0-20 (Low Risk):** Action should be "ALLOW".
    *   **21-60 (Medium Risk):** Action should be "MANUAL_REVIEW".
    *   **61-100 (High Risk):** Action should be "BLOCK".

**Context:**
- Today's Date: ${new Date().toISOString()}

**Input Data:**
- User ID: {{{userId}}}
- Account Age: {{{userAccountAgeDays}}} days
- Total Past Deliveries: {{{userTotalDeliveries}}}
- Delivery Value: €{{{deliveryValue}}}
- Pickup Address: {{{pickupAddress}}}
- Destination Address: {{{destinationAddress}}}

**User Refund History:**
{{#if userRefundHistory}}
  {{#each userRefundHistory}}
  - Refund ID: {{this.refundId}}, Amount: €{{this.amount}}, Reason: "{{this.reason}}", Date: {{this.date}}
  {{/each}}
{{else}}
  No refund history.
{{/if}}

Analyze the data based on the rules. Calculate the final risk score by summing up the scores from each triggered rule. Set the 'isSuspicious' flag if the score is greater than 20. Provide a concise 'reason' that summarizes the key risk factors. Finally, determine the 'recommendedAction' based on the risk score mapping.
Produce the output in the required JSON format.`,
});

const detectFraudFlow = ai.defineFlow(
  {
    name: 'detectFraudFlow',
    inputSchema: DetectFraudInputSchema,
    outputSchema: DetectFraudOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide a fraud assessment.');
    }
    return output;
  }
);
