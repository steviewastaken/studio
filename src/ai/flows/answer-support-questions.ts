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
  prompt: `You are a support chatbot for a delivery service called Dunlivrer. Answer the user's question.
{{#if deliveryDetails}}
Use the following delivery details to answer the question.
Delivery Details: {{{deliveryDetails}}}
{{else}}
The user does not have an active delivery. Answer their general questions about the service. If they ask about a specific delivery, inform them they need to schedule one first.
{{/if}}

Question: {{{question}}}`,
});

const answerSupportQuestionFlow = ai.defineFlow(
  {
    name: 'answerSupportQuestionFlow',
    inputSchema: AnswerSupportQuestionInputSchema,
    outputSchema: AnswerSupportQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
