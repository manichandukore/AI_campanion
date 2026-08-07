import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { AppLanguage, t } from '../utils/translations';

interface LanguageSelectorProps {
  currentLang: AppLanguage;
  onSelectLang?: (lang: AppLanguage) => void;
  onLanguageChange?: (lang: AppLanguage) => void;
  variant?: 'pill' | 'compact' | 'header';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
  onLanguageChange,
  variant = 'header',
}) => {
  const languages: { code: AppLanguage; label: string; nativeName: string; flag: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ];

  const handleSelect = (code: AppLanguage) => {
    if (onSelectLang) onSelectLang(code);
    if (onLanguageChange) onLanguageChange(code);
  };

  return (
    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-purple-200/80 shadow-sm">
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-purple-900 font-extrabold text-xs">
        <Globe className="w-4 h-4 text-purple-600" />
        <span className="hidden md:inline">{t(currentLang, 'languageLabel')}:</span>
      </div>

      <div className="flex items-center gap-1">
        {languages.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md scale-[1.02]'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-900'
              }`}
              title={`Switch dashboard language to ${lang.label}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
