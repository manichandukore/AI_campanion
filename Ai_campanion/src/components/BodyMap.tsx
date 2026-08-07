import React, { useState } from 'react';
import { BodyObservation } from '../types';
import { AppLanguage, t } from '../utils/translations';

interface BodyMapProps {
  observations: BodyObservation[];
  selectedObservation: BodyObservation;
  onSelectObservation: (obs: BodyObservation) => void;
  currentLang?: AppLanguage;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  observations,
  selectedObservation,
  onSelectObservation,
  currentLang = 'en',
}) => {
  const [, setHoveredPart] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{t(currentLang, 'bodyMapTitle')}</h3>
        <span className="px-3 py-1 bg-purple-50 text-purple-600 font-semibold text-xs rounded-full uppercase tracking-wide border border-purple-100">
          {t(currentLang, 'bodyAreaObservation')}
        </span>
      </div>

      {/* Main Body Map Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-2">
        {/* SVG Canvas Container */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-56 h-64 bg-[#7EC8E3]/20 rounded-2xl p-3 flex items-center justify-center border border-[#7EC8E3]/30 shadow-inner overflow-hidden">
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#0284C7 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <svg
              viewBox="0 0 200 320"
              className="h-full w-auto drop-shadow-sm transition-all duration-300"
            >
              {/* Head */}
              <ellipse cx="100" cy="35" rx="18" ry="22" fill="#2B6CB0" opacity="0.85" />
              {/* Neck */}
              <rect x="94" y="55" width="12" height="12" rx="3" fill="#2B6CB0" opacity="0.8" />
              {/* Shoulders & Torso */}
              <path
                d="M 62 70 C 70 65, 130 65, 138 70 C 145 78, 142 110, 138 140 C 135 155, 132 170, 128 185 L 72 185 C 68 170, 65 155, 62 140 C 58 110, 55 78, 62 70 Z"
                fill="#2B6CB0"
                opacity="0.8"
              />
              {/* Left Arm */}
              <path
                d="M 58 75 Q 42 110 38 150 C 36 165 39 175 44 175 C 48 175 52 165 56 145 L 64 90 Z"
                fill="#2B6CB0"
                opacity="0.75"
              />
              {/* Right Arm */}
              <path
                d="M 142 75 Q 158 110 162 150 C 164 165 161 175 156 175 C 152 175 148 165 144 145 L 136 90 Z"
                fill="#2B6CB0"
                opacity="0.75"
              />
              {/* Pelvis */}
              <path d="M 72 185 L 128 185 L 122 210 L 78 210 Z" fill="#2B6CB0" opacity="0.85" />
              {/* Left Leg */}
              <path
                d="M 78 210 L 75 260 L 72 300 C 72 308 79 308 83 308 C 86 308 88 300 89 260 L 96 210 Z"
                fill="#2B6CB0"
                opacity="0.8"
              />
              {/* Right Leg */}
              <path
                d="M 122 210 L 125 260 L 128 300 C 128 308 121 308 117 308 C 114 308 112 300 111 260 L 104 210 Z"
                fill="#2B6CB0"
                opacity="0.8"
              />

              {/* Joint Accent Circles */}
              <circle cx="100" cy="35" r="3" fill="#E2E8F0" opacity="0.6" />
              <circle cx="70" cy="74" r="3" fill="#E2E8F0" opacity="0.6" />
              <circle cx="130" cy="74" r="3" fill="#E2E8F0" opacity="0.6" />
              <circle cx="82" cy="255" r="4" fill="#E2E8F0" opacity="0.6" />
              <circle cx="118" cy="255" r="4" fill="#E2E8F0" opacity="0.6" />

              {/* Observation Pulse Rings */}
              {observations.map((obs) => {
                const isSelected = selectedObservation.id === obs.id;
                const isRed = obs.color === 'red' || obs.status === 'Emergency' || obs.status === 'Watch' || obs.part.toLowerCase().includes('stomach');
                const isOrange = !isRed && (obs.color === 'orange' || obs.status === 'Observation');
                const pulseColor = isRed ? '#EF4444' : isOrange ? '#F97316' : '#10B981';

                return (
                  <g
                    key={obs.id}
                    className="cursor-pointer group"
                    onClick={() => onSelectObservation(obs)}
                    onMouseEnter={() => setHoveredPart(obs.part)}
                    onMouseLeave={() => setHoveredPart(null)}
                  >
                    <circle
                      cx={obs.cx}
                      cy={obs.cy}
                      r={isSelected ? "18" : "12"}
                      fill={pulseColor}
                      opacity={isRed ? "0.85" : "0.35"}
                      className="animate-ping"
                      style={{ animationDuration: isRed ? '1s' : '2.5s' }}
                    />
                    <circle
                      cx={obs.cx}
                      cy={obs.cy}
                      r={isSelected ? "13" : "9"}
                      fill={pulseColor}
                      opacity="0.9"
                      className={isRed ? "animate-pulse" : ""}
                    />
                    <circle
                      cx={obs.cx}
                      cy={obs.cy}
                      r="5"
                      fill="#FFFFFF"
                      stroke={pulseColor}
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend / Status Bullet List on Right Side */}
        <div className="md:col-span-7 space-y-4 pl-2">
          {observations.map((obs) => {
            const isSelected = selectedObservation.id === obs.id;
            const isRed = obs.color === 'red' || obs.status === 'Emergency' || obs.status === 'Watch' || obs.part.toLowerCase().includes('stomach');
            const isOrange = !isRed && (obs.color === 'orange' || obs.status === 'Observation');

            return (
              <div
                key={obs.id}
                onClick={() => onSelectObservation(obs)}
                className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-3 border ${
                  isSelected
                    ? isRed
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300/50 shadow-xs'
                      : 'bg-amber-50/60 border-amber-200 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-gray-50'
                }`}
              >
                <span
                  className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${
                    isRed
                      ? 'bg-rose-600 ring-4 ring-rose-200 animate-ping'
                      : isOrange
                      ? 'bg-orange-500 ring-2 ring-orange-200'
                      : 'bg-emerald-500 ring-2 ring-emerald-200'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                      {obs.part} ({obs.condition})
                    </h4>
                    {isRed && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        🚨 RED ALERT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-snug">{obs.details}</p>
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-gray-100 flex items-center gap-5 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-emerald-500 rounded-full" />
              <span>{t(currentLang, 'stable')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-orange-400 rounded-full" />
              <span>{t(currentLang, 'observation')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-rose-600 rounded-full animate-pulse" />
              <span className="font-bold text-rose-700">Red Alert</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-3 border rounded-xl p-4 transition-all ${
        selectedObservation.color === 'red' || selectedObservation.part.toLowerCase().includes('stomach')
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : 'bg-[#FFF3E0] border-orange-200/80 text-amber-900/90'
      }`}>
        <h4 className={`font-bold text-sm tracking-tight flex items-center gap-1.5 mb-1 ${
          selectedObservation.color === 'red' || selectedObservation.part.toLowerCase().includes('stomach')
            ? 'text-rose-800 font-black'
            : 'text-amber-800'
        }`}>
          {t(currentLang, 'aiRecommendation')}: {selectedObservation.part}
        </h4>
        <p className="text-xs leading-relaxed font-medium">
          {selectedObservation.recommendation}
        </p>
      </div>
    </div>
  );
};
