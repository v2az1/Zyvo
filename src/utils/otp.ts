/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses email subject, intro, body text, or HTML to find verification codes or OTPs.
 * Commonly OTPs are 4 to 8 digit numeric codes.
 */
export function extractOTP(subject: string = '', text: string = '', html: string = '', intro: string = ''): string | null {
  // Combine all sources to scan
  const combinedText = `[Subject: ${subject}] [Intro: ${intro}] ${text} ${html}`;

  // Let's check typical verification/OTP patterns
  // Clean up html tags for easier regex matching if any
  const cleanText = combinedText.replace(/<[^>]*>/g, ' ');

  // Look for prominent patterns first
  // 1. "verification code is: 123456"
  // 2. "your OTP is 1234"
  // 3. "Code: 123456"
  const patterns = [
    /(?:verification\s+code|verify\s+code|security\s+code|one-time\s+password|passcode|otp|pin|activation\s+code)\s*(?:is|:|=)?\s*\b(\d{4,8})\b/i,
    /code\s*(?:is|:|=)?\s*\b(\d{4,8})\b/i,
    /otp\s*(?:is|:|=)?\s*\b(\d{4,8})\b/i,
    /\b(\d{4,8})\b\s*(?:is\s+your|is\s+the|to\s+verify)/i,
    /confirm\s+code\s*[:=]?\s*\b(\d{4,8})\b/i,
    /pin\s+code\s*[:=]?\s*\b(\d{4,8})\b/i,
    /your\s+code\s+is\s+\b(\d{4,8})\b/i
  ];

  for (const regex of patterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback: If we find a standalone 6-digit number or 4-to-8 digit number and there is ANY indicator word in the text
  const indicatorWords = ['verification', 'verify', 'security', 'one-time', 'passcode', 'otp', 'pin', 'code', 'activation', 'confirm', 'login', 'auth'];
  const hasIndicator = indicatorWords.some(word => cleanText.toLowerCase().includes(word));

  if (hasIndicator) {
    // Check for 6-digit codes
    const sixDigits = cleanText.match(/\b\d{6}\b/);
    if (sixDigits) return sixDigits[0];

    // Check for 4-digit codes (exclude common years)
    const fourDigitsMatch = cleanText.match(/\b\d{4}\b/g);
    if (fourDigitsMatch) {
      for (const code of fourDigitsMatch) {
        if (code !== '2025' && code !== '2026' && code !== '3000' && code !== '2000') {
          return code;
        }
      }
    }

    // Check for 5 or 7-8 digits
    const otherDigits = cleanText.match(/\b\d{5,8}\b/);
    if (otherDigits) return otherDigits[0];
  }

  return null;
}
