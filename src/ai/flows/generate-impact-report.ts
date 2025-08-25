'use server';

/**
 * @fileOverview Generates a personalized impact report for a citizen based on their e-waste contributions.
 *
 * - generateImpactReport - A function that generates the impact report.
 * - GenerateImpactReportInput - The input type for the generateImpactReport function.
 * - GenerateImpactReportOutput - The return type for the generateImpactReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImpactReportInputSchema = z.object({
  contributionSummary: z
    .string()
    .describe(
      "A summary of the user's e-waste contributions. e.g., 'User has contributed: 2 Laptops, 5 Mobiles, 10 Batteries.'"
    ),
});
export type GenerateImpactReportInput = z.infer<typeof GenerateImpactReportInputSchema>;

const GenerateImpactReportOutputSchema = z.object({
  report: z.string().describe('A short, positive, and personalized impact summary.'),
});
export type GenerateImpactReportOutput = z.infer<typeof GenerateImpactReportOutputSchema>;

export async function generateImpactReport(
  input: GenerateImpactReportInput
): Promise<GenerateImpactReportOutput> {
  return generateImpactReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImpactReportPrompt',
  input: {schema: GenerateImpactReportInputSchema},
  output: {schema: GenerateImpactReportOutputSchema},
  prompt: `You are an encouraging environmental assistant. Based on the following e-waste contribution data, write a short, positive, and personalized impact summary (2-3 sentences) for the user. Use a friendly tone and include a real-world analogy to make the impact tangible. For example, 'By recycling 2 laptops, you've saved enough energy to power a home for a week!'

  Data: {{{contributionSummary}}}`,
});

const generateImpactReportFlow = ai.defineFlow(
  {
    name: 'generateImpactReportFlow',
    inputSchema: GenerateImpactReportInputSchema,
    outputSchema: GenerateImpactReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
