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
  prompt: `You are a support chatbot for a delivery service called Dunlivrer.
Your task is to answer the user's question based on the context provided.
You MUST provide your response as a valid JSON object that strictly adheres to the provided output schema.

CONTEXT:
{{#if deliveryDetails}}
- The user has an active delivery.
- Delivery Details: {{{deliveryDetails}}}
- Use these details to answer questions about their specific delivery.
{{else}}
- The user does not have an active delivery.
- Answer their general questions about the Dunlivrer service.
- If they ask about a specific delivery, politely inform them they need to schedule one first to get tracking information.
{{/if}}

USER'S QUESTION:
"{{{question}}}"

EXAMPLE RESPONSE:
For the question "What are your hours?", a valid response would be:
{
  "answer": "Our standard delivery hours are from 9 AM to 8 PM, Monday to Saturday. We also offer night delivery for an additional fee."
}

Now, provide a response for the user's question above.`,
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
