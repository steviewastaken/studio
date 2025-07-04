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
import {
  rerouteDelivery as rerouteDeliveryFlow,
  type RerouteDeliveryInput,
} from '@/ai/flows/reroute-delivery';
import {
  detectEmotion as detectEmotionFlow,
  type DetectEmotionInput,
} from '@/ai/flows/detect-emotion';
import {
  getDriverPerformanceReport as getDriverPerformanceReportFlow,
  type GetDriverPerformanceReportInput,
} from '@/ai/flows/get-driver-performance-report';

export async function handleSupportQuestion(data: AnswerSupportQuestionInput) {
  try {
    const result = await answerSupportQuestionFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleSupportQuestion Error:", error.message);
    return { success: false, error: error.message || 'I am sorry, I am unable to answer that question at the moment.' };
  }
}

export async function handleDetectFraud(data: DetectFraudInput) {
  try {
    const result = await detectFraudFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleDetectFraud Error:", error.message);
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
  } catch (error: any)
    console.error("handleGetQuote Error:", error.message);
    return { success: false, error: error.message || 'An unknown error occurred while generating the quote.' };
  }
}

export async function handleRerouteDelivery(data: RerouteDeliveryInput) {
  try {
    const result = await rerouteDeliveryFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleRerouteDelivery Error:", error.message);
    return { success: false, error: error.message || 'Failed to check rerouting feasibility. Please try again later.' };
  }
}

export async function handleDetectEmotion(data: DetectEmotionInput) {
  try {
    const result = await detectEmotionFlow(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("handleDetectEmotion Error:", error.message);
    return { success: false, error: error.message || 'Failed to analyze emotion. Please try again.' };
  }
}

export async function handleGetDriverPerformanceReport(data: GetDriverPerformanceReportInput) {
    try {
        const result = await getDriverPerformanceReportFlow(data);
        return { success: true, data: result };
    } catch (error: any) {
        console.error("handleGetDriverPerformanceReport Error:", error.message);
        return { success: false, error: error.message || 'Failed to generate performance report.' };
    }
}
