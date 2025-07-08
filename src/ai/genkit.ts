
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins = [];

if (process.env.GOOGLE_SERVER_API_KEY) {
    plugins.push(googleAI({apiKey: process.env.GOOGLE_SERVER_API_KEY}));
} else {
    console.warn("GOOGLE_SERVER_API_KEY not found. Genkit AI features will be disabled. This is expected for initial deployment without secrets.");
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.0-flash',
});
