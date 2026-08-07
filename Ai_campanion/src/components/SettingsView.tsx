import React, { useState } from 'react';
import { Settings, Bell, Volume2, Globe, User, Check, Languages } from 'lucide-react';
import { AppLanguage, t } from '../utils/translations';
import { LanguageSelector } from './LanguageSelector';

interface SettingsViewProps {
  userName?: string;
  onUserNameChange?: (name: string) => void;
  companionLang?: 'auto' | 'te-IN' | 'hi-IN' | 'en-US';
  onLanguageChange?: (lang: 'auto' | 'te-IN' | 'hi-IN' | 'en-US') => void;
  currentLang?: AppLanguage;
  onAppLanguageChange?: (lang: AppLanguage) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userName = 'Rajamma',
  onUserNameChange,
  companionLang = 'te-IN',
  onLanguageChange,
  currentLang = 'en',
  onAppLanguageChange,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [selectedLang, setSelectedLang] = useState<'auto' | 'te-IN' | 'hi-IN' | 'en-US'>(companionLang);
  const [voiceSpeed, setVoiceSpeed] = useState('Normal');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoCheckinTime, setAutoCheckinTime] = useState('8:00 AM');
  const [saved, setSaved] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameInput(val);
    if (onUserNameChange) {
      onUserNameChange(val);
    }
  };

  const handleLangChange = (lang: 'auto' | 'te-IN' | 'hi-IN' | 'en-US') => {
    setSelectedLang(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleSave = () => {
    if (onUserNameChange && nameInput.trim()) {
      onUserNameChange(nameInput.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const languages = [
    {
      id: 'te-IN' as const,
      name: 'తెలుగు (Telugu)',
      native: 'తెలుగు సంభాషణ',
      flag: '🇮🇳',
      desc: 'Web Speech API listens in te-IN, Aura LLM responds natively in Telugu script.',
    },
    {
      id: 'hi-IN' as const,
      name: 'हिंदी (Hindi)',
      native: 'हिंदी बातचीत',
      flag: '🇮🇳',
      desc: 'Web Speech API listens in hi-IN, Aura LLM responds natively in Devanagari Hindi.',
    },
    {
      id: 'en-US' as const,
      name: 'English',
      native: 'English Conversation',
      flag: '🌐',
      desc: 'Web Speech API listens in en-US, Aura LLM responds in warm, gentle English.',
    },
    {
      id: 'auto' as const,
      name: '✨ Auto-Detect',
      native: 'స్వయంచాలకం / स्वचालित',
      flag: '🌏',
      desc: 'Automatically identifies spoken language and replies in matching language.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="bg-[#f0ebfe] rounded-3xl p-6 border border-purple-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">AI Companion Settings</h2>
          <p className="text-sm text-gray-600 font-medium mt-1">
            Configure {nameInput || 'User'}'s voice language preference, user name, and companion settings
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-md">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-2xs space-y-6">
        {/* User Name & Profile Customization */}
        <div className="space-y-3 pb-5 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" /> Senior Profile & Greeting Name
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Set the name that the AI Companion will use when talking to you in voice calls and morning briefings.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={nameInput}
                onChange={handleNameChange}
                placeholder="Enter your name (e.g. Rajamma, Karthik, Savitri...)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-base font-bold text-gray-900 bg-stone-50/50"
              />
            </div>
          </div>
          <p className="text-xs font-semibold text-teal-700 bg-teal-50 px-3.5 py-2 rounded-xl inline-block border border-teal-100">
            🗣️ Live AI Voice Greeting: <span className="font-bold">"Haan {nameInput || 'Friend'}! I am right here with you."</span> / <span className="font-bold">"నమస్కారం {nameInput || 'గారు'} గారు!"</span>
          </p>
        </div>

        {/* Dashboard Display Language Switcher */}
        {onAppLanguageChange && (
          <div className="space-y-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Languages className="w-5 h-5 text-teal-600" /> {t(currentLang, 'selectDashboardLanguage')}
              </h3>
              <span className="text-xs font-bold text-teal-700 bg-white px-3 py-1 rounded-full border border-teal-200">
                English / తెలుగు / हिंदी
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Converts all dashboard headers, metric titles, status indicators, and navigation labels instantly.
            </p>
            <div className="pt-1">
              <LanguageSelector currentLang={currentLang} onLanguageChange={onAppLanguageChange} />
            </div>
          </div>
        )}

        {/* Language Switcher Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" /> Voice Companion Language
            </h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Web Speech & Backend LLM Synced
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            Select the primary speaking language for the Voice Companion Card and Live Voice Call. This updates both the Web Speech API recognition engine and Gemini LLM responses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLangChange(lang.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-extrabold text-sm text-gray-900">{lang.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-teal-800 mb-1">{lang.native}</p>
                  <p className="text-[11px] text-gray-500 leading-snug">{lang.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice Companion Persona & Speech Speed Options */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-600" /> Voice Speed & Prompts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Voice Speech Rate</label>
              <select
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(e.target.value)}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold text-gray-800 cursor-pointer"
              >
                <option>Slow & Gentle (Recommended for Elders)</option>
                <option>Normal</option>
                <option>Slightly Faster</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Daily Morning Check-In Prompt</label>
              <select
                value={autoCheckinTime}
                onChange={(e) => setAutoCheckinTime(e.target.value)}
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold text-gray-800 cursor-pointer"
              >
                <option>7:15 AM</option>
                <option>8:00 AM</option>
                <option>9:00 AM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety & Alerts */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" /> Alert Thresholds & Escalation
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Notify Family Care Circle on Joint/Symptom Drift</h4>
              <p className="text-xs text-gray-500 font-medium">Sends an automated WhatsApp alert to Suresh Dev if severe pain or high fatigue is reported 2 days in a row.</p>
            </div>
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="w-5 h-5 accent-teal-500 rounded-md cursor-pointer"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved & applied!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

