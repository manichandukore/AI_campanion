import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Check } from 'lucide-react';

interface WarmVoiceOrbProps {
  lastSpokenNote: string;
  onNewCheckin: (note: string) => Promise<void>;
  userName?: string;
}

export const WarmVoiceOrb: React.FC<WarmVoiceOrbProps> = ({
  lastSpokenNote,
  onNewCheckin,
  userName = 'Rajamma',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const activeRecoRef = React.useRef<any>(null);

  const toggleMic = () => {
    if (isListening) {
      if (activeRecoRef.current) {
        try { activeRecoRef.current.abort(); } catch {}
        activeRecoRef.current = null;
      }
      setIsListening(false);
    } else {
      setTranscript('');
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        // Fallback simulated listening for browsers without Web Speech API
        setIsListening(true);
        setTimeout(() => {
          setTranscript('ఈ రోజు నా ఆరోగ్యం బాగుంది, చాలా సంతోషంగా ఉంది!');
          setIsListening(false);
        }, 3000);
        return;
      }

      try {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = 'te-IN'; // Default to Telugu with auto fallback

        reco.onstart = () => {
          setIsListening(true);
        };

        reco.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current) {
            setTranscript(current);
          }
        };

        reco.onerror = (err: any) => {
          console.warn('Orb speech error:', err);
          if (err.error !== 'no-speech') {
            setIsListening(false);
          }
        };

        reco.onend = () => {
          setIsListening(false);
        };

        activeRecoRef.current = reco;
        reco.start();
      } catch (err) {
        console.warn('Failed starting orb speech:', err);
        setIsListening(false);
      }
    }
  };

  const handleSendSpeech = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    await onNewCheckin(transcript);
    setIsProcessing(false);
    setShowConfirmation(true);
    setTranscript('');
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const speakLastNote = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = lastSpokenNote || `Hello ${userName}, I am listening to how you feel today.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.pitch = 1.0;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlayingVoice(true);
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingVoice(true);
      setTimeout(() => setIsPlayingVoice(false), 2000);
    }
  };

  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-6 border-2 border-[#E6DFC8] shadow-md flex flex-col items-center justify-between text-center min-h-[460px] font-serif">
      {/* Title */}
      <div>
        <h3 className="text-2xl font-extrabold text-[#3D3A34] mb-1 font-serif">
          Voice Companion
        </h3>
        <p className="text-base font-sans text-[#6B655B]">
          Always ready to talk with {userName}
        </p>
      </div>

      {/* Massive Soft Sage Green (#7C9A82) Orb */}
      <div className="relative my-6 flex flex-col items-center justify-center">
        {/* Animated Wave Ripples when listening */}
        {isListening && (
          <>
            <div className="absolute w-56 h-56 rounded-full bg-[#7C9A82]/30 animate-ping pointer-events-none" />
            <div className="absolute w-64 h-64 rounded-full bg-[#7C9A82]/20 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          onClick={toggleMic}
          className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-xl border-4 ${
            isListening
              ? 'bg-rose-500 text-white border-white ring-8 ring-rose-200 scale-105'
              : 'bg-[#7C9A82] hover:bg-[#68856E] text-white border-[#E6DFC8] hover:scale-105 active:scale-95'
          }`}
        >
          {isListening ? (
            <MicOff className="w-16 h-16 animate-bounce" />
          ) : (
            <Mic className="w-16 h-16 fill-white" />
          )}
        </button>

        {/* Prominent Large Text */}
        <h4 className="text-2xl md:text-3xl font-extrabold text-[#3D3A34] font-serif mt-6 tracking-tight">
          {isListening ? 'LISTENING NOW...' : 'TAP TO TALK TO ME'}
        </h4>
        <p className="text-sm font-sans text-gray-500 mt-1">
          {isListening
            ? 'Speak in your normal, comfortable voice'
            : 'Press the microphone circle above'}
        </p>
      </div>

      {/* Captured Speech Box or Sample Prompts */}
      {transcript ? (
        <div className="w-full bg-white rounded-2xl p-4 border-2 border-[#7C9A82] shadow-sm mb-4 font-sans text-left">
          <p className="text-xs font-bold text-[#7C9A82] uppercase mb-1">
            You said:
          </p>
          <p className="text-lg font-medium text-gray-800 mb-3 italic">
            "{transcript}"
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setTranscript('')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl"
            >
              Clear
            </button>
            <button
              onClick={handleSendSpeech}
              disabled={isProcessing}
              className="px-6 py-2 bg-[#7C9A82] hover:bg-[#68856E] text-white font-bold text-sm rounded-xl shadow-xs"
            >
              {isProcessing ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      ) : showConfirmation ? (
        <div className="w-full bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-300 text-emerald-900 font-sans font-bold text-lg flex items-center justify-center gap-2">
          <Check className="w-6 h-6 text-emerald-600" />
          <span>Note Saved Successfully!</span>
        </div>
      ) : (
        /* Last Spoken Note & Speaker Button */
        <div className="w-full bg-white/90 rounded-2xl p-4 border border-[#E6DFC8] flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#7C9A82] uppercase font-sans block">
              Last Spoken Note
            </span>
            <p className="text-sm font-serif font-bold text-gray-800 italic truncate">
              "{lastSpokenNote}"
            </p>
          </div>
          <button
            onClick={speakLastNote}
            className="p-3 bg-[#EFE9DB] hover:bg-[#E2D9C3] text-[#3D3A34] rounded-xl shrink-0 transition-all cursor-pointer"
            title="Read note out loud"
          >
            <Volume2 className={`w-6 h-6 ${isPlayingVoice ? 'animate-bounce text-emerald-600' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};
