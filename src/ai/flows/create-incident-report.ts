'use server';
/**
 * @fileOverview An AI flow to convert a courier's natural language description of an incident into a structured report.
 *
 * - createIncidentReport - Analyzes a description and creates a structured report.
 * - CreateIncidentReportInput - Input for the flow.
 * - CreateIncidentReportOutput - Output for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateIncidentReportInputSchema = z.object({
  description: z.string().describe("The courier's natural language description of the incident."),
  photoDataUri: z.string().optional().describe("A photo related to the incident, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type CreateIncidentReportInput = z.infer<typeof CreateIncidentReportInputSchema>;

const CreateIncidentReportOutputSchema = z.object({
  incidentType: z.enum(['Customer No-Show', 'Vehicle Issue', 'Package Damaged', 'Incorrect Address', 'Safety Concern', 'Other']).describe("Categorize the incident into one of the provided types."),
  summary: z.string().describe("A concise, one-sentence summary of the incident."),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']).describe("Assess the urgency level of the incident."),
  suggestedAction: z.string().describe("Recommend a next step for the support team (e.g., 'Contact customer', 'Issue refund', 'No action needed')."),
  entities: z.object({
      customerName: z.string().optional().describe("Extract the customer's name if mentioned."),
      trackingId: z.string().optional().describe("Extract the tracking ID if mentioned."),
      vehicleDetails: z.string().optional().describe("Extract vehicle details (e.g., 'flat tire') if mentioned."),
  }).describe("Key entities extracted from the description."),
});
export type CreateIncidentReportOutput = z.infer<typeof CreateIncidentReportOutputSchema>;

export async function createIncidentReport(input: CreateIncidentReportInput): Promise<CreateIncidentReportOutput> {
  return createIncidentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createIncidentReportPrompt',
  input: {schema: CreateIncidentReportInputSchema},
  output: {schema: CreateIncidentReportOutputSchema},
  prompt: `You are an AI assistant for Dunlivrer's support operations. Your task is to take a courier's raw, spoken, or typed incident description and transform it into a structured, actionable report.

**Rules:**
1.  **Categorize:** Read the description and classify it into one of the following types: 'Customer No-Show', 'Vehicle Issue', 'Package Damaged', 'Incorrect Address', 'Safety Concern', or 'Other'.
2.  **Use Photo Evidence:** If a photo is provided, use it as a key piece of evidence. If the photo clearly shows a damaged package, you MUST classify the incident as 'Package Damaged', regardless of the text description.
3.  **Summarize:** Write a very brief, one-sentence summary of the core issue based on both text and photo.
4.  **Assess Urgency:** Determine the urgency. 'Critical' for safety issues, 'High' for delivery-blocking issues like major damage, 'Medium' for delays, 'Low' for minor issues.
5.  **Suggest Action:** Recommend a clear, simple next step for the support team.
6.  **Extract Entities:** Pull out any specific names, tracking IDs, or vehicle details mentioned.

**Courier's Description:**
"{{{description}}}"

{{#if photoDataUri}}
**Photo Evidence:**
{{media url=photoDataUri}}
{{/if}}

Now, process the description and photo (if available) and generate the structured JSON output.
`,
});

const createIncidentReportFlow = ai.defineFlow(
  {
    name: 'createIncidentReportFlow',
    inputSchema: CreateIncidentReportInputSchema,
    outputSchema: CreateIncidentReportOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate an incident report.');
    }
    return output;
  }
);
