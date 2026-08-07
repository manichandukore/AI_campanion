import React, { useState } from 'react';
import { Brain, Heart, MessageSquare, Activity, RefreshCw } from 'lucide-react';
import { BodyObservation } from '../types';

interface WarmBodyMapProps {
  observations: BodyObservation[];
  selectedObservation: BodyObservation;
  onSelectObservation: (obs: BodyObservation) => void;
}

export const WarmBodyMap: React.FC<WarmBodyMapProps> = ({
  observations,
  selectedObservation,
  onSelectObservation,
}) => {
  const [isFacingBack, setIsFacingBack] = useState(false);

  // Filter observations based on front vs back facing
  const visibleObservations = observations.filter((obs) => {
    if (obs.side === 'both') return true;
    return isFacingBack ? obs.side === 'back' : obs.side === 'front';
  });

  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-6 border-2 border-[#E6DFC8] shadow-md flex flex-col justify-between h-full font-serif">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-extrabold text-[#3D3A34]">
            My Body Health Map
          </h3>
          <p className="text-sm font-sans text-gray-500">
            Showing {isFacingBack ? 'BACK' : 'FRONT'} view
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-sans font-bold text-sm rounded-full border border-emerald-200">
          {isFacingBack ? 'Back View' : 'Front View'}
        </span>
      </div>

      {/* Center Body Canvas & Friendly Icons */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <div className="relative w-64 h-80 bg-[#EFE9DB] rounded-3xl p-4 flex items-center justify-center border-2 border-[#D6CFC0] shadow-inner">
          {/* Friendly Human Silhouette in Soft Charcoal Grey (#4A4741) */}
          <svg viewBox="0 0 200 320" className="h-full w-auto drop-shadow-md transition-all duration-500">
            {/* Head */}
            <ellipse cx="100" cy="35" rx="20" ry="24" fill="#4A4741" />
            {/* Neck */}
            <rect x="93" y="56" width="14" height="14" rx="4" fill="#4A4741" />
            {/* Torso */}
            <path
              d="M 60 70 C 70 65, 130 65, 140 70 C 148 80, 145 115, 140 145 L 130 190 L 70 190 L 60 145 C 55 115, 52 80, 60 70 Z"
              fill="#4A4741"
            />
            {/* Left Arm */}
            <path
              d="M 58 75 Q 40 110 36 150 C 34 165 38 175 44 175 C 48 175 52 165 56 145 L 64 90 Z"
              fill="#4A4741"
            />
            {/* Right Arm */}
            <path
              d="M 142 75 Q 160 110 164 150 C 166 165 162 175 156 175 C 152 175 148 165 144 145 L 136 90 Z"
              fill="#4A4741"
            />
            {/* Pelvis & Legs */}
            <path d="M 70 190 L 130 190 L 124 215 L 76 215 Z" fill="#4A4741" />
            {/* Left Leg */}
            <path d="M 76 215 L 73 265 L 70 305 C 70 312 77 312 81 312 L 87 265 L 94 215 Z" fill="#4A4741" />
            {/* Right Leg */}
            <path d="M 124 215 L 127 265 L 130 305 C 130 312 123 312 119 312 L 113 265 L 106 215 Z" fill="#4A4741" />

            {/* Back View Label Overlay */}
            {isFacingBack && (
              <text x="100" y="130" fill="#EFE9DB" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="Georgia">
                BACK
              </text>
            )}
          </svg>

          {/* Friendly Senior Icon Markers */}
          {/* 1. Brain Icon on Head (Memory) */}
          <button
            onClick={() => {
              const brainObs = observations.find((o) => o.iconType === 'brain') || observations[0];
              onSelectObservation(brainObs);
            }}
            title="Brain & Memory Health"
            className={`absolute top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-lg cursor-pointer hover:scale-110 active:scale-95 ${
              selectedObservation.iconType === 'brain'
                ? 'bg-emerald-500 text-white border-white ring-4 ring-emerald-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-400'
            }`}
          >
            <Brain className="w-7 h-7" />
          </button>

          {/* 2. Speech Bubble Icon on Throat */}
          <button
            onClick={() => {
              const speechObs = observations.find((o) => o.iconType === 'speech') || observations[0];
              onSelectObservation(speechObs);
            }}
            title="Speech & Throat Health"
            className={`absolute top-16 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md cursor-pointer hover:scale-110 active:scale-95 ${
              selectedObservation.iconType === 'speech'
                ? 'bg-emerald-500 text-white border-white ring-4 ring-emerald-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* 3. Heart Icon on Chest (Mood / Heart) */}
          <button
            onClick={() => {
              const heartObs = observations.find((o) => o.iconType === 'heart') || observations[0];
              onSelectObservation(heartObs);
            }}
            title="Heart & Mood Health"
            className={`absolute top-28 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-lg cursor-pointer hover:scale-110 active:scale-95 ${
              selectedObservation.iconType === 'heart'
                ? 'bg-emerald-500 text-white border-white ring-4 ring-emerald-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-400'
            }`}
          >
            <Heart className="w-7 h-7 fill-current" />
          </button>

          {/* 4. Knee / Joint Icon (Turns Warm Orange if attention needed) */}
          <button
            onClick={() => {
              const kneeObs = observations.find((o) => o.iconType === 'knee') || observations[1];
              onSelectObservation(kneeObs);
            }}
            title="Knee & Joint Health"
            className={`absolute bottom-12 left-[38%] w-11 h-11 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-lg cursor-pointer hover:scale-110 active:scale-95 ${
              selectedObservation.iconType === 'knee'
                ? 'bg-amber-500 text-white border-white ring-4 ring-amber-300'
                : 'bg-amber-100 text-amber-900 border-amber-400'
            }`}
          >
            <Activity className="w-6 h-6" />
          </button>
        </div>

        {/* Large "Turn Around" Chunky 3D Button */}
        <button
          onClick={() => setIsFacingBack(!isFacingBack)}
          className="mt-5 px-8 py-3.5 bg-[#7C9A82] hover:bg-[#68856E] active:scale-95 text-white font-sans font-bold text-xl rounded-2xl shadow-md border-b-4 border-[#526B57] transition-all flex items-center gap-3 cursor-pointer hover:shadow-lg"
        >
          <RefreshCw className="w-6 h-6" />
          <span>Turn Around</span>
        </button>
      </div>

      {/* Plain English Senior Observation Callout */}
      <div className="mt-4 bg-[#FFF9E6] border-2 border-amber-300 rounded-2xl p-5 shadow-xs font-sans">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            {selectedObservation.part}: {selectedObservation.condition}
          </h4>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
            {selectedObservation.status}
          </span>
        </div>
        <p className="text-base text-amber-950 leading-relaxed font-medium">
          {selectedObservation.recommendation}
        </p>
      </div>
    </div>
  );
};
