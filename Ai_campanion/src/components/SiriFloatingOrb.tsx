import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, Radio, PhoneCall } from 'lucide-react';
import { detectWakeWord } from '../utils/wakeWordDetector';

interface SiriFloatingOrbProps {
  onOpenVoiceCall: (initialQuery?: string) => void;
  userName?: string;
  isVoiceCallOpen?: boolean;
}

export const SiriFloatingOrb: React.FC<SiriFloatingOrbProps> = ({
  onOpenVoiceCall,
  userName = 'Rajamma',
  isVoiceCallOpen = false,
}) => {
  const [isWakeWordActive, setIsWakeWordActive] = useState(true);
  const [lastDetectedPhrase, setLastDetectedPhrase] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState(true);

  const recoRef = useRef<any>(null);
  const isWakeWordActiveRef = useRef(isWakeWordActive);
  const isVoiceCallOpenRef = useRef(isVoiceCallOpen);
  const onOpenVoiceCallRef = useRef(onOpenVoiceCall);

  useEffect(() => {
    isWakeWordActiveRef.current = isWakeWordActive;
  }, [isWakeWordActive]);

  useEffect(() => {
    isVoiceCallOpenRef.current = isVoiceCallOpen;
  }, [isVoiceCallOpen]);

  useEffect(() => {
    onOpenVoiceCallRef.current = onOpenVoiceCall;
  }, [onOpenVoiceCall]);

  // Background listener for 'Siri' / 'Hey Siri' wake word
  useEffect(() => {
    if (!isWakeWordActive || isVoiceCallOpen) {
      if (recoRef.current) {
        try {
          recoRef.current.abort();
        } catch {}
        recoRef.current = null;
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasMicPermission(false);
      return;
    }

    let isComponentMounted = true;

    const startWakeListener = () => {
      if (!isComponentMounted || !isWakeWordActiveRef.current || isVoiceCallOpenRef.current) return;

      try {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = navigator.language || 'en-US';

        reco.onstart = () => {
          setHasMicPermission(true);
        };

        reco.onresult = (event: any) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + ' ';
          }

          if (fullText) {
            const match = detectWakeWord(fullText);
            if (match.isWakeWord) {
              setLastDetectedPhrase(match.matchedWord || 'Siri');
              
              // Extract clean query or pass undefined if it's just the wake word
              const queryToSend = (match.cleanQuery && match.cleanQuery.toLowerCase() !== match.matchedWord?.toLowerCase())
                ? match.cleanQuery
                : undefined;

              onOpenVoiceCallRef.current(queryToSend);

              try {
                reco.abort();
              } catch {}
            }
          }
        };

        reco.onerror = (e: any) => {
          if (e.error === 'not-allowed' || e.error === 'permission-denied') {
            setHasMicPermission(false);
            setIsWakeWordActive(false);
            isComponentMounted = false;
          }
        };

        reco.onend = () => {
          recoRef.current = null;
          // Auto-restart background listener if wake mode is active and call modal is closed
          if (isComponentMounted && isWakeWordActiveRef.current && !isVoiceCallOpenRef.current) {
            setTimeout(() => {
              if (isComponentMounted && isWakeWordActiveRef.current && !isVoiceCallOpenRef.current && !recoRef.current) {
                startWakeListener();
              }
            }, 300);
          }
        };

        recoRef.current = reco;
        reco.start();
      } catch (err) {
        console.warn('Siri wake word background listener start error:', err);
      }
    };

    startWakeListener();

    return () => {
      isComponentMounted = false;
      if (recoRef.current) {
        try {
          recoRef.current.abort();
        } catch {}
        recoRef.current = null;
      }
    };
  }, [isWakeWordActive, isVoiceCallOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 font-sans">
      {/* Siri Wake Word Popup Notification Badge */}
      {lastDetectedPhrase && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-purple-400/40 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="text-xs font-black">
            ⚡ '{lastDetectedPhrase}' Wake Word Detected!
          </span>
        </div>
      )}

      {/* Main Siri / Voice Companion Floating Trigger Orb */}
      <div className="relative group flex items-center gap-3 bg-white/90 backdrop-blur-md p-2 pl-4 rounded-full shadow-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
        
        {/* Wake Word Siri Toggle Switch */}
        <button
          onClick={() => {
            setIsWakeWordActive((prev) => !prev);
            setLastDetectedPhrase(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isWakeWordActive
              ? 'bg-purple-600 text-white shadow-sm animate-pulse'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
          title="Toggle 'Hey Siri' background listener"
        >
          <Radio className={`w-3.5 h-3.5 ${isWakeWordActive ? 'animate-ping' : ''}`} />
          <span>{isWakeWordActive ? "Siri Listening..." : "'Hey Siri' Wake Mode"}</span>
        </button>

        {/* Big Glowing Orb Button to Open Voice Companion */}
        <button
          onClick={() => {
            setLastDetectedPhrase(null);
            onOpenVoiceCall();
          }}
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer overflow-hidden border-2 border-white ring-4 ring-purple-200"
          title="Open Siri / Aura Voice Companion Live Call"
        >
          {/* Internal Glow Animation */}
          <span className="absolute inset-0 bg-white/20 rounded-full animate-ping pointer-events-none" />
          <Mic className="w-6 h-6 text-white z-10" />
        </button>
      </div>
    </div>
  );
};
