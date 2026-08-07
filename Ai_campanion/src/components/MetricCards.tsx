import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clock, Smile, Pill, CheckCircle, BellRing, Settings, Sparkles } from 'lucide-react';
import { MedicationNotificationModal } from './MedicationNotificationModal';
import { AppLanguage, t } from '../utils/translations';

interface MetricCardsProps {
  overallWellness: string;
  wellnessSubtext: string;
  lastCheckinTime: string;
  lastCheckinSubtext: string;
  moodStatus: string;
  moodSubtext: string;
  nextActivity: string;
  nextActivitySubtext: string;
  onMedicationAcknowledged?: (time: string) => void;
  currentLang?: AppLanguage;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  overallWellness,
  wellnessSubtext,
  lastCheckinTime,
  lastCheckinSubtext,
  moodStatus,
  moodSubtext,
  nextActivity,
  nextActivitySubtext,
  onMedicationAcknowledged,
  currentLang = 'en',
}) => {
  // Extract time from nextActivity if available (e.g. "4:00 PM Medication" -> "4:00 PM")
  const defaultTime = nextActivity.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i)?.[0] || '4:00 PM';

  const [scheduledTime, setScheduledTime] = useState<string>(defaultTime);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [acknowledgedAt, setAcknowledgedAt] = useState<string>('');
  const [isEditingTime, setIsEditingTime] = useState<boolean>(false);

  const triggeredMinuteRef = useRef<string>('');

  // Update current system time every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format as 12-hour time e.g. "4:00 PM" or "11:08 AM"
      const formatted = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      setCurrentTimeStr(formatted);

      // Normalize strings for robust matching (e.g. "04:00 PM" vs "4:00 PM")
      const normCurrent = formatted.replace(/^0/, '').toLowerCase().trim();
      const normScheduled = scheduledTime.replace(/^0/, '').toLowerCase().trim();

      // Check if current system time matches scheduled time
      if (
        normCurrent === normScheduled &&
        triggeredMinuteRef.current !== formatted &&
        !isAcknowledged
      ) {
        triggeredMinuteRef.current = formatted;
        setIsPopupOpen(true);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [scheduledTime, isAcknowledged]);

  const handleAcknowledge = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    setIsAcknowledged(true);
    setAcknowledgedAt(nowTime);
    setIsPopupOpen(false);

    if (onMedicationAcknowledged) {
      onMedicationAcknowledged(nowTime);
    }
  };

  const handleSetTimeToNow = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    setScheduledTime(nowTime);
    setIsAcknowledged(false);
    triggeredMinuteRef.current = '';
    setIsEditingTime(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Overall Wellness */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:border-emerald-200">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              {t(currentLang, 'overallWellness')}
            </span>
            <h3 className="text-base font-extrabold text-gray-900 leading-snug">
              {currentLang === 'te' ? 'మంచి స్థితిలో ఉన్నారు' : currentLang === 'hi' ? 'अच्छी स्थिति' : overallWellness}
            </h3>
            <p className="text-xs text-gray-400 font-normal mt-0.5">
              {currentLang === 'te' ? 'ఎలాంటి సమస్యాత్మక మార్పులు లేవు' : currentLang === 'hi' ? 'कोई गंभीर बदलाव नहीं' : wellnessSubtext}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Last Check-In */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:border-purple-200">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              {t(currentLang, 'lastCheckin')}
            </span>
            <h3 className="text-base font-extrabold text-gray-900 leading-snug">
              {lastCheckinTime} {t(currentLang, 'ago')}
            </h3>
            <p className="text-xs text-gray-400 font-normal mt-0.5">
              {t(currentLang, 'sleptDeepReportedGood')}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Mood Status */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:border-emerald-200">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              {t(currentLang, 'moodStatusLabel')}
            </span>
            <h3 className="text-base font-extrabold text-gray-900 leading-snug">
              {t(currentLang, 'happyAndCalm')}
            </h3>
            <p className="text-xs text-gray-400 font-normal mt-0.5">
              {t(currentLang, 'highEngagementNote')}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Smile className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4: Next Activity / Take Medication Monitor */}
        <div className={`rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
          isAcknowledged
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-white border-amber-200 shadow-xs hover:border-amber-300'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                {t(currentLang, 'nextActivity')}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </span>

              {/* Status Badge or Edit Time */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditingTime(!isEditingTime)}
                  className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                  title="Change scheduled medication time"
                >
                  {isEditingTime ? t(currentLang, 'done') : t(currentLang, 'editTime')}
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 leading-snug flex items-center gap-1.5">
                  {isAcknowledged ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      {t(currentLang, 'medicationTaken')} <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                    </span>
                  ) : (
                    <span>{scheduledTime} {t(currentLang, 'medication')}</span>
                  )}
                </h3>

                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  {isAcknowledged
                    ? `${t(currentLang, 'loggedAt')} ${acknowledgedAt}`
                    : t(currentLang, 'bloodPressurePill')}
                </p>
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isAcknowledged ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'
              }`}>
                <Pill className="w-4 h-4" />
              </div>
            </div>

            {/* Editing schedule time row */}
            {isEditingTime && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/80 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Scheduled Time:</span>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => {
                      setScheduledTime(e.target.value);
                      setIsAcknowledged(false);
                    }}
                    placeholder="e.g. 4:00 PM"
                    className="w-24 px-2 py-0.5 bg-white border border-gray-300 rounded-md text-xs text-right font-bold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <button
                  onClick={handleSetTimeToNow}
                  className="w-full py-1 text-[11px] bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {t(currentLang, 'syncToSystemTime')} ({currentTimeStr})
                </button>
              </div>
            )}
          </div>

          {/* Interactive Trigger & System Clock Status Bar */}
          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-400 font-mono text-[10px]">
              Clock: <span className="font-semibold text-stone-700">{currentTimeStr}</span>
            </span>

            <button
              onClick={() => {
                triggeredMinuteRef.current = currentTimeStr;
                setIsPopupOpen(true);
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              title="Trigger Take Medication Popup Alert"
            >
              <BellRing className="w-3 h-3 animate-bounce" />
              <span>{t(currentLang, 'testAlert')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Take Medication Notification Modal */}
      <MedicationNotificationModal
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onAcknowledge={handleAcknowledge}
        medicationName={nextActivitySubtext || 'Blood pressure pill (10mg)'}
        scheduledTime={scheduledTime}
        userName="Rajamma"
      />
    </>
  );
};
