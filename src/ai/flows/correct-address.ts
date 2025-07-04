'use server';
/**
 * @fileOverview An AI flow to correct and standardize user-entered addresses.
 *
 * - correctAddress - A function that takes a potentially messy address and returns a corrected version.
 * - CorrectAddressInput - The input type for the correctAddress function.
 * - CorrectAddressOutput - The return type for the correctAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectAddressInputSchema = z.object({
  address: z.string().describe('A user-entered delivery address, potentially with errors or typos.'),
});
export type CorrectAddressInput = z.infer<typeof CorrectAddressInputSchema>;

const CorrectAddressOutputSchema = z.object({
  correctedAddress: z.string().describe('The corrected, standardized, and complete address. If no correction was needed, this will be the same as the input address.'),
  reason: z.string().describe('A brief explanation of what was corrected (e.g., "Corrected postal code") or a confirmation that the address was already valid.'),
  wasCorrected: z.boolean().describe('A boolean flag indicating if the address was changed.'),
});
export type CorrectAddressOutput = z.infer<typeof CorrectAddressOutputSchema>;

export async function correctAddress(input: CorrectAddressInput): Promise<CorrectAddressOutput> {
  return correctAddressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctAddressPrompt',
  input: {schema: CorrectAddressInputSchema},
  output: {schema: CorrectAddressOutputSchema},
  prompt: `You are an expert logistics AI for Dunlivrer, specializing in French postal addresses.
Your task is to correct, complete, and standardize a user-entered address.
You must use your knowledge of French address formats, postal codes, and common abbreviations.

**Address to analyze:**
"{{{address}}}"

**Rules for Correction:**
1.  **Analyze the Input:** Look for common errors:
    *   Typos (e.g., "Champs Elysee" -> "Champs-Élysées").
    *   Incorrect postal codes for a given city or street.
    *   Incomplete information (e.g., missing "Rue", "Avenue", "Boulevard").
    *   Abbreviated street types (e.g., "Av." -> "Avenue").
    *   Messy formatting.
2.  **Standardize the Output:** The corrected address should follow the standard French format:
    *   [Street Number] [Street Type] [Street Name], [Postal Code] [City], [Country]
    *   Example: \`123 Boulevard Saint-Germain, 75006 Paris, France\`
3.  **Determine if Correction Occurred:**
    *   If you made any change, set \`wasCorrected\` to \`true\`.
    *   If the input address was already perfect, set \`wasCorrected\` to \`false\`.
4.  **Provide a Reason:**
    *   If corrected, briefly state what you fixed. Examples: "Corrected postal code and standardized street name.", "Completed address with street type and country."
    *   If not corrected, state: "Address appears to be valid."
5.  **High Confidence Only:** Only make corrections you are highly confident about. If the address is too ambiguous or nonsensical, return the original address and set \`wasCorrected\` to \`false\` with the reason "Could not confidently correct the address."

Now, process the address and provide the output in the required JSON format.`,
});

const correctAddressFlow = ai.defineFlow(
  {
    name: 'correctAddressFlow',
    inputSchema: CorrectAddressInputSchema,
    outputSchema: CorrectAddressOutputSchema,
  },
  async (input) => {
    // Sanitize input to prevent empty calls
    if (!input.address || input.address.trim().length < 5) {
      return {
          correctedAddress: input.address,
          reason: "Input too short to analyze.",
          wasCorrected: false,
      };
    }

    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide an address correction.');
    }
    return output;
  }
);
