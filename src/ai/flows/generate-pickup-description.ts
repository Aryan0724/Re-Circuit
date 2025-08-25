
'use server';

/**
 * @fileOverview Generates a description for a pickup request based on an image using the Gemini API.
 *
 * - generatePickupDescription - A function that generates the pickup description.
 * - GeneratePickupDescriptionInput - The input type for the generatePickupDescription function.
 * - GeneratePickupDescriptionOutput - The return type for the generatePickupDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePickupDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the e-waste item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePickupDescriptionInput = z.infer<typeof GeneratePickupDescriptionInputSchema>;

const GeneratePickupDescriptionOutputSchema = z.object({
  description: z.string().describe('A description of the e-waste item in the photo.'),
});
export type GeneratePickupDescriptionOutput = z.infer<typeof GeneratePickupDescriptionOutputSchema>;

export async function generatePickupDescription(
  input: GeneratePickupDescriptionInput
): Promise<GeneratePickupDescriptionOutput> {
  return generatePickupDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePickupDescriptionPrompt',
  input: {schema: GeneratePickupDescriptionInputSchema},
  output: {schema: GeneratePickupDescriptionOutputSchema},
  prompt: `You are an expert in identifying e-waste items from images. Please provide a detailed description of the e-waste item in the image.
  Photo: {{media url=photoDataUri}}`,
});

const generatePickupDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePickupDescriptionFlow',
    inputSchema: GeneratePickupDescriptionInputSchema,
    outputSchema: GeneratePickupDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
