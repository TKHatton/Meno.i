/**
 * AI service for generating empathetic responses
 * Integrates with OpenAI GPT-4 for real-time empathetic conversations
 */

import OpenAI from 'openai';
import type { AIResponse, EmotionTag, NeedTag } from '@menoai/shared';
import { SAFETY_RESPONSE_TEMPLATE, MAIN_SYSTEM_PROMPT } from '@menoai/shared';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if OpenAI is configured
const isOpenAIConfigured = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key-here';

/**
 * Mock emotion detection
 * In production, this would use more sophisticated NLP
 */
function detectEmotion(message: string): EmotionTag {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('angry') || lowerMessage.includes('furious') || lowerMessage.includes('snapped')) {
    return 'anger';
  }
  if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared')) {
    return 'anxiety';
  }
  if (lowerMessage.includes('sad') || lowerMessage.includes('crying') || lowerMessage.includes('depressed')) {
    return 'sadness';
  }
  if (lowerMessage.includes('ashamed') || lowerMessage.includes('embarrassed')) {
    return 'shame';
  }
  if (lowerMessage.includes('guilty') || lowerMessage.includes('awful about')) {
    return 'guilt';
  }
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('annoyed')) {
    return 'frustration';
  }

  return 'neutral';
}

/**
 * Mock need identification based on NVC principles
 */
function identifyNeed(message: string, emotion: EmotionTag): NeedTag {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('partner') || lowerMessage.includes('husband') || lowerMessage.includes('alone')) {
    return 'connection';
  }
  if (lowerMessage.includes('don\'t understand') || lowerMessage.includes('gets it')) {
    return 'understanding';
  }
  if (lowerMessage.includes('exhausted') || lowerMessage.includes('tired') || lowerMessage.includes('sleep')) {
    return 'rest';
  }
  if (lowerMessage.includes('safe') || lowerMessage.includes('scared')) {
    return 'safety';
  }
  if (lowerMessage.includes('control') || lowerMessage.includes('overwhelmed')) {
    return 'autonomy';
  }

  return 'peace';
}

/**
 * Generate mock AI response using 4-step framework
 * Validate → Reflect → Reframe → Empower
 *
 * @param message - User's message
 * @param isSafetyTriggered - Whether safety escalation was triggered
 * @returns Structured AI response
 */
export async function generateMockResponse(
  message: string,
  isSafetyTriggered: boolean = false
): Promise<AIResponse> {

  // If safety is triggered, return safety response
  if (isSafetyTriggered) {
    return {
      validate: "I hear how unbearable this feels right now.",
      reflect: "It sounds like you're going through something really heavy.",
      reframe: "You don't have to face this alone.",
      empower: "Would you be open to reaching out to professional support?",
      full_response: SAFETY_RESPONSE_TEMPLATE,
      safety_triggered: true,
      emotion_detected: 'sadness',
      need_identified: 'safety'
    };
  }

  // Detect emotion and need
  const emotion = detectEmotion(message);
  const need = identifyNeed(message, emotion);

  // Generate mock 4-step response
  // In production, this would call OpenAI with the system prompt

  const mockResponses = [
    {
      validate: "That sounds really heavy—feeling like you've snapped at someone you care about can bring up so much guilt.",
      reflect: "It seems like connection with your partner really matters to you, and that moment felt like it broke that connection.",
      reframe: "What if this isn't about you being a bad partner, but about your body being overwhelmed and needing a release?",
      empower: "Would you like to explore what might have been building up before that moment happened?",
      full_response: "That sounds really heavy—feeling like you've snapped at someone you care about can bring up so much guilt. It seems like connection with your partner really matters to you, and that moment felt like it broke that connection.\n\nWhat if this isn't about you being a bad partner, but about your body being overwhelmed and needing a release? Sometimes irritability during perimenopause is our nervous system saying 'I'm at capacity.'\n\nWould you like to explore what might have been building up before that moment happened?"
    },
    {
      validate: "I hear how frustrating that must have felt—brain fog can make you question everything about yourself.",
      reflect: "It sounds like you're worried this means something bigger, like you're losing your competence.",
      reframe: "What if this isn't about your capability, but about your brain navigating hormonal changes? This is one of the most common perimenopause experiences.",
      empower: "How would it feel to treat yourself with the same compassion you'd give a friend going through this?",
      full_response: "I hear how frustrating that must have felt—brain fog can make you question everything about yourself. It sounds like you're worried this means something bigger, like you're losing your competence.\n\nWhat if this isn't about your capability, but about your brain navigating hormonal changes? This is one of the most common perimenopause experiences—and it doesn't define who you are or what you're capable of.\n\nHow would it feel to treat yourself with the same compassion you'd give a friend going through this?"
    },
    {
      validate: "That sounds overwhelming—when everything hits at once, it's natural to feel like you're losing control.",
      reflect: "It seems like you're carrying a lot right now, and maybe feeling like you should be handling it better than you are.",
      reframe: "What if struggling isn't a sign of weakness, but a signal that you need support or rest?",
      empower: "What's one small thing that might bring you a bit of peace today?",
      full_response: "That sounds overwhelming—when everything hits at once, it's natural to feel like you're losing control. It seems like you're carrying a lot right now, and maybe feeling like you should be handling it better than you are.\n\nWhat if struggling isn't a sign of weakness, but a signal that you need support or rest? Your body and mind are asking for something—maybe it's permission to slow down, or connection with someone who understands.\n\nWhat's one small thing that might bring you a bit of peace today?"
    }
  ];

  // Select a mock response (in production, this would be generated by LLM)
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

  return {
    ...response,
    safety_triggered: false,
    emotion_detected: emotion,
    need_identified: need
  };
}

/**
 * Generate AI response using OpenAI GPT-4
 * Uses the 4-step framework: Validate → Reflect → Reframe → Empower
 *
 * @param message - User's current message
 * @param conversationHistory - Previous messages for context
 * @param isSafetyTriggered - Whether safety escalation was triggered
 * @returns Structured AI response
 */
export async function generateAIResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  isSafetyTriggered: boolean = false
): Promise<AIResponse> {

  // If safety is triggered, return safety response immediately
  if (isSafetyTriggered) {
    return {
      validate: "I hear how unbearable this feels right now.",
      reflect: "It sounds like you're going through something really heavy.",
      reframe: "You don't have to face this alone.",
      empower: "Would you be open to reaching out to professional support?",
      full_response: SAFETY_RESPONSE_TEMPLATE,
      safety_triggered: true,
      emotion_detected: 'sadness',
      need_identified: 'safety'
    };
  }

  // If OpenAI is not configured, fall back to mock responses
  if (!isOpenAIConfigured) {
    console.warn('⚠️  OpenAI not configured. Using mock responses.');
    return generateMockResponse(message, isSafetyTriggered);
  }

  try {
    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: MAIN_SYSTEM_PROMPT },
      ...conversationHistory.slice(-6), // Last 3 conversation turns (6 messages)
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 400,
      presence_penalty: 0.6, // Encourage varied responses
      frequency_penalty: 0.3, // Reduce repetition
    });

    const aiMessage = completion.choices[0]?.message?.content || '';

    if (!aiMessage) {
      throw new Error('Empty response from OpenAI');
    }

    // Detect emotion and need from user message
    const emotion = detectEmotion(message);
    const need = identifyNeed(message, emotion);

    // Parse the response to extract 4-step structure
    // For now, we'll use the full response and let the LLM naturally create the structure
    // In a more advanced version, we could use structured outputs or parse the response
    const structuredResponse = parseResponseInto4Steps(aiMessage);

    return {
      ...structuredResponse,
      full_response: aiMessage,
      safety_triggered: false,
      emotion_detected: emotion,
      need_identified: need
    };

  } catch (error) {
    console.error('Error calling OpenAI:', error);

    // Fall back to mock response on error
    console.warn('⚠️  OpenAI error. Falling back to mock response.');
    return generateMockResponse(message, isSafetyTriggered);
  }
}

/**
 * Parse AI response into 4-step structure
 * Attempts to identify each step in the response
 *
 * @param response - Full AI response text
 * @returns Structured 4-step response
 */
function parseResponseInto4Steps(response: string): Omit<AIResponse, 'full_response' | 'safety_triggered' | 'emotion_detected' | 'need_identified'> {
  // Split response into paragraphs
  const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0);

  // Simple heuristic: assign paragraphs to steps
  // This is a basic implementation - could be enhanced with more sophisticated parsing
  const validate = paragraphs[0] || response.substring(0, 150);
  const reflect = paragraphs[1] || response.substring(150, 300);
  const reframe = paragraphs[2] || '';
  const empower = paragraphs[paragraphs.length - 1] || '';

  return {
    validate,
    reflect,
    reframe,
    empower
  };
}
