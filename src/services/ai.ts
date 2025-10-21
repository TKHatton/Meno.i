// after dotenv/config import
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateAIResponse(message: string, history: {role:'user'|'assistant'; content: string}[], isHighRisk: boolean) {
  if (!openai) {
    // call your generateMockResponse(...) here
    return generateMockResponse(message, isHighRisk);
  }
  // ...real OpenAI call...
}
