// Client-side utility for playing AI voice responses using Gemini TTS or Web Speech Synthesis fallback

let currentAudio: HTMLAudioElement | null = null;
let currentAudioCtx: AudioContext | null = null;
let listeners: Set<(isSpeaking: boolean) => void> = new Set();
let speakingState = false;

function setSpeaking(isSpeaking: boolean) {
  speakingState = isSpeaking;
  listeners.forEach((fn) => fn(isSpeaking));
}

export function subscribeSpeaking(listener: (isSpeaking: boolean) => void) {
  listeners.add(listener);
  listener(speakingState);
  return () => {
    listeners.delete(listener);
  };
}

export function stopVoice() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (currentAudioCtx) {
    try {
      currentAudioCtx.close();
    } catch {}
    currentAudioCtx = null;
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  setSpeaking(false);
}

/**
 * Play voice for given text.
 * Uses Gemini TTS API (/api/tts) first. If unavailable, falls back to Web Speech Synthesis.
 */
export async function speakText(text: string, voiceName: string = 'Kore', lang: string = 'en-US'): Promise<void> {
  stopVoice();
  if (!text || !text.trim()) return;

  setSpeaking(true);

  try {
    // 1. Attempt Gemini TTS from server
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        await playBase64Audio(data.audioBase64, data.sampleRate || 24000);
        return;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS endpoint failed, falling back to Web Speech Synthesis:', err);
  }

  // 2. Direct fast fallback to Web Speech Synthesis API
  await speakWebSpeech(text, lang);
}

/**
 * Play pre-fetched base64 audio string or fallback if empty
 */
export async function playAudioDataOrFallback(
  audioBase64?: string,
  textFallback?: string,
  sampleRate = 24000,
  lang: string = 'en-US'
): Promise<void> {
  // Clear any existing active audio source first
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    currentAudio = null;
  }
  if (currentAudioCtx) {
    try { currentAudioCtx.close(); } catch {}
    currentAudioCtx = null;
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }

  setSpeaking(true);

  if (audioBase64) {
    try {
      await playBase64Audio(audioBase64, sampleRate);
      return;
    } catch (err) {
      console.warn('Failed playing base64 audio, falling back to Web Speech:', err);
    }
  }

  if (textFallback) {
    await speakWebSpeech(textFallback, lang);
  } else {
    setSpeaking(false);
  }
}

function cleanSpeakerPrefixClient(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(Aura|Sameera|Samira|Rajamma|AI|Companion|Bot|సమీరా|రాజమ్మ|అసిస్టెంట్)\s*[:\-\u2013\u2014]\s*/i, '')
    .replace(/^["'«»]+/g, '')
    .replace(/["'«»]+$/g, '')
    .trim();
}

function splitTextIntoTTSChunks(text: string, maxLen = 85): string[] {
  if (!text) return [];
  const clean = cleanSpeakerPrefixClient(text)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_#`~"'\u201C\u201D«»]/g, '')
    .trim();

  if (!clean) return [];

  // Split by sentence punctuation first
  const sentences = clean.split(/(?<=[.!?:;\u0964\u061F\n])\s+/);
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length <= maxLen) {
      chunks.push(s);
    } else {
      // Split long sentence by spaces
      const words = s.split(/\s+/);
      let currentChunk = '';
      for (const word of words) {
        if ((currentChunk + ' ' + word).trim().length <= maxLen) {
          currentChunk = (currentChunk + ' ' + word).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = word;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }
  }

  return chunks.length > 0 ? chunks : [clean];
}

function tryGoogleTranslateTTS(text: string, lang: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const chunks = splitTextIntoTTSChunks(text, 80);
      if (chunks.length === 0) {
        resolve(false);
        return;
      }

      const langCode = lang.startsWith('te') ? 'te' : lang.startsWith('hi') ? 'hi' : 'en';
      setSpeaking(true);

      for (let i = 0; i < chunks.length; i++) {
        let chunkText = chunks[i];

        if (langCode === 'te') {
          chunkText = chunkText.replace(/Sameera/gi, 'సమీరా').replace(/Rajamma/gi, 'రాజమ్మ');
        } else if (langCode === 'hi') {
          chunkText = chunkText.replace(/Sameera/gi, 'समीरा').replace(/Rajamma/gi, 'राजम्मा');
        }

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${langCode}&client=tw-ob`;

        const played = await playSingleAudioUrl(url);
        if (!played) {
          setSpeaking(false);
          resolve(false);
          return;
        }
      }

      setSpeaking(false);
      resolve(true);
    } catch (e) {
      setSpeaking(false);
      resolve(false);
    }
  });
}

function playSingleAudioUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(url);
      currentAudio = audio;

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { audio.pause(); } catch {}
          currentAudio = null;
          resolve(false);
        }
      }, 12000);

      audio.onplay = () => {
        setSpeaking(true);
      };

      audio.onended = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          currentAudio = null;
          resolve(true);
        }
      };

      audio.onerror = (e) => {
        console.warn('Google Translate single chunk audio error:', e);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          currentAudio = null;
          resolve(false);
        }
      };

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('Google Translate single chunk play exception:', err);
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            currentAudio = null;
            resolve(false);
          }
        });
      }
    } catch (e) {
      resolve(false);
    }
  });
}

async function playBase64Audio(base64: string, sampleRate = 24000): Promise<void> {
  return new Promise<void>(async (resolve) => {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // If MP3 header is present (ID3 or frame header 0xFF) or WAV header (RIFF)
      const isWav = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      const isMp3 = (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0);

      if (isWav || isMp3) {
        const mimeType = isWav ? 'audio/wav' : 'audio/mp3';
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio = audio;

        let resolved = false;
        const finish = () => {
          if (!resolved) {
            resolved = true;
            setSpeaking(false);
            currentAudio = null;
            resolve();
          }
        };

        audio.onended = finish;
        audio.onerror = finish;

        setSpeaking(true);
        await audio.play();
        return;
      }

      // Raw 16-bit PCM at 24000Hz (or specified sample rate)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate });
      currentAudioCtx = audioCtx;

      // Unlock AudioContext if browser autoplay policy suspended it
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch {}
      }

      const samplesCount = Math.floor(bytes.length / 2);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const buffer = audioCtx.createBuffer(1, samplesCount, sampleRate);
      const channelData = buffer.getChannelData(0);

      for (let i = 0; i < samplesCount; i++) {
        const int16 = dataView.getInt16(i * 2, true); // true = little endian PCM
        channelData[i] = int16 / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      source.onended = () => {
        setSpeaking(false);
        try {
          audioCtx.close();
        } catch {}
        currentAudioCtx = null;
        resolve();
      };

      source.start(0);
    } catch (e) {
      console.error('Error playing base64 PCM:', e);
      setSpeaking(false);
      resolve();
    }
  });
}

function speakWebSpeech(text: string, lang: string = 'en-US'): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Browser does not support SpeechSynthesis');
      setSpeaking(false);
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Clean text of emojis / markup for cleaner speech synthesis
      const cleanSpeechText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

      const utterance = new SpeechSynthesisUtterance(cleanSpeechText || text);
      // Store utterance globally on window so Chrome V8 garbage collector doesn't destroy it mid-speech!
      (window as any)._activeUtterance = utterance;

      utterance.pitch = 1.0;
      utterance.rate = 0.90;

      const applyVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        let targetLang = lang || 'en-US';

        if (voices && voices.length > 0) {
          let matched = voices.find((v) => v.lang === targetLang || v.lang.replace('_', '-') === targetLang);
          if (!matched) {
            const mainLang = targetLang.split('-')[0];
            matched = voices.find((v) => v.lang.startsWith(mainLang));
          }
          if (!matched && targetLang.startsWith('te')) {
            matched = voices.find((v) => v.lang.toLowerCase().includes('te') || v.name.toLowerCase().includes('telugu'));
          }
          if (!matched && (targetLang.startsWith('te') || targetLang.startsWith('hi'))) {
            matched = voices.find((v) => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi') || v.lang.toLowerCase().includes('in'));
          }
          if (!matched) {
            matched = voices.find((v) => v.default) || voices[0];
          }

          if (matched) {
            utterance.voice = matched;
            utterance.lang = matched.lang;
          } else {
            utterance.lang = targetLang;
          }
        } else {
          utterance.lang = targetLang;
        }
      };

      applyVoice();
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          applyVoice();
        };
      }

      let resolved = false;
      let resumeTimer: any = null;

      const finish = () => {
        if (!resolved) {
          resolved = true;
          if (resumeTimer) clearInterval(resumeTimer);
          (window as any)._activeUtterance = null;
          setSpeaking(false);
          resolve();
        }
      };

      utterance.onstart = () => {
        setSpeaking(true);
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error event:', e);
        finish();
      };

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);

      // Maximum duration timeout safety net (e.g. 600ms per word + 4s buffer)
      const wordCount = (cleanSpeechText || text).split(/\s+/).length;
      const maxMs = Math.max(4000, wordCount * 600 + 4000);
      setTimeout(() => {
        finish();
      }, maxMs);

      // Keep-alive timer for Chrome SpeechSynthesis bug where long audio pauses
      resumeTimer = setInterval(() => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        } else {
          clearInterval(resumeTimer);
        }
      }, 1000);

    } catch (err) {
      console.error('speakWebSpeech failed:', err);
      setSpeaking(false);
      resolve();
    }
  });
}

