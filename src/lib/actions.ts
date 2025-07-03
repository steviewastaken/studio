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
    const result = await answerSupportQuestionFlow(data);
    // We wrap the raw string result in the object format the UI expects.
    return { success: true, data: { answer: result } };
  } catch (error: any) {
    console.error("handleSupportQuestion Error:", error.message);
    // Pass the specific error message to the client for better feedback.
    return { success: false, error: error.message || 'I am sorry, I am unable to answer that question at the moment.' };
  }
}

export async function handleFindDriver(data: FindDriverInput) {
  try {
    const result = await findDriverFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleFindDriver Error:", error.message);
    return { success: false, error: error.message || 'Failed to find a driver. Please try again later.' };
  }
}

export async function handleGetQuote(data: GetQuoteInput) {
  try {
    const result = await getQuoteFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleGetQuote Error:", error.message);
    // Pass the specific error message to the client for better feedback.
    return { success: false, error: error.message || 'An unknown error occurred while generating the quote.' };
  }
}
