/**
 * Safety detection service
 * Detects high-risk phrases and triggers escalation protocols
 */

/**
 * High-risk keywords and phrases that trigger safety escalation
 */
const HIGH_RISK_PHRASES = [
  'want to die',
  'kill myself',
  'end it all',
  'can\'t go on',
  'no point living',
  'better off dead',
  'want to disappear',
  'can\'t handle this anymore',
  'what\'s the point',
  'give up on life',
  'self harm',
  'hurt myself',
  'suicidal',
  'end my life'
];

/**
 * Medium-risk phrases that warrant careful attention
 */
const MEDIUM_RISK_PHRASES = [
  'so overwhelmed',
  'can\'t cope',
  'losing control',
  'falling apart',
  'breaking down',
  'too much to bear'
];

export interface SafetyCheckResult {
  isHighRisk: boolean;
  isMediumRisk: boolean;
  triggerPhrase?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Detects safety concerns in user message
 * @param message - User's message text
 * @returns Safety check result with risk level and trigger phrase
 */
export function detectSafety(message: string): SafetyCheckResult {
  const lowerMessage = message.toLowerCase();

  // Check for high-risk phrases
  for (const phrase of HIGH_RISK_PHRASES) {
    if (lowerMessage.includes(phrase)) {
      return {
        isHighRisk: true,
        isMediumRisk: false,
        triggerPhrase: phrase,
        riskLevel: 'high'
      };
    }
  }

  // Check for medium-risk phrases
  for (const phrase of MEDIUM_RISK_PHRASES) {
    if (lowerMessage.includes(phrase)) {
      return {
        isHighRisk: false,
        isMediumRisk: true,
        triggerPhrase: phrase,
        riskLevel: 'medium'
      };
    }
  }

  // No safety concerns detected
  return {
    isHighRisk: false,
    isMediumRisk: false,
    riskLevel: 'low'
  };
}

/**
 * Get safety resources based on region
 * @param region - User's region (UK, Portugal, etc.)
 * @returns Array of support resources
 */
export function getSafetyResources(region: 'UK' | 'Portugal' = 'UK') {
  const resources = {
    UK: [
      { name: 'Samaritans', contact: '116 123', available: '24/7' },
      { name: 'NHS Mental Health Hotline', contact: '111', available: '24/7' },
      { name: 'Crisis Text Line', contact: 'Text SHOUT to 85258', available: '24/7' }
    ],
    Portugal: [
      { name: 'SOS Voz Amiga', contact: '213 544 545', available: '24/7' },
      { name: 'Telefone da Amizade', contact: '228 323 535', available: '24/7' },
      { name: 'SNS24', contact: '808 24 24 24', available: '24/7' }
    ]
  };

  return resources[region];
}
