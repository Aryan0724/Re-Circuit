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
 latestBadgeName: z
 .string()
 .describe("The name of the user's most recently earned badge. e.g., 'Laptop Recycler'"),
 communityCo2Total: z
 .number()
 .describe('The total community CO₂ reduction in kg.'),
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
  prompt: `You are an encouraging environmental assistant. A user has just generated their impact report. Their contribution data is: {{{contributionSummary}}}. They recently earned the '{{{latestBadgeName}}}' badge. Their contribution is part of a larger community effort that has collectively saved {{{communityCo2Total}}} kg of CO₂. Write a short, celebratory summary (2-3 sentences). Congratulate them on their new badge and mention how their personal effort contributes to the impressive community total. Use a friendly, inspiring tone.`,
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
