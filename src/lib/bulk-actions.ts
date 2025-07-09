
'use server';

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

export async function handleProcessBulkDelivery(data: ProcessBulkDeliveryInput) {
    return handleFlow(processBulkDeliveryFlow, data, 'handleProcessBulkDelivery', 'Failed to process bulk delivery file.');
}
