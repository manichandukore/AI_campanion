import React, { useState, useEffect } from 'react';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { speakText, stopVoice, subscribeSpeaking } from '../utils/audioPlayer';
import { LanguageSelector } from './LanguageSelector';
import { AppLanguage, t } from '../utils/translations';

interface HeaderBannerProps {
  userName?: string;
  score?: number;
  monitoringDays?: number;
  onOpenSOS?: () => void;
  currentLang?: AppLanguage;
  onSelectLang?: (lang: AppLanguage) => void;
  onLanguageChange?: (lang: AppLanguage) => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  userName = 'Rajamma',
  score = 87,
  monitoringDays = 143,
  onOpenSOS,
  currentLang = 'en',
  onSelectLang,
  onLanguageChange,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const handleLangChange = onLanguageChange || onSelectLang;

  useEffect(() => {
    const unsubscribe = subscribeSpeaking(setIsSpeaking);
    return () => unsubscribe();
  }, []);

  const handleVoiceBriefing = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      let briefingText = `Good morning ${userName}! Today your overall wellness score is ${score} out of 100. AI Companion has been monitoring safely for ${monitoringDays} days.`;
      if (currentLang === 'te') {
        briefingText = `శుభోదయం ${userName} గారు! ఈ రోజు మీ ఆరోగ్య స్కోరు 100 కి ${score}. AI సహాయకుడు మిమ్మల్ని 143 రోజులుగా సురక్షితంగా పర్యవేక్షిస్తోంది.`;
      } else if (currentLang === 'hi') {
        briefingText = `सुप्रभात ${userName}! आज आपका स्वास्थ्य स्कोर 100 में से ${score} है। एआई साथी 143 दिनों से आपकी सुरक्षा कर रहा है।`;
      }
      speakText(briefingText);
    }
  };

  return (
    <div className="bg-[#f0ebfe] rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs border border-purple-100/60 relative overflow-hidden">
      {/* Decorative subtle background gradient */}
      <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />
      
      <div className="space-y-1.5 z-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t(currentLang, 'goodMorning')}, {userName}
          </h2>
          <button
            onClick={handleVoiceBriefing}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-purple-200 text-purple-900 hover:bg-purple-300'
            }`}
            title="Listen to AI Morning Briefing"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-700" />}
            <span className="inline">{isSpeaking ? t(currentLang, 'stopBriefing') : t(currentLang, 'voiceBriefing')}</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5 flex-wrap">
          <span>{t(currentLang, 'todayIs')}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-gray-400" />
          <span>{t(currentLang, 'safelyMonitoring')} {monitoringDays} {t(currentLang, 'days')}.</span>
        </p>
      </div>

      {/* Right Controls: Language Selector, Emergency Assist Button & Wellness Score Badge */}
      <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto justify-between md:justify-end">
        {handleLangChange && (
          <LanguageSelector currentLang={currentLang} onSelectLang={handleLangChange} />
        )}

        {onOpenSOS && (
          <button
            onClick={onOpenSOS}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md border-b-2 border-red-800 transition-all flex items-center gap-2 cursor-pointer animate-pulse shrink-0"
          >
            <AlertTriangle className="w-4 h-4 fill-white stroke-red-600" />
            <span>{t(currentLang, 'emergencyAssist')}</span>
          </button>
        )}

        {/* Wellness Score Badge */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-emerald-500 bg-white flex flex-col items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
            <span className="text-lg sm:text-xl font-black text-gray-900 leading-none tracking-tight">
              {score}
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-teal-600 tracking-wider uppercase mt-0.5">
              {t(currentLang, 'score')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
