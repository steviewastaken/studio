'use server';

import {
  answerSupportQuestion as answerSupportQuestionFlow,
  type AnswerSupportQuestionInput,
} from '@/ai/flows/answer-support-questions';
import {
  detectFraud as detectFraudFlow,
  type DetectFraudInput,
} from '@/ai/flows/detect-fraud';
import {
  findDriver as findDriverFlow,
  type FindDriverInput,
} from '@/ai/flows/find-driver';
import {
  getQuote as getQuoteFlow,
  type GetQuoteInput,
} from '@/ai/flows/get-quote';
import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function handleSupportQuestion(data: AnswerSupportQuestionInput) {
  try {
    const result = await answerSupportQuestionFlow(data);
    // The flow now returns the { answer: "..." } object directly.
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleSupportQuestion Error:", error.message);
    // Pass the specific error message to the client for better feedback.
    return { success: false, error: error.message || 'I am sorry, I am unable to answer that question at the moment.' };
  }
}

export async function handleDetectFraud(data: DetectFraudInput) {
  try {
    const result = await detectFraudFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleDetectFraud Error:", error.message);
    // In a real app, you might want to fail open (allow the transaction) or fail closed (block it) depending on risk tolerance.
    // For this prototype, we'll let the user know the check failed.
    return { success: false, error: error.message || 'Fraud check could not be completed. Please try again.' };
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

// --- Address Book Actions ---

export async function getSavedAddresses() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('label');

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addSavedAddress(address: string, label: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('user_addresses')
        .insert({ user_id: user.id, address, label });

    if (error) {
        if (error.code === '23505') { // unique_violation
            return { success: false, error: `You already have an address with the label "${label}".` };
        }
        return { success: false, error: error.message };
    }
    revalidatePath('/');
    return { success: true, data };
}
