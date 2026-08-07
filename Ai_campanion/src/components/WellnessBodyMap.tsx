import React, { useState } from 'react';
import { BodyObservation } from '../types';

interface WellnessBodyMapProps {
  observations?: BodyObservation[];
  activeObservationKey?: string;
  onSelectObservation?: (partKey: string) => void;
}

export const WellnessBodyMap: React.FC<WellnessBodyMapProps> = ({
  activeObservationKey = 'knee',
  onSelectObservation,
}) => {
  const [selectedPart, setSelectedPart] = useState<string>(activeObservationKey);

  const handleSelect = (key: string) => {
    setSelectedPart(key);
    if (onSelectObservation) {
      onSelectObservation(key);
    }
  };

  const currentObservationData = {
    stomach: {
      title: "🚨 Red Alert: Stomach / Abdomen Pain",
      text: "Acute stomach pain reported during voice log. Immediate emergency WhatsApp alert dispatched to relatives (Suresh Dev & Lakshmi Devi)."
    },
    knee: {
      title: "Observation Watch: Joints",
      text: "Mild knee stiffness reported during morning voice log. Recommended light range-of-motion stretching exercises and warm compresses."
    },
    head: {
      title: "Baseline Monitor: Head & Mind",
      text: "Excellent cognitive baseline maintained. Sleep quality has positively impacted mental clarity and focus."
    },
    spine: {
      title: "Observation Watch: Lumbar / Spine",
      text: "No acute back tightness reported today. Ergonomic seating during daily relaxation advised."
    }
  }[selectedPart] || {
    title: "Observation Watch: Joints",
    text: "Mild knee stiffness reported during morning voice log. Recommended light range-of-motion stretching exercises and warm compresses."
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-2xs flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Wellness Body Map
        </h3>
        <span className="px-3 py-1 rounded-full bg-[#f0ebfe] text-[#7c3aed] text-xs font-extrabold tracking-wider uppercase">
          INTERACTIVE OBSERVATION
        </span>
      </div>

      {/* Main Grid: Silhouette on Left, Details on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Body Canvas Area */}
        <div className="md:col-span-5 bg-[#e2f3fa] rounded-2xl p-4 flex items-center justify-center relative min-h-[220px] overflow-hidden border border-sky-100 shadow-inner">
          <div className="relative w-36 h-52 flex justify-center items-center">
            {/* SVG Human Body Silhouette */}
            <svg
              viewBox="0 0 100 200"
              className="w-full h-full text-slate-700 fill-current opacity-90 drop-shadow-md"
            >
              {/* Head */}
              <circle cx="50" cy="22" r="14" className="fill-slate-700" />
              {/* Neck */}
              <rect x="46" y="34" width="8" height="8" rx="2" className="fill-slate-700" />
              {/* Shoulders & Torso */}
              <path
                d="M30 42 C 30 42, 38 40, 50 40 C 62 40, 70 42, 70 42 C 75 44, 76 55, 75 70 C 74 85, 72 105, 70 115 C 68 120, 62 122, 50 122 C 38 122, 32 120, 30 115 C 28 105, 26 85, 25 70 C 24 55, 25 44, 30 42 Z"
                className="fill-slate-700"
              />
              {/* Arms */}
              <path
                d="M26 44 L 16 80 C 15 85, 12 95, 14 100 C 15 102, 18 102, 20 98 L 28 65 Z"
                className="fill-slate-700"
              />
              <path
                d="M74 44 L 84 80 C 85 85, 88 95, 86 100 C 85 102, 82 102, 80 98 L 72 65 Z"
                className="fill-slate-700"
              />
              {/* Pelvis & Legs */}
              <path
                d="M35 120 L 33 160 C 33 170, 31 185, 34 195 C 36 198, 41 198, 42 192 L 46 135 C 47 128, 48 125, 50 125 C 52 125, 53 128, 54 135 L 58 192 C 59 198, 64 198, 66 195 C 69 185, 67 170, 67 160 L 65 120 Z"
                className="fill-slate-700"
              />
            </svg>

            {/* Hotspot 0: Stomach (Red Alert - Emergency Pain) */}
            <button
              onClick={() => handleSelect('stomach')}
              className={`absolute top-[82px] left-[50px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 z-20 ${
                selectedPart === 'stomach' ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              title="Stomach (Red Alert Pain)"
            >
              <span className="absolute -inset-2 rounded-full bg-rose-600 opacity-90 animate-ping" style={{ animationDuration: '0.9s' }} />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white shadow-lg ring-2 ring-rose-300 animate-pulse" />
            </button>

            {/* Glowing Hotspot 1: Head (Teal - Clear Mind) */}
            <button
              onClick={() => handleSelect('head')}
              className={`absolute top-[18px] left-[48px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 ${
                selectedPart === 'head' ? 'scale-125 z-20' : 'hover:scale-110'
              }`}
              title="Head (Clear Mind)"
            >
              <span className="absolute -inset-1 rounded-full bg-teal-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 border-2 border-white shadow-md" />
            </button>

            {/* Glowing Hotspot 2: Right Knee (Orange - Stiffness) */}
            <button
              onClick={() => handleSelect('knee')}
              className={`absolute top-[148px] left-[39px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 ${
                selectedPart === 'knee' ? 'scale-125 z-20' : 'hover:scale-110'
              }`}
              title="Knee (Stiffness)"
            >
              <span className="absolute -inset-1.5 rounded-full bg-amber-500 opacity-80 animate-ping" />
              <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-orange-500 border-2 border-white shadow-md" />
            </button>

            {/* Glowing Hotspot 3: Left Knee (Orange glow) */}
            <button
              onClick={() => handleSelect('knee')}
              className={`absolute top-[148px] left-[61px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 ${
                selectedPart === 'knee' ? 'scale-125 z-20' : 'hover:scale-110'
              }`}
              title="Knee (Observation)"
            >
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-400 border-2 border-white shadow-sm" />
            </button>

            {/* Optional Neck / Spine Hotspot */}
            <button
              onClick={() => handleSelect('spine')}
              className={`absolute top-[48px] left-[50px] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 ${
                selectedPart === 'spine' ? 'scale-125 z-20' : 'hover:scale-110'
              }`}
              title="Spine (Lumbar)"
            >
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400 border border-white opacity-80" />
            </button>
          </div>
        </div>

        {/* Legend / Bullet Observations */}
        <div className="md:col-span-7 space-y-4">
          {/* Item 1: Head */}
          <div
            onClick={() => handleSelect('head')}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              selectedPart === 'head' ? 'bg-teal-50/60 border border-teal-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0" />
              <h4 className="text-sm font-bold text-gray-900">Head (Clear Mind)</h4>
            </div>
            <p className="text-xs text-gray-500 pl-5 mt-0.5">
              Excellent mental clarity baseline
            </p>
          </div>

          {/* Item 2: Knee */}
          <div
            onClick={() => handleSelect('knee')}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              selectedPart === 'knee' ? 'bg-orange-50/60 border border-orange-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
              <h4 className="text-sm font-bold text-gray-900">Knee (Stiffness)</h4>
            </div>
            <p className="text-xs text-gray-500 pl-5 mt-0.5">
              Mild physical fatigue reported during daily walk
            </p>
          </div>

          {/* Legend row */}
          <div className="flex items-center gap-6 pt-2 pl-1 border-t border-gray-100 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-teal-500 inline-block" />
              <span>Stable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-orange-500 inline-block" />
              <span>Observation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Highlight Box: Observation Watch */}
      <div className="mt-5 p-4 rounded-2xl bg-[#fff7ed] border border-orange-100/80">
        <h4 className="text-sm font-bold text-orange-600 tracking-wide mb-1">
          {currentObservationData.title}
        </h4>
        <p className="text-xs text-stone-700 leading-relaxed font-medium">
          {currentObservationData.text}
        </p>
      </div>
    </div>
  );
};
