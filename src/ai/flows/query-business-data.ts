
'use server';
/**
 * @fileOverview An AI assistant for querying business intelligence data.
 * - queryBusinessData - Answers natural language questions about business metrics.
 * - QueryBusinessDataInput - The input type for the queryBusinessData function.
 * - QueryBusinessDataOutput - The return type for the queryBusinessData function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Mock database data
const MOCK_DATA = {
    deliveries: [
        { zone: 'Le Marais', status: 'completed', date: '2024-07-05' },
        { zone: 'Le Marais', status: 'failed', date: '2024-07-05' },
        { zone: 'Montmartre', status: 'completed', date: '2024-07-05' },
        { zone: 'Zone 13', status: 'completed', date: '2024-06-28' },
        { zone: 'Zone 13', status: 'refunded', date: '2024-06-28' },
    ],
    cancellations: {
        '2024-07-04': {
            spike: true,
            reason: "There was a sudden, short-lived metro strike on Line 8, causing a 40% spike in cancellations in the afternoon as couriers were unable to reach their destinations in the eastern districts. The issue resolved by evening.",
            details: { 'Metro strike': 15, 'Customer changed mind': 5, 'No courier available': 3 }
        }
    }
};

// Tool for getting delivery stats
const getDeliveryStats = ai.defineTool(
  {
    name: 'getDeliveryStats',
    description: 'Returns the number of deliveries based on status, zone, and date range.',
    inputSchema: z.object({
      status: z.enum(['completed', 'failed', 'pending', 'refunded']).describe('The delivery status to count.'),
      zone: z.string().optional().describe('The specific city zone to filter by.'),
      date: z.string().describe('The date to query in YYYY-MM-DD format.'),
    }),
    outputSchema: z.number().describe('The total count of matching deliveries.'),
  },
  async (input) => {
    return MOCK_DATA.deliveries.filter(d => 
        d.date === input.date && 
        d.status === input.status &&
        (!input.zone || d.zone === input.zone)
    ).length;
  }
);

// Tool for getting refund rate
const getRefundRate = ai.defineTool(
  {
    name: 'getRefundRate',
    description: 'Calculates the refund rate for a specific zone in a given week.',
    inputSchema: z.object({
      zone: z.string().describe('The city zone to check.'),
      // For simplicity, we ignore date range in mock and just use zone.
      weekOf: z.string().describe('The starting date of the week to analyze, in YYYY-MM-DD format.'),
    }),
    outputSchema: z.number().describe('The refund rate as a percentage (e.g., 15.5 for 15.5%).'),
  },
  async (input) => {
    if (input.zone === 'Zone 13') {
        // 1 refund out of 2 total deliveries for Zone 13 in the mock data
        return 50.0;
    }
    return 2.5; // Default mock rate
  }
);


// Tool for cancellation insights
const getCancellationInsights = ai.defineTool(
  {
    name: 'getCancellationInsights',
    description: 'Provides reasons for delivery cancellations on a specific day.',
    inputSchema: z.object({
        date: z.string().describe('The date to query in YYYY-MM-DD format.'),
    }),
    outputSchema: z.string().describe('A summary explaining the cancellation data for that day.'),
  },
  async (input) => {
      if (MOCK_DATA.cancellations[input.date as keyof typeof MOCK_DATA.cancellations]) {
          return MOCK_DATA.cancellations[input.date as keyof typeof MOCK_DATA.cancellations].reason;
      }
      return "No significant cancellation events were recorded on this day. The cancellation rate was nominal.";
  }
);


const QueryBusinessDataInputSchema = z.object({
    question: z.string().describe("The admin's natural language question about business data."),
});
export type QueryBusinessDataInput = z.infer<typeof QueryBusinessDataInputSchema>;

const QueryBusinessDataOutputSchema = z.object({
    answer: z.string().describe("A concise, natural language answer to the admin's question."),
});
export type QueryBusinessDataOutput = z.infer<typeof QueryBusinessDataOutputSchema>;


export async function queryBusinessData(input: QueryBusinessDataInput): Promise<QueryBusinessDataOutput> {
  return queryBusinessDataFlow(input);
}


const queryBusinessDataFlow = ai.defineFlow(
  {
    name: 'queryBusinessDataFlow',
    inputSchema: QueryBusinessDataInputSchema,
    outputSchema: QueryBusinessDataOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: input.question,
      system: `You are an expert business intelligence analyst for Dunlivrer.
Your name is "Copilot".
Your task is to answer an admin's questions about company data.
You MUST use the provided tools to find the information.
Do not make up answers. If the tools do not provide the information, state that you cannot answer the question.
Synthesize the information from the tools into a clear, concise, and friendly answer.
Always state the date or time period for which you are providing data.
Today's date is ${new Date().toISOString().split('T')[0]}.`,
      tools: [getDeliveryStats, getRefundRate, getCancellationInsights],
    });
    return { answer: output?.text ?? "I was unable to process that request." };
  }
);
