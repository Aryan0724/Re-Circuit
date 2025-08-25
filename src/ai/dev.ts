import { config } from 'dotenv';
config();

import '@/ai/flows/generate-pickup-description.ts';
import '@/ai/flows/plan-recycler-route.ts';
import '@/ai/flows/generate-impact-report.ts';
