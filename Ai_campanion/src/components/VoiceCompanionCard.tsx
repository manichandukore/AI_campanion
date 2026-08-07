import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Plus, Volume2, VolumeX, PhoneCall, Sparkles, Activity, Loader2, Send, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { speakText, stopVoice, subscribeSpeaking, playAudioDataOrFallback } from '../utils/audioPlayer';
import { isStomachPainMentioned, isHeartPainMentioned } from '../utils/symptomDetector';
import { detectWakeWord } from '../utils/wakeWordDetector';
import { AppLanguage, t } from '../utils/translations';

interface VoiceCompanionCardProps {
  lastSpokenNote?: string;
  selectedLang?: 'auto' | 'te-IN' | 'hi-IN' | 'en-US';
  onLanguageChange?: (lang: 'auto' | 'te-IN' | 'hi-IN' | 'en-US') => void;
  onStartCheckIn: () => void;
  onStartVoiceCall?: () => void;
  onStomachPainAlert?: (userText: string) => void;
  onHeartPainAlert?: (userText: string) => void;
  currentLang?: AppLanguage;
  userName?: string;
}

export const VoiceCompanionCard: React.FC<VoiceCompanionCardProps> = ({
  lastSpokenNote = "Knee is slightly stiff, but slept deep last night.",
  selectedLang: propSelectedLang = 'te-IN',
  onLanguageChange,
  onStartCheckIn,
  onStartVoiceCall,
  onStomachPainAlert,
  onHeartPainAlert,
  currentLang = 'en',
  userName = 'Rajamma',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'auto' | 'te-IN' | 'hi-IN' | 'en-US'>(propSelectedLang);
  const [micError, setMicError] = useState<string | null>(null);
  const [siriTriggered, setSiriTriggered] = useState<string | null>(null);

  const recoRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  useEffect(() => {
    setSelectedLang(propSelectedLang);
  }, [propSelectedLang]);

  const handleLangSelect = (newLang: 'auto' | 'te-IN' | 'hi-IN' | 'en-US') => {
    setSelectedLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeSpeaking(setIsSpeaking);
    return () => {
      unsubscribe();
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recoRef.current) {
      try {
        recoRef.current.abort();
      } catch {}
      recoRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    stopVoice();
    stopListening();
    setMicError(null);
    setTranscript('');
    latestTranscriptRef.current = '';

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(() => {
            setIsListening(true);
            setTimeout(() => {
              let demo = "ఈ రోజు నా ఆరోగ్యం చాలా బాగుంది!";
              if (selectedLang === 'hi-IN') demo = "आज मुझे बहुत अच्छा लग रहा है।";
              if (selectedLang === 'en-US') demo = "Hello Aura, I am feeling calm and good today.";
              setTranscript(demo);
              latestTranscriptRef.current = demo;
              setIsListening(false);
              handleSendSpokenText(demo);
            }, 2500);
          })
          .catch(() => {
            setMicError("Microphone access denied. Please allow microphone permissions in your browser.");
          });
      } else {
        setMicError("Speech Recognition is not supported by your browser. Please try Chrome or Edge.");
      }
      return;
    }

    initCardReco(SpeechRecognition);
  };

  const initCardReco = (SpeechRecognition: any) => {
    try {
      const reco = new SpeechRecognition();
      reco.continuous = false;
      reco.interimResults = true;
      reco.lang = selectedLang === 'auto' ? (navigator.language || 'en-US') : selectedLang;

      reco.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      reco.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        if (fullTranscript) {
          setTranscript(fullTranscript);
          latestTranscriptRef.current = fullTranscript;

          const match = detectWakeWord(fullTranscript);
          if (match.isWakeWord) {
            setSiriTriggered(match.matchedWord || 'Siri');
          }

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (latestTranscriptRef.current.trim() && !isThinking) {
              stopListening();
              handleSendSpokenText(latestTranscriptRef.current.trim());
            }
          }, 1200);
        }
      };

      reco.onerror = (event: any) => {
        console.warn('Speech recognition event warning:', event);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicError("Microphone permission blocked. Please click the mic icon in browser settings to enable access.");
          setIsListening(false);
        } else if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      reco.onend = () => {
        recoRef.current = null;
        setIsListening(false);
        if (latestTranscriptRef.current.trim() && !isThinking) {
          const textToSend = latestTranscriptRef.current.trim();
          setTranscript('');
          latestTranscriptRef.current = '';
          handleSendSpokenText(textToSend);
        }
      };

      recoRef.current = reco;
      reco.start();
    } catch (err: any) {
      console.warn('Speech recognition initialization error:', err);
      setMicError("Unable to access microphone. Please check browser permissions.");
      setIsListening(false);
    }
  };

  const handleSendSpokenText = async (text: string) => {
    if (!text || !text.trim()) return;
    setIsThinking(true);
    stopVoice();

    if (isHeartPainMentioned(text) && onHeartPainAlert) {
      onHeartPainAlert(text);
    } else if (isStomachPainMentioned(text) && onStomachPainAlert) {
      onStomachPainAlert(text);
    }

    try {
      const res = await fetch('/api/chat/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          userName: userName,
          language: selectedLang,
          history: [],
        }),
      });

      const data = await res.json();
      const reply = data.replyText || "Haan Rajamma, I am right here with you!";
      setAiResponse(reply);

      playAudioDataOrFallback(data.audioBase64, reply, 24000, selectedLang);
    } catch (err) {
      console.error('Error fetching voice response:', err);
      const fallbackReply =
        selectedLang === 'te-IN'
          ? "రాజమ్మ గారు, నేను మీ మాటలు విన్నాను. ఈ రోజు మీరు ఎలా ఉన్నారు?"
          : "Haan Rajamma, I heard you! How are you feeling right now?";
      setAiResponse(fallbackReply);
      speakText(fallbackReply, 'Kore', selectedLang);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePlayVoice = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const textToSpeak = aiResponse || `Rajamma's last spoken note was: ${lastSpokenNote}`;
      speakText(textToSpeak, 'Kore', selectedLang);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-2xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Speaking Glow Effect */}
      {isSpeaking && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 animate-pulse" />
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {t(currentLang, 'voiceCompanionTitle')}
            </h3>
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full animate-pulse">
                <Activity className="w-3.5 h-3.5" /> SPEAKING
              </span>
            )}
            {isListening && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse">
                <Mic className="w-3.5 h-3.5" /> LISTENING
              </span>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full text-[11px] font-bold">
            {[
              { id: 'auto', label: '✨ Auto' },
              { id: 'te-IN', label: 'తెలుగు' },
              { id: 'hi-IN', label: 'हिंदी' },
              { id: 'en-US', label: 'EN' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  handleLangSelect(lang.id as any);
                  stopListening();
                  stopVoice();
                }}
                className={`px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                  selectedLang === lang.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empathetic Persona Active Badge */}
        <div className="flex items-center justify-between bg-purple-50/80 border border-purple-100 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-900">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Persona: Aura ({t(currentLang, 'voiceCompanionSubtitle')})</span>
          </div>
        </div>
      </div>

      {/* Mic Access Error Alert */}
      {micError && (
        <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{micError}</p>
            <button
              onClick={startListening}
              className="mt-1.5 px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-extrabold text-[11px] text-amber-900 transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry Microphone Access
            </button>
          </div>
        </div>
      )}

      {/* Interactive Soundwave / Audio Player Box */}
      <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-100 my-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMic}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-[#f0ebfe] text-[#7c3aed] hover:bg-[#e4d8fe]'
              }`}
              title={isListening ? "Stop Microphone" : "Speak to Aura Voice Companion"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div>
              <span className="text-[10px] font-black text-purple-600 tracking-wider uppercase block">
                {aiResponse ? "LATEST AI VOICE REPLY" : "LAST SPOKEN NOTE"}
              </span>
              <span className="text-[11px] font-semibold text-gray-400">
                {isListening ? "Listening continuously..." : isThinking ? "Aura is thinking..." : "Gemini Voice OS"}
              </span>
            </div>
          </div>

          {/* Speaker Audio Trigger Button */}
          <button
            onClick={handlePlayVoice}
            disabled={isThinking}
            className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isSpeaking
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50'
            }`}
            title={isSpeaking ? "Stop Voice" : "Listen to Voice Response"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t(currentLang, 'stopBriefing')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{t(currentLang, 'voiceBriefing')}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Speech Recognition Transcript Preview */}
        {isListening && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 animate-pulse">
            <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">
              🎙️ Live Transcribing Speech:
            </span>
            <p className="text-xs text-rose-950 font-bold italic">
              {transcript || "Speak naturally... (e.g. 'ఈ రోజు నా ఆరోగ్యం బాగుంది')"}
            </p>
          </div>
        )}

        {/* AI Thinking Loader */}
        {isThinking && (
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs font-bold text-purple-800">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Aura is composing a warm voice reply...</span>
          </div>
        )}

        {/* Animated Soundwave Visualization when speaking */}
        {isSpeaking ? (
          <div className="flex items-center justify-center gap-1.5 h-8 bg-teal-50 rounded-xl px-4 py-1 border border-teal-100">
            <span className="w-1 bg-teal-500 rounded-full h-3 animate-[bounce_1s_infinite_100ms]" />
            <span className="w-1 bg-teal-600 rounded-full h-6 animate-[bounce_1s_infinite_200ms]" />
            <span className="w-1 bg-emerald-500 rounded-full h-4 animate-[bounce_1s_infinite_300ms]" />
            <span className="w-1 bg-teal-500 rounded-full h-7 animate-[bounce_1s_infinite_400ms]" />
            <span className="w-1 bg-teal-400 rounded-full h-3 animate-[bounce_1s_infinite_150ms]" />
            <span className="w-1 bg-emerald-600 rounded-full h-5 animate-[bounce_1s_infinite_250ms]" />
            <span className="text-xs font-bold text-teal-800 ml-2 font-mono">Playing Voice...</span>
          </div>
        ) : !isListening && !isThinking ? (
          <p className="text-xs text-gray-800 font-semibold italic leading-relaxed pt-1">
            “{aiResponse || lastSpokenNote}”
          </p>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-3">
        {onStartVoiceCall && (
          <button
            onClick={onStartVoiceCall}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 stroke-[2.5] animate-pulse text-amber-300" />
            <span>{t(currentLang, 'startVoiceCall')}</span>
          </button>
        )}

        <button
          onClick={onStartCheckIn}
          className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{t(currentLang, 'newCheckIn')}</span>
        </button>
      </div>
    </div>
  );
};

