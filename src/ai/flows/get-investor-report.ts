
'use server';
/**
 * @fileOverview An AI flow to generate an investor-facing summary of business metrics.
 *
 * - getInvestorReport - Analyzes key metrics and generates a narrative.
 * - GetInvestorReportInput - Input for the flow.
 * - GetInvestorReportOutput - Output for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserGrowthDataPointSchema = z.object({
  month: z.string(),
  users: z.number(),
});

const GetInvestorReportInputSchema = z.object({
  userGrowth: z.array(UserGrowthDataPointSchema).describe("A series of data points showing user growth over several months."),
  cac: z.number().describe("Customer Acquisition Cost in Euros."),
  ltv: z.number().describe("Customer Lifetime Value in Euros."),
  viralCoefficient: z.number().describe("The viral coefficient, representing how many new users each existing user brings."),
  monthlyChurn: z.number().describe("The monthly user churn rate as a percentage."),
});
export type GetInvestorReportInput = z.infer<typeof GetInvestorReportInputSchema>;

const GetInvestorReportOutputSchema = z.object({
  summary: z.string().describe("A concise, investor-friendly summary (2-3 sentences) of the company's current growth trajectory and financial health based on all provided metrics."),
  keyInsight: z.string().describe("A single, powerful insight or talking point that an investor should take away from this data (e.g., 'The LTV to CAC ratio is exceptionally strong, indicating profitable growth.')"),
});
export type GetInvestorReportOutput = z.infer<typeof GetInvestorReportOutputSchema>;

export async function getInvestorReport(input: GetInvestorReportInput): Promise<GetInvestorReportOutput> {
  return getInvestorReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'investorReportPrompt',
  input: {schema: GetInvestorReportInputSchema},
  output: {schema: GetInvestorReportOutputSchema},
  prompt: `You are a Chief Financial Officer (CFO) AI for a tech startup called Dunlivrer.
Your task is to analyze the latest business metrics and generate a concise, compelling narrative for an investor presentation.
You must be optimistic but grounded in the data.

**Key Metrics for Analysis:**

- **User Growth:**
  {{#each userGrowth}}
  - {{this.month}}: {{this.users}} users
  {{/each}}
  (Analyze the trend and velocity of growth.)

- **Profitability Metrics:**
  - Customer Acquisition Cost (CAC): €{{{cac}}}
  - Lifetime Value (LTV): €{{{ltv}}}
  (Calculate and comment on the LTV-to-CAC ratio.)

- **Growth & Retention:**
  - Viral Coefficient: {{{viralCoefficient}}}
  - Monthly Churn Rate: {{{monthlyChurn}}}%
  (Assess the organic growth potential and user stickiness.)

**Your Tasks:**

1.  **Generate a Summary:** Write a 2-3 sentence executive summary. It should highlight the strong user growth, the healthy LTV/CAC ratio, and the overall positive outlook. Frame any weaknesses (like churn) as areas of focus.
2.  **Extract a Key Insight:** Identify the single most impressive metric or relationship in this data (e.g., "The LTV to CAC ratio is...") and formulate it as a punchy, memorable sentence. This is the key takeaway for the investor.

Now, perform the analysis and return the results in the required JSON format.
`,
});

const getInvestorReportFlow = ai.defineFlow(
  {
    name: 'getInvestorReportFlow',
    inputSchema: GetInvestorReportInputSchema,
    outputSchema: GetInvestorReportOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate an investor report.');
    }
    return output;
  }
);
