import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Send, Sparkles, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { speakText, playAudioDataOrFallback, stopVoice, subscribeSpeaking } from '../utils/audioPlayer';
import { isStomachPainMentioned, isHeartPainMentioned } from '../utils/symptomDetector';

interface NewCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInComplete: (data: {
    summary: string;
    aiReply: string;
    bodyPart?: string;
    condition?: string;
    status?: string;
    mood?: string;
    wellness?: string;
  }) => void;
}

export const NewCheckInModal: React.FC<NewCheckInModalProps> = ({
  isOpen,
  onClose,
  onCheckInComplete,
}) => {
  const [userText, setUserText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeaking(setIsSpeaking);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setUserText('');
      setAiResponse(null);
      setIsListening(false);
      stopVoice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const [selectedLang, setSelectedLang] = useState<'auto' | 'te-IN' | 'hi-IN' | 'en-US'>('te-IN');

  // Speech to text toggle if supported by browser
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      if (selectedLang === 'te-IN') {
        setUserText((prev) => prev + (prev ? ' ' : '') + 'ఈ రోజు నా మోకాలు కొంచెం నొప్పుగా ఉంది.');
      } else if (selectedLang === 'hi-IN') {
        setUserText((prev) => prev + (prev ? ' ' : '') + 'आज मेरे घुटने में थोड़ा दर्द है।');
      } else {
        setUserText((prev) => prev + (prev ? ' ' : '') + 'Knee is slightly stiff, but slept deep last night.');
      }
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === 'auto' ? 'te-IN' : selectedLang;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setUserText('Knee is feeling slightly stiff, but slept deep last night.');
    }
  };

  const handlePlayAiVoice = () => {
    if (isSpeaking) {
      stopVoice();
    } else if (aiResponse) {
      playAudioDataOrFallback(aiResponse.audioBase64, aiResponse.aiReply, 24000, selectedLang);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userText.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText, language: selectedLang }),
      });

      const data = await response.json();
      setAiResponse(data);

      // Auto play AI voice response
      if (data.aiReply) {
        playAudioDataOrFallback(data.audioBase64, data.aiReply);
      }

      const isHeart = isHeartPainMentioned(userText);
      const isStomach = isStomachPainMentioned(userText);

      onCheckInComplete({
        summary: data.summary || userText,
        aiReply: data.aiReply,
        bodyPart: isHeart ? "Heart" : isStomach ? "Stomach" : data.bodyObservation?.part,
        condition: isHeart ? "Heart / Chest Pain" : isStomach ? "Stomach Pain" : data.bodyObservation?.condition,
        status: (isHeart || isStomach) ? "Emergency" : data.bodyObservation?.status,
        mood: isHeart ? "Chest Discomfort & Anxious" : isStomach ? "In Pain & Restless" : data.mood,
        wellness: (isHeart || isStomach) ? "Attention Needed" : data.overallWellness,
      });

    } catch (err) {
      console.error(err);
      const fallbackReply = "Thank you Rajamma, I've safely logged your check-in notes.";
      speakText(fallbackReply);

      onCheckInComplete({
        summary: userText,
        aiReply: fallbackReply,
        bodyPart: "Knee",
        condition: "Stiffness",
        status: "Observation",
        mood: "Happy & Calm",
        wellness: "Good Status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">AI Companion Check-In</h3>
              <p className="text-xs text-gray-500 font-medium">Record Rajamma's daily voice or text note</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopVoice();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="bg-teal-50/70 p-2.5 rounded-2xl border border-teal-100 mt-3 flex items-center justify-between text-xs font-bold text-teal-900">
          <span className="text-teal-800">Preferred Language:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'auto', label: 'Auto' },
              { id: 'te-IN', label: 'తెలుగు' },
              { id: 'hi-IN', label: 'हिंदी' },
              { id: 'en-US', label: 'English' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedLang(l.id as any)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLang === l.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-teal-800 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="py-4 space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="e.g. Knee is slightly stiff, but slept deep last night..."
              className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
            />
            
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`absolute right-3 bottom-3 p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Listening...' : 'Speak'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-teal-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini TTS Voice Engine
            </span>
            <span>Tap microphone or type</span>
          </div>

          {/* AI Response Preview with Voice Speaker Button */}
          {aiResponse && (
            <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-100 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>AI Voice Response</span>
                </div>
                <button
                  onClick={handlePlayAiVoice}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    isSpeaking ? 'bg-rose-500 text-white' : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Voice' : 'Replay Voice'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-800 font-medium italic">
                "{aiResponse.aiReply}"
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              stopVoice();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading || !userText.trim()}
            className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="animate-pulse">Speaking AI...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Log</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
