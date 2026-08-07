import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface DailyNoteCardProps {
  userName?: string;
  note?: string;
}

export const DailyNoteCard: React.FC<DailyNoteCardProps> = ({
  userName = 'Karthik',
  note = `Everything looks good today, ${userName}. You took your medicine at 8:00 AM.`,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border-4 border-[#7C9A82] shadow-lg font-serif transition-all hover:shadow-xl">
      <div className="flex items-center gap-2 mb-2 font-sans">
        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </span>
        <span className="text-sm font-bold text-[#7C9A82] uppercase tracking-wider">
          AURA DAILY NOTE
        </span>
      </div>

      {/* Huge, readable Serif font (min 24px) */}
      <p className="text-2xl md:text-3xl font-extrabold text-[#2C2925] leading-relaxed tracking-tight">
        "{note}"
      </p>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-emerald-800 font-sans font-semibold">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <span>Verified by Aura Wellness OS & Care Circle</span>
      </div>
    </div>
  );
};
