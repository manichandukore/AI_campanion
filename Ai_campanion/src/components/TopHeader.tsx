import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TopHeaderProps {
  score: number;
  userName?: string;
  onOpenSOS: () => void;
  isWarmTheme?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  score,
  userName = 'Rajamma',
  onOpenSOS,
  isWarmTheme = true,
}) => {
  return (
    <div
      className={`rounded-3xl p-6 border-2 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        isWarmTheme
          ? 'bg-[#FAF7F2] border-[#E6DFC8]'
          : 'bg-[#F2EDF7] border-purple-100'
      }`}
    >
      {/* Left: Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#3D3A34] tracking-tight font-serif">
          Good Morning, {userName}
        </h1>
        <p className="text-base text-gray-600 font-sans font-medium mt-1">
          Today is Thursday, Oct 24 • Aura Companion is watching safely for 143 days.
        </p>
      </div>

      {/* Right: Emergency Assist Button & Health Score Badge */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {/* High-Contrast Emergency Assist SOS Button */}
        <button
          onClick={onOpenSOS}
          className="px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-sans font-extrabold text-lg md:text-xl rounded-2xl shadow-lg border-b-4 border-red-800 transition-all flex items-center gap-2.5 cursor-pointer hover:shadow-xl animate-pulse"
        >
          <AlertTriangle className="w-6 h-6 fill-white stroke-red-600" />
          <span>Emergency Assist</span>
        </button>

        {/* Score Badge */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white border-3 border-[#10B981] flex flex-col items-center justify-center shadow-md">
            <span className="text-xl font-black text-[#0D9488] leading-none">{score}</span>
            <span className="text-[9px] font-bold text-[#0D9488] uppercase tracking-wider mt-0.5 font-sans">
              SCORE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
