'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate an optimized route for a recycler's accepted pickup requests using the Gemini API.
 *
 * - planRecyclerRoute - A function that accepts an array of pickup locations and returns an optimized route.
 * - PlanRecyclerRouteInput - The input type for the planRecyclerRoute function.
 * - PlanRecyclerRouteOutput - The return type for the planRecyclerRoute function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlanRecyclerRouteInputSchema = z.object({
  locations: z
    .array(
      z.object({
        displayAddress: z.string().describe('The display address of the location.'),
        lat: z.number().describe('The latitude of the location.'),
        lon: z.number().describe('The longitude of the location.'),
      })
    )
    .describe('An array of pickup locations with address and coordinates.'),
});
export type PlanRecyclerRouteInput = z.infer<typeof PlanRecyclerRouteInputSchema>;

const PlanRecyclerRouteOutputSchema = z.object({
  route: z.string().describe('An optimized, step-by-step travel route.'),
});
export type PlanRecyclerRouteOutput = z.infer<typeof PlanRecyclerRouteOutputSchema>;

export async function planRecyclerRoute(input: PlanRecyclerRouteInput): Promise<PlanRecyclerRouteOutput> {
  return planRecyclerRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'planRecyclerRoutePrompt',
  input: {schema: PlanRecyclerRouteInputSchema},
  output: {schema: PlanRecyclerRouteOutputSchema},
  prompt: `You are an AI assistant helping a recycling company plan efficient pickup routes.

  Given the following list of pickup locations, generate an optimized, step-by-step travel route for the recycler.

  Locations:
  {{#each locations}}
  - Address: {{this.displayAddress}}, Latitude: {{this.lat}}, Longitude: {{this.lon}}
  {{/each}}
  `,
});

const planRecyclerRouteFlow = ai.defineFlow(
  {
    name: 'planRecyclerRouteFlow',
    inputSchema: PlanRecyclerRouteInputSchema,
    outputSchema: PlanRecyclerRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
