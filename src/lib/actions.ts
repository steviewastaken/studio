
'use server';

import {
  answerSupportQuestion as answerSupportQuestionFlow,
  type AnswerSupportQuestionInput,
  type AnswerSupportQuestionOutput,
} from '@/ai/flows/answer-support-questions';
import {
  detectFraud as detectFraudFlow,
  type DetectFraudInput,
  type DetectFraudOutput,
} from '@/ai/flows/detect-fraud';
import {
  findDriver as findDriverFlow,
  type FindDriverInput,
  type FindDriverOutput,
} from '@/ai/flows/find-driver';
import {
  getQuote as getQuoteFlow,
  type GetQuoteInput,
  type GetQuoteOutput,
} from '@/ai/flows/get-quote';
import {
  rerouteDelivery as rerouteDeliveryFlow,
  type RerouteDeliveryInput,
  type RerouteDeliveryOutput,
} from '@/ai/flows/reroute-delivery';
import {
  detectEmotion as detectEmotionFlow,
  type DetectEmotionInput,
  type DetectEmotionOutput,
} from '@/ai/flows/detect-emotion';
import {
  getDriverPerformanceReport as getDriverPerformanceReportFlow,
  type GetDriverPerformanceReportInput,
  type GetDriverPerformanceReportOutput,
} from '@/ai/flows/get-driver-performance-report';
import {
  correctAddress as correctAddressFlow,
  type CorrectAddressInput,
  type CorrectAddressOutput,
} from '@/ai/flows/correct-address';
import {
  createIncidentReport as createIncidentReportFlow,
  type CreateIncidentReportInput,
  type CreateIncidentReportOutput,
} from '@/ai/flows/create-incident-report';
import {
  textToSpeech as textToSpeechFlow,
  type TextToSpeechInput,
  type TextToSpeechOutput,
} from '@/ai/flows/text-to-speech';
import {
  getDemandForecast as getDemandForecastFlow,
  type GetDemandForecastInput,
  type GetDemandForecastOutput,
} from '@/ai/flows/get-demand-forecast';
import {
  queryBusinessData as queryBusinessDataFlow,
  type QueryBusinessDataInput,
  type QueryBusinessDataOutput,
} from '@/ai/flows/query-business-data';
import {
  getInvestorReport as getInvestorReportFlow,
  type GetInvestorReportInput,
  type GetInvestorReportOutput,
} from '@/ai/flows/get-investor-report';
import {
  getInsuranceQuote as getInsuranceQuoteFlow,
  type GetInsuranceQuoteInput,
  type GetInsuranceQuoteOutput,
} from '@/ai/flows/get-insurance-quote';
import {
    processBulkDelivery as processBulkDeliveryFlow,
    type ProcessBulkDeliveryInput,
    type ProcessBulkDeliveryOutput,
} from '@/ai/flows/process-bulk-delivery';

async function handleFlow<I, O>(
  flow: (input: I) => Promise<O>,
  input: I,
  flowName: string,
  errorMessage: string
): Promise<{ success: true; data: O } | { success: false; error: string }> {
  try {
    const result = await flow(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Error in ${flowName}:`, error.message);
    return { success: false, error: error.message || errorMessage };
  }
}

export async function handleSupportQuestion(data: AnswerSupportQuestionInput) {
  return handleFlow(answerSupportQuestionFlow, data, 'handleSupportQuestion', 'I am sorry, I am unable to answer that question at the moment.');
}

export async function handleDetectFraud(data: DetectFraudInput) {
  return handleFlow(detectFraudFlow, data, 'handleDetectFraud', 'Fraud check could not be completed. Please try again.');
}

export async function handleFindDriver(data: FindDriverInput) {
  return handleFlow(findDriverFlow, data, 'handleFindDriver', 'Failed to find a driver. Please try again later.');
}

export async function handleGetQuote(data: GetQuoteInput) {
  return handleFlow(getQuoteFlow, data, 'handleGetQuote', 'An unknown error occurred while generating the quote.');
}

export async function handleRerouteDelivery(data: RerouteDeliveryInput) {
  return handleFlow(rerouteDeliveryFlow, data, 'handleRerouteDelivery', 'Failed to check rerouting feasibility. Please try again later.');
}

export async function handleDetectEmotion(data: DetectEmotionInput) {
  return handleFlow(detectEmotionFlow, data, 'handleDetectEmotion', 'Failed to analyze emotion. Please try again.');
}

export async function handleGetDriverPerformanceReport(data: GetDriverPerformanceReportInput) {
  return handleFlow(getDriverPerformanceReportFlow, data, 'handleGetDriverPerformanceReport', 'Failed to generate performance report.');
}

export async function handleCorrectAddress(data: CorrectAddressInput) {
  return handleFlow(correctAddressFlow, data, 'handleCorrectAddress', 'Failed to verify the address.');
}

export async function handleCreateIncidentReport(data: CreateIncidentReportInput) {
  return handleFlow(createIncidentReportFlow, data, 'handleCreateIncidentReport', 'Failed to generate incident report.');
}

export async function handleTextToSpeech(data: TextToSpeechInput) {
  return handleFlow(textToSpeechFlow, data, 'handleTextToSpeech', 'Failed to generate audio.');
}

export async function handleGetDemandForecast(data: GetDemandForecastInput) {
  return handleFlow(getDemandForecastFlow, data, 'handleGetDemandForecast', 'Failed to generate demand forecast.');
}

export async function handleQueryBusinessData(data: QueryBusinessDataInput) {
  return handleFlow(queryBusinessDataFlow, data, 'handleQueryBusinessData', 'Failed to query business data.');
}

export async function handleGetInvestorReport(data: GetInvestorReportInput) {
  return handleFlow(getInvestorReportFlow, data, 'handleGetInvestorReport', 'Failed to generate investor report.');
}

export async function handleGetInsuranceQuote(data: GetInsuranceQuoteInput) {
  return handleFlow(getInsuranceQuoteFlow, data, 'handleGetInsuranceQuote', 'Failed to generate insurance quote.');
}

export async function handleProcessBulkDelivery(data: ProcessBulkDeliveryInput) {
    return handleFlow(processBulkDeliveryFlow, data, 'handleProcessBulkDelivery', 'Failed to process bulk delivery file.');
}
