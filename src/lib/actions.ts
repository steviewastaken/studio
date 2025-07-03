'use server';

import {
  answerSupportQuestion as answerSupportQuestionFlow,
  type AnswerSupportQuestionInput,
} from '@/ai/flows/answer-support-questions';
import {
  findDriver as findDriverFlow,
  type FindDriverInput,
} from '@/ai/flows/find-driver';
import {
  getQuote as getQuoteFlow,
  type GetQuoteInput,
} from '@/ai/flows/get-quote';

export async function handleSupportQuestion(data: AnswerSupportQuestionInput) {
  try {
    // The flow now returns a raw string.
    const result = await answerSupportQuestionFlow(data);
    // We wrap it in the object format the UI expects.
    return { success: true, data: { answer: result } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'I am sorry, I am unable to answer that question at the moment.' };
  }
}

export async function handleFindDriver(data: FindDriverInput) {
  try {
    const result = await findDriverFlow(data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to find a driver. Please try again later.' };
  }
}

export async function handleGetQuote(data: GetQuoteInput) {
  try {
    const result = await getQuoteFlow(data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate a quote. Please check addresses and try again.' };
  }
}
