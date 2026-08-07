import React, { useEffect, useState } from 'react';
import { Pill, CheckCircle2, Clock, Volume2, VolumeX, AlertCircle, Sparkles, Bell, ShieldCheck, X } from 'lucide-react';
import { speakText, stopVoice } from '../utils/audioPlayer';

interface MedicationNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  medicationName?: string;
  scheduledTime?: string;
  userName?: string;
}

export const MedicationNotificationModal: React.FC<MedicationNotificationModalProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
  medicationName = 'Blood pressure pill (10mg)',
  scheduledTime = '4:00 PM',
  userName = 'Rajamma',
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    if (isOpen && !isMuted) {
      const audioPrompt = `Namaste ${userName}, it is ${scheduledTime}. Please take your scheduled medication: ${medicationName}.`;
      speakText(audioPrompt, 'Kore', 'en-US');
    }
    return () => {
      stopVoice();
    };
  }, [isOpen, isMuted, userName, scheduledTime, medicationName]);

  if (!isOpen) return null;

  const handleAcknowledge = () => {
    stopVoice();
    speakText(`Thank you ${userName}. Your medication has been logged as taken.`, 'Kore', 'en-US');
    onAcknowledge();
  };

  const handleSnooze = () => {
    stopVoice();
    setSnoozed(true);
    speakText('Remind me in 5 minutes enabled.', 'Kore', 'en-US');
    setTimeout(() => {
      onClose();
      setSnoozed(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300 relative overflow-hidden animate-scale-up">
        {/* Animated Background Pulse Header */}
        <div className="bg-amber-500 -mx-6 -mt-6 p-5 text-white flex items-center justify-between mb-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-amber-500 to-orange-500 opacity-90" />
          
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner animate-bounce">
              <Pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-amber-100">
                  SCHEDULED ALERT
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight mt-0.5">
                Take Medication Now!
              </h3>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1">
            <button
              onClick={() => {
                if (!isMuted) stopVoice();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Card Content */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Scheduled Time: {scheduledTime}
            </span>
            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              Due Now
            </span>
          </div>

          <h4 className="text-lg font-black text-gray-900 leading-snug flex items-center gap-2">
            {medicationName}
          </h4>

          <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900/80">
            <span className="flex items-center gap-1 font-medium">
              💧 Take with a full glass of water after meal
            </span>
          </div>
        </div>

        {/* Friendly AI Audio Reminder Banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 mb-5 flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-emerald-900 leading-relaxed">
            AI Companion Note: <span className="font-semibold">"Rajamma, taking your blood pressure pill at {scheduledTime} keeps your cardiovascular baseline steady."</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Main Acknowledgement Button */}
          <button
            onClick={handleAcknowledge}
            className="w-full py-4 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer ring-4 ring-emerald-100"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-100" />
            <span>I HAVE TAKEN MY MEDICATION</span>
          </button>

          {/* Snooze button */}
          <button
            onClick={handleSnooze}
            disabled={snoozed}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 active:scale-98 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200"
          >
            <Bell className="w-4 h-4 text-stone-500" />
            <span>{snoozed ? 'Snoozed for 5 minutes...' : 'Remind Me in 5 Minutes (Snooze)'}</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Care Circle & Relative Dashboard will log this response automatically</span>
        </p>
      </div>
    </div>
  );
};
