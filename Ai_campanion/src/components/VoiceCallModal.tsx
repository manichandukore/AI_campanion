import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  Radio,
  UserCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { playAudioDataOrFallback, speakText, stopVoice, subscribeSpeaking } from '../utils/audioPlayer';
import { isStomachPainMentioned, isHeartPainMentioned, isGasMentioned } from '../utils/symptomDetector';
import { detectWakeWord } from '../utils/wakeWordDetector';

function stripSpeakerPrefix(text: string): string {
  if (!text) return '';
  return text
    .replace(/^(Aura|Sameera|Samira|Rajamma|AI|Companion|Bot|సమీరా|రాజమ్మ|అసిస్టెంట్)\s*[:\-\u2013\u2014]\s*/i, '')
    .replace(/^["'«»]+/g, '')
    .replace(/["'«»]+$/g, '')
    .trim();
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  initialQuery?: string;
  onStomachPainAlert?: (userText: string) => void;
  onHeartPainAlert?: (userText: string) => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  userName = 'Rajamma',
  initialQuery,
  onStomachPainAlert,
  onHeartPainAlert,
}) => {
  const [siriDetected, setSiriDetected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'ai',
      content: `Haan ${userName}! I am right here with you. How are you feeling right now? Tell me about your day!`,
      time: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'auto' | 'te-IN' | 'hi-IN' | 'en-US'>('te-IN');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [autoListen, setAutoListen] = useState(true);
  const [micPermissionNotice, setMicPermissionNotice] = useState<string | null>(null);
  const [whatsappAlertNotice, setWhatsappAlertNotice] = useState<{
    symptom: string;
    time: string;
    whatsappUrl: string;
  } | null>(null);

  const [recognition, setRecognition] = useState<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const recoRestartTimerRef = useRef<any>(null);
  const latestInputRef = useRef<string>('');
  const isAiThinkingRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isOpenRef = useRef<boolean>(isOpen);
  const langRef = useRef<string>(selectedLang);

  const activeRecoRef = useRef<any>(null);
  const isAbortingRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    langRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    latestInputRef.current = inputMessage;
  }, [inputMessage]);

  useEffect(() => {
    isAiThinkingRef.current = isAiThinking;
  }, [isAiThinking]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Subscribe to voice audio player state -> auto-listen when AI finishes speaking
  useEffect(() => {
    const unsubscribe = subscribeSpeaking((speaking) => {
      setIsSpeaking(speaking);
      isSpeakingRef.current = speaking;
      
      // When AI stops speaking, automatically turn on mic to listen to user!
      if (!speaking && autoListen && isOpenRef.current) {
        if (recoRestartTimerRef.current) clearTimeout(recoRestartTimerRef.current);
        recoRestartTimerRef.current = setTimeout(() => {
          if (!isSpeakingRef.current && !isAiThinkingRef.current && isOpenRef.current && !activeRecoRef.current && !isStartingRef.current) {
            startSpeechRecognition();
          }
        }, 600);
      } else if (speaking) {
        stopSpeechRecognition();
      }
    });
    return () => unsubscribe();
  }, [autoListen, isOpen]);

  // Scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Stop active speech recognition cleanly
  const stopSpeechRecognition = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recoRestartTimerRef.current) {
      clearTimeout(recoRestartTimerRef.current);
      recoRestartTimerRef.current = null;
    }
    if (activeRecoRef.current) {
      isAbortingRef.current = true;
      try {
        activeRecoRef.current.abort();
      } catch {}
      activeRecoRef.current = null;
    }
    setIsListening(false);
  };

  // Start fresh speech recognition stream
  const startSpeechRecognition = () => {
    if (!isOpenRef.current || isSpeakingRef.current || isAiThinkingRef.current) return;
    if (isStartingRef.current) return;

    stopSpeechRecognition();
    isAbortingRef.current = false;
    isStartingRef.current = true;

    setInputMessage('');
    latestInputRef.current = '';
    setMicPermissionNotice(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback demo for browsers without speech recognition API
      setIsListening(true);
      setTimeout(() => {
        let demoText = "I slept well and woke up feeling good today!";
        if (langRef.current === 'te-IN') {
          demoText = "ఈ రోజు నా ఆరోగ్యం బాగుంది, చాలా సంతోషంగా ఉంది!";
        } else if (langRef.current === 'hi-IN') {
          demoText = "आज मैं बहुत अच्छा महसूस कर रही हूँ!";
        }
        setInputMessage(demoText);
        latestInputRef.current = demoText;
        setIsListening(false);
        setTimeout(() => {
          handleSendMessage(demoText);
        }, 800);
      }, 2500);
      isStartingRef.current = false;
      return;
    }

    initRecoEngine(SpeechRecognition);
  };

  const initRecoEngine = (SpeechRecognition: any) => {
    try {
      const reco = new SpeechRecognition();
      reco.continuous = false; // continuous = false avoids browser speech recognition loops & blinking
      reco.interimResults = true;
      reco.lang = langRef.current === 'auto' ? (navigator.language || 'en-US') : langRef.current;

      reco.onstart = () => {
        isStartingRef.current = false;
        // Strict guard: if AI started speaking or thinking right as mic opened, abort mic immediately!
        if (isSpeakingRef.current || isAiThinkingRef.current || !isOpenRef.current) {
          try { reco.abort(); } catch {}
          setIsListening(false);
          return;
        }
        setIsListening(true);
        setMicPermissionNotice(null);
      };

      reco.onresult = (event: any) => {
        // Strict guard: ignore results if AI is currently speaking or thinking
        if (isSpeakingRef.current || isAiThinkingRef.current) return;

        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        if (fullTranscript) {
          setInputMessage(fullTranscript);
          latestInputRef.current = fullTranscript;

          const match = detectWakeWord(fullTranscript);
          if (match.isWakeWord) {
            setSiriDetected(match.matchedWord || 'Siri');
          }

          // Auto-send after 1.2s silence pause
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (latestInputRef.current.trim() && !isAiThinkingRef.current && !isSpeakingRef.current) {
              stopSpeechRecognition();
              handleSendMessage(latestInputRef.current.trim());
            }
          }, 1200);
        }
      };

      reco.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e);
        isStartingRef.current = false;
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          setMicPermissionNotice('Microphone permission blocked by browser. Click the mic icon in your address bar to allow.');
          setIsListening(false);
        } else if (e.error === 'no-speech' || e.error === 'network' || e.error === 'aborted') {
          // Normal transient speech pauses
        } else {
          setIsListening(false);
        }
      };

      reco.onend = () => {
        isStartingRef.current = false;
        activeRecoRef.current = null;
        setIsListening(false);

        // If we deliberately aborted or closed, do not restart
        if (isAbortingRef.current) {
          isAbortingRef.current = false;
          return;
        }

        if (latestInputRef.current.trim() && !isAiThinkingRef.current && !isSpeakingRef.current) {
          const textToSend = latestInputRef.current.trim();
          setInputMessage('');
          latestInputRef.current = '';
          handleSendMessage(textToSend);
        } else if (autoListen && !isSpeakingRef.current && !isAiThinkingRef.current && isOpenRef.current) {
          // Silently listen for next phrase after brief pause
          if (recoRestartTimerRef.current) clearTimeout(recoRestartTimerRef.current);
          recoRestartTimerRef.current = setTimeout(() => {
            if (autoListen && !isSpeakingRef.current && !isAiThinkingRef.current && isOpenRef.current && !activeRecoRef.current && !isStartingRef.current) {
              startSpeechRecognition();
            }
          }, 800);
        }
      };

      activeRecoRef.current = reco;
      reco.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      isStartingRef.current = false;
      setIsListening(false);
    }
  };

  // Play opening greeting depending on language
  const playGreetingForLang = async (langCode: string) => {
    const isRajamma = (userName || '').toLowerCase().includes('rajamma');
    const nameTe = isRajamma ? 'రాజమ్మ' : userName;
    const nameHi = isRajamma ? 'राजम्मा' : userName;

    let greeting = `Haan ${userName}! I am right here with you. How are you feeling right now? Tell me!`;
    if (langCode === 'te-IN') {
      greeting = `నమస్కారం ${nameTe} గారు! నేను మీతోనే ఉన్నాను. ఈ రోజు మీరు ఎలా ఉన్నారు? చెప్పండి!`;
    } else if (langCode === 'hi-IN') {
      greeting = `नमस्ते ${nameHi} जी! मैं आपके साथ ही हूँ। आज आप कैसा महसूस कर रही हैं? बताइए!`;
    }

    const initMsg: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content: greeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initMsg]);

    stopSpeechRecognition();
    setIsAiThinking(true);
    isAiThinkingRef.current = true;

    try {
      await playAudioDataOrFallback(undefined, greeting, 24000, langCode);
    } catch (err) {
      console.warn('Greeting audio error:', err);
    } finally {
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
      if (autoListen && isOpenRef.current) {
        if (recoRestartTimerRef.current) clearTimeout(recoRestartTimerRef.current);
        recoRestartTimerRef.current = setTimeout(() => {
          if (autoListen && isOpenRef.current && !isSpeakingRef.current && !isAiThinkingRef.current && !activeRecoRef.current && !isStartingRef.current) {
            startSpeechRecognition();
          }
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery.trim()) {
        setTimeout(() => {
          handleSendMessage(initialQuery);
        }, 500);
      } else {
        playGreetingForLang(selectedLang);
      }
    } else {
      stopVoice();
      stopSpeechRecognition();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setInputMessage('');
      latestInputRef.current = '';
      setSiriDetected(null);
    }
  }, [isOpen, initialQuery]);

  const handleLanguageChange = (newLang: 'auto' | 'te-IN' | 'hi-IN' | 'en-US') => {
    setSelectedLang(newLang);
    langRef.current = newLang;
    stopVoice();
    stopSpeechRecognition();
    playGreetingForLang(newLang);
  };

  const toggleMic = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage || latestInputRef.current;
    if (!text || !text.trim() || isAiThinkingRef.current) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopVoice();
    stopSpeechRecognition();

    const cleanText = text.trim();
    setInputMessage('');
    latestInputRef.current = '';

    let emergencyTriggered = false;
    let symptomTypeLabel = '';

    if (isHeartPainMentioned(cleanText)) {
      emergencyTriggered = true;
      symptomTypeLabel = 'Chest / Heart Pain Discomfort';
      if (onHeartPainAlert) onHeartPainAlert(cleanText);
    } else if (isStomachPainMentioned(cleanText) || isGasMentioned(cleanText)) {
      emergencyTriggered = true;
      symptomTypeLabel = 'Stomach Pain / Gas Discomfort';
      if (onStomachPainAlert) onStomachPainAlert(cleanText);
    }

    if (emergencyTriggered) {
      const cleanPhone = '919876543210';
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const alertMsg = `🚨 URGENT HEALTH EMERGENCY: ${userName} reported ${symptomTypeLabel} ("${cleanText}") during Voice Assistant conversation at ${timeStr}. Location: Home (Flat 302, Hyderabad).`;

      setWhatsappAlertNotice({
        symptom: symptomTypeLabel,
        time: timeStr,
        whatsappUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertMsg)}`,
      });

      fetch('/api/whatsapp/send-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomText: `${symptomTypeLabel}: ${cleanText}`,
          userName,
          location: 'Home (Flat 302, Hyderabad)',
        }),
      }).catch(() => {});
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: cleanText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);
    isAiThinkingRef.current = true;

    try {
      const res = await fetch('/api/chat/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: cleanText,
          history: [...messages, userMsg],
          voiceName: selectedVoice,
          userName,
          language: selectedLang,
        }),
      });

      const data = await res.json();
      const rawReply = data.replyText || (selectedLang === 'te-IN' ? `హలో ${userName} గారు! నేను ఇక్కడే మీతోనే ఉన్నాను, చెప్పండి.` : `Haan ${userName}, I am right here listening to you!`);
      const replyContent = stripSpeakerPrefix(rawReply);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: replyContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Await voice playback so microphone stays OFF while AI speaks
      if (data.audioBase64) {
        await playAudioDataOrFallback(data.audioBase64, replyContent, 24000, selectedLang);
      } else {
        await playAudioDataOrFallback(undefined, replyContent, 24000, selectedLang);
      }

    } catch (error) {
      console.error('Error in voice conversation:', error);
      const fallbackText = `Haan ${userName}, I heard you! I am always here for our conversation.`;
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      await playAudioDataOrFallback(undefined, fallbackText, 24000, selectedLang);
    } finally {
      setIsAiThinking(false);
      isAiThinkingRef.current = false;

      // Automatically turn on speech recognition after speech finishes + 800ms buffer
      if (autoListen && isOpenRef.current) {
        if (recoRestartTimerRef.current) clearTimeout(recoRestartTimerRef.current);
        recoRestartTimerRef.current = setTimeout(() => {
          if (autoListen && isOpenRef.current && !isSpeakingRef.current && !isAiThinkingRef.current && !activeRecoRef.current && !isStartingRef.current) {
            startSpeechRecognition();
          }
        }, 800);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[90vh] max-h-[750px] border-2 border-teal-200 shadow-2xl flex flex-col overflow-hidden relative font-sans">
        
        {/* Top Call Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
                <Sparkles className="w-6 h-6 text-amber-300 animate-spin-slow" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-teal-800 rounded-full" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>Aura Human Voice Companion</span>
                <span className="text-xs bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2 py-0.5 rounded-full font-mono">
                  LIVE CALL
                </span>
              </h2>
              <p className="text-xs text-teal-100 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Speaking with {userName}</span>
                <span>•</span>
                <span className="bg-teal-800/60 text-amber-200 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-teal-500/30">
                  Persona: Warm Empathetic Companion
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopVoice();
              onClose();
            }}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
            title="End Call"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language & Voice Selector Bar */}
        <div className="bg-teal-50 px-4 py-2 border-b border-teal-100 flex items-center justify-between text-xs font-bold text-teal-900 shrink-0 flex-wrap gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-teal-800 font-extrabold flex items-center gap-1">
              🌐 Language / భాష:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'auto', label: '✨ Auto-Detect' },
                { id: 'te-IN', label: 'తెలుగు (Telugu)' },
                { id: 'hi-IN', label: 'हिंदी (Hindi)' },
                { id: 'en-US', label: 'English' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLanguageChange(l.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                    selectedLang === l.id
                      ? 'bg-teal-700 text-white shadow-xs ring-1 ring-teal-800'
                      : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Model Selector */}
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <div className="flex items-center gap-1">
              {[
                { id: 'Kore', label: 'Kore (Female)' },
                { id: 'Fenrir', label: 'Fenrir (Male)' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`px-2 py-0.5 rounded-md transition-all text-[11px] cursor-pointer ${
                    selectedVoice === v.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white/80 text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
              <button
                onClick={() => playGreetingForLang(selectedLang)}
                className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1 ml-1"
                title="Test Voice Sound Output"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Interactive Voice Visualizer Stage */}
        <div className="bg-gradient-to-b from-stone-900 to-slate-900 p-6 flex flex-col items-center justify-center text-center text-white shrink-0 relative overflow-hidden">
          {/* Animated Glow Ripples */}
          {isSpeaking && (
            <>
              <div className="absolute w-64 h-64 rounded-full bg-teal-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none" />
            </>
          )}

          {isListening && (
            <div className="absolute w-60 h-60 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
          )}

          {/* Central Main Voice Orb Button */}
          <button
            onClick={toggleMic}
            className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl border-4 ${
              isSpeaking
                ? 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white border-white ring-8 ring-teal-400/40 scale-110 animate-pulse'
                : isListening
                ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-white ring-8 ring-rose-300/40 scale-105'
                : 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-white/80 hover:scale-105 active:scale-95'
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-12 h-12 animate-bounce text-white" />
            ) : isListening ? (
              <Mic className="w-12 h-12 animate-pulse text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>

          {/* Status Text under Orb */}
          <div className="mt-4 z-10 space-y-1">
            {micPermissionNotice && (
              <div className="bg-amber-900/90 border border-amber-300 text-amber-100 px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-lg max-w-md mx-auto my-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                  <span>{micPermissionNotice}</span>
                </div>
                <button
                  onClick={startSpeechRecognition}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer shadow-sm"
                >
                  Enable Mic
                </button>
              </div>
            )}

            {whatsappAlertNotice && (
              <div className="bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl max-w-lg mx-auto my-2 animate-bounce flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-left">
                  <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 fill-emerald-500" />
                  <div>
                    <p className="font-extrabold text-white text-xs leading-tight">
                      🚨 WhatsApp Emergency Alert Dispatched!
                    </p>
                    <p className="text-[11px] text-emerald-200 mt-0.5">
                      Notified Care Circle (Suresh Dev & Family) at {whatsappAlertNotice.time}
                    </p>
                  </div>
                </div>
                <a
                  href={whatsappAlertNotice.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shrink-0"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {siriDetected && (
              <div className="bg-purple-900/80 border border-purple-400 text-purple-200 px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 animate-bounce mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>⚡ Wake Phrase '{siriDetected}' Active!</span>
              </div>
            )}

            {isListening && (
              <div className="bg-rose-950/90 border-2 border-rose-400 text-rose-100 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-xl max-w-lg mx-auto my-2 animate-pulse flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span>
                  {inputMessage ? (
                    <>
                      🎙️ Transcribing words: <span className="text-white font-extrabold underline decoration-rose-300">"{inputMessage}"</span>
                    </>
                  ) : (
                    '🎙️ Listening & recording your voice... Speak now!'
                  )}
                </span>
              </div>
            )}

            <h3 className="text-lg font-black tracking-tight">
              {isSpeaking ? (
                <span className="text-teal-300 flex items-center justify-center gap-2">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  Aura is speaking back...
                </span>
              ) : isListening ? (
                <span className="text-rose-300 flex items-center justify-center gap-2">
                  <Mic className="w-5 h-5 animate-bounce" />
                  Listening... Speak & pause to auto-send!
                </span>
              ) : isAiThinking ? (
                <span className="text-amber-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Thinking response...
                </span>
              ) : (
                <span className="text-gray-200">Continuous Automatic Voice Call Active</span>
              )}
            </h3>
            <p className="text-xs text-teal-200/90 font-medium bg-white/10 px-3 py-1 rounded-full border border-white/10 inline-block">
              ✨ Hands-Free Mode: Words send automatically when you pause • No buttons needed
            </p>
          </div>
        </div>

        {/* Live Conversation Chat Scroll */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50">
          <div className="text-center my-1">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest bg-stone-200/60 px-3 py-1 rounded-full">
              Live Human Conversation Log
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-2xs font-sans text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-white text-stone-800 border border-teal-100/80 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase ${
                      msg.role === 'user' ? 'text-teal-200' : 'text-teal-700'
                    }`}
                  >
                    {msg.role === 'user' ? userName : 'Aura Voice Companion'}
                  </span>
                  <span
                    className={`text-[9px] ${
                      msg.role === 'user' ? 'text-teal-200/80' : 'text-stone-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
                <p className="font-medium text-base">"{msg.content}"</p>
                {msg.role === 'ai' && (
                  <button
                    onClick={() => speakText(msg.content, selectedVoice, selectedLang)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer border border-teal-200/80 shadow-2xs active:scale-95"
                    title="Listen to this response again"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>🔊 Listen Voice</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isAiThinking && (
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 p-3 rounded-2xl w-fit animate-pulse border border-teal-100">
              <Sparkles className="w-4 h-4 text-teal-500 animate-spin" />
              <span>Aura is composing a warm reply...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input Controls Bar */}
        <div className="p-3 bg-white border-t border-stone-200 shrink-0 space-y-2">
          {/* Quick Voice Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
              {selectedLang === 'te-IN' ? 'ఈలా అనండి:' : selectedLang === 'hi-IN' ? 'ऐसे बोलें:' : 'Try saying:'}
            </span>
            {(selectedLang === 'te-IN'
              ? [
                  "నాకు కడుపులో నొప్పిగా ఉంది",
                  "నా గుండెల్లో నొప్పిగా ఉంది",
                  "నాకు తలనొప్పిగా ఉంది",
                  "నా కాళ్ల నొప్పులు కొంచెం తగ్గాయి",
                  "నమస్కారం, ఈ రోజు నా ఆరోగ్యం బాగుంది",
                ]
              : selectedLang === 'hi-IN'
              ? [
                  "मुझे पेट में दर्द हो रहा है",
                  "मेरे सीने में दर्द है",
                  "मुझे सिरदर्द हो रहा है",
                  "नमस्ते, आज मुझे बहुत अच्छा लग रहा है",
                ]
              : [
                  "I have stomach pain",
                  "I have chest pain",
                  "I have a headache",
                  "I am feeling good today",
                ]
            ).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(prompt);
                  handleSendMessage(prompt);
                }}
                className="text-xs bg-stone-100 hover:bg-teal-50 text-stone-700 hover:text-teal-800 font-semibold px-3 py-1.5 rounded-full border border-stone-200 whitespace-nowrap transition-all cursor-pointer"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Speak naturally (auto-sends on pause) or type here..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isAiThinking}
              className="p-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                stopVoice();
                onClose();
              }}
              className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
