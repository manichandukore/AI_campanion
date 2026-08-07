import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { Contact } from '../types';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  contacts,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isDispatched, setIsDispatched] = useState(false);

  // Play audio beep during countdown using Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // ignore web audio limitations
    }
  };

  useEffect(() => {
    let timer: any;
    if (isOpen && !isDispatched) {
      setCountdown(5);
      playBeep();

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsDispatched(true);
            return 0;
          }
          playBeep();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isDispatched]);

  if (!isOpen) return null;

  const handleManualDispatch = () => {
    setIsDispatched(true);
  };

  const handleReset = () => {
    setIsDispatched(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 border-4 border-red-500 shadow-2xl text-center relative overflow-hidden">
        {/* Cancel X button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {!isDispatched ? (
          <div>
            {/* Header Icon */}
            <div className="w-24 h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-200 animate-bounce">
              <AlertTriangle className="w-14 h-14" />
            </div>

            <h2 className="text-3xl font-extrabold text-red-600 mb-2 font-serif tracking-tight">
              EMERGENCY ASSIST
            </h2>
            <p className="text-base font-bold text-gray-700 mb-6 font-sans">
              Sending SOS alert to Care Circle in:
            </p>

            {/* Huge Senior-Readable Countdown Timer Circle */}
            <div className="w-32 h-32 rounded-full bg-red-600 text-white font-black text-6xl flex items-center justify-center mx-auto mb-8 shadow-xl ring-8 ring-red-300">
              {countdown}s
            </div>

            {/* Contacts Being Alerted */}
            <div className="bg-red-50 rounded-2xl p-4 mb-8 text-left border border-red-200">
              <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">
                Notifying Contacts Immediately:
              </p>
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm font-bold text-gray-800">
                    <span className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-red-600" />
                      {c.name} ({c.role})
                    </span>
                    <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-mono">
                      {c.phone}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleReset}
                className="py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-extrabold text-lg rounded-2xl transition-all cursor-pointer shadow-md"
              >
                CANCEL SOS
              </button>
              <button
                onClick={handleManualDispatch}
                className="py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg rounded-2xl transition-all cursor-pointer shadow-lg animate-pulse"
              >
                SEND NOW!
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-serif">
              SOS Alert Sent!
            </h2>
            <p className="text-lg text-gray-700 font-semibold mb-6">
              Suresh Dev (Son) & Dr. Roy Pillai have been notified with your GPS location.
            </p>

            <div className="bg-emerald-50 rounded-2xl p-4 mb-8 border border-emerald-200 text-left">
              <p className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                Live Emergency Line Connected
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Stay calm, Rajamma. Help is on the way. Keep your phone nearby.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              I am Safe Now (Dismiss)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
