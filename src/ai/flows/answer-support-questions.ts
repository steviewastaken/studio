'use server';

/**
 * @fileOverview A support chatbot that answers questions about deliveries.
 *
 * - answerSupportQuestion - A function that answers a support question.
 * - AnswerSupportQuestionInput - The input type for the answerSupportQuestion function.
 * - AnswerSupportQuestionOutput - The return type for the answerSupportQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerSupportQuestionInputSchema = z.object({
  question: z.string().describe('The question to ask the support chatbot.'),
  deliveryDetails: z.string().optional().describe('The details of the delivery, if any.'),
});
export type AnswerSupportQuestionInput = z.infer<
  typeof AnswerSupportQuestionInputSchema
>;

const AnswerSupportQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerSupportQuestionOutput = z.infer<
  typeof AnswerSupportQuestionOutputSchema
>;

export async function answerSupportQuestion(
  input: AnswerSupportQuestionInput
): Promise<AnswerSupportQuestionOutput> {
  return answerSupportQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerSupportQuestionPrompt',
  input: {schema: AnswerSupportQuestionInputSchema},
  output: {schema: AnswerSupportQuestionOutputSchema},
  prompt: `You are a friendly, empathetic, and helpful support chatbot for a delivery service called Dunlivrer.
Your task is to answer the user's question conversationally based on the context and company policies provided.
You must provide your answer in the 'answer' field of the JSON output.

--- COMPANY POLICIES & FAQs ---

1.  **Order Tracking:**
    - Customers can track their orders in real-time on our website's '/tracking' page using their unique tracking ID.
    - If you have the user's delivery details, use them to provide a specific status update.
    - If you don't have delivery details, guide them to the tracking page and explain they need a tracking ID.

2.  **Courier Delays:**
    - Always be empathetic. Acknowledge that delays are frustrating.
    - Explain that delays can occasionally happen due to unforeseen circumstances like heavy traffic or bad weather.
    - For delays over 2 hours beyond the original estimated time of arrival (ETA), customers may be eligible for a refund of the delivery fee.

3.  **Refund Policy:**
    - Refunds for the delivery fee are offered for significant delays (over 2 hours past ETA) or if a package arrives damaged.
    - To process a refund for a damaged item, the customer must contact support through our official contact page and provide photos of the damage.
    - Express and Night delivery surcharges are non-refundable unless the specific delivery window was missed by a significant margin.

--- USER CONTEXT ---
{{#if deliveryDetails}}
- The user has an active delivery.
- Delivery Details: {{{deliveryDetails}}}
- Use these details to answer questions about their specific delivery, cross-referencing with the policies above.
{{else}}
- The user does not have an active delivery.
- Answer their general questions about the Dunlivrer service using the policies above.
- If they ask about a specific delivery, politely inform them they need to schedule one first to get tracking information and refer them to the '/tracking' page.
{{/if}}

--- USER'S QUESTION ---
"{{{question}}}"

Now, provide a helpful, conversational, and direct answer to the user's question in the required JSON format, based on all the information provided.`,
});

const answerSupportQuestionFlow = ai.defineFlow(
  {
    name: 'answerSupportQuestionFlow',
    inputSchema: AnswerSupportQuestionInputSchema,
    outputSchema: AnswerSupportQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('The AI model failed to provide a valid answer.');
    }
    return output;
  }
);
