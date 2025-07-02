'use server';

import {
  answerSupportQuestion as answerSupportQuestionFlow,
  type AnswerSupportQuestionInput,
} from '@/ai/flows/answer-support-questions';
import {
  estimateETA as estimateETAFlow,
  type EstimateETAInput,
} from '@/ai/flows/estimate-eta';
import {
  findDriver as findDriverFlow,
  type FindDriverInput,
} from '@/ai/flows/find-driver';

export async function handleETASubmission(data: EstimateETAInput) {
  try {
    const result = await estimateETAFlow(data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to estimate ETA. Please try again.' };
  }
}

export async function handleSupportQuestion(data: AnswerSupportQuestionInput) {
  try {
    const result = await answerSupportQuestionFlow(data);
    return { success: true, data: result };
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
