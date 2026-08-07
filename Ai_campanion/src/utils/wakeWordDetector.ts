/**
 * Wake Word Detector for Siri & Aura Voice Companion
 */

export interface WakeWordMatch {
  isWakeWord: boolean;
  matchedWord?: string;
  cleanQuery: string;
}

export function detectWakeWord(text: string): WakeWordMatch {
  if (!text || !text.trim()) {
    return { isWakeWord: false, cleanQuery: '' };
  }

  const lower = text.toLowerCase().trim();
  // Siri, Aura, Rajamma, and Sameera trigger phrases in English, Telugu, Hindi with phonetic variants
  const wakeWords = [
    'hey siri',
    'hi siri',
    'ok siri',
    'hello siri',
    'siri',
    'seeri',
    'series',
    'city',
    'seri',
    'syri',
    'seree',
    'hey aura',
    'hi aura',
    'ok aura',
    'hello aura',
    'aura',
    'ora',
    'hey rajamma',
    'hi rajamma',
    'hello rajamma',
    'rajamma',
    'hey sameera',
    'hi sameera',
    'hello sameera',
    'sameera',
    'samira',
    'namaste siri',
    'namaste aura',
    'namaste rajamma',
    'namaste sameera',
    // Telugu script wake words
    'హే రాజమ్మ',
    'హాయ్ రాజమ్మ',
    'హలో రాజమ్మ',
    'రాజమ్మ',
    'నమస్తే రాజమ్మ',
    'హే సమీరా',
    'హాయ్ సమీరా',
    'హలో సమీరా',
    'సమీరా',
    'నమస్తే సమీరా',
    'హే ఆరా',
    'ఆరా',
    // Hindi script wake words
    'हे राजम्मा',
    'हाय राजम्मा',
    'नमस्ते राजम्मा',
    'राजम्मा',
    'हे समीरा',
    'हाय समीरा',
    'नमस्ते समीरा',
    'समीरा',
  ];

  for (const word of wakeWords) {
    const wordIndex = lower.indexOf(word);
    if (wordIndex !== -1) {
      // Extract query after wake word if present
      let cleanQuery = text.replace(new RegExp(word, 'gi'), '').trim();
      cleanQuery = cleanQuery.replace(/^[\s,.:;!?-]+/, '').trim();

      return {
        isWakeWord: true,
        matchedWord: word,
        cleanQuery: cleanQuery || text
      };
    }
  }

  return { isWakeWord: false, cleanQuery: text };
}
