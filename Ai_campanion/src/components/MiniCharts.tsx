import React from 'react';

interface MiniChartsProps {
  layout?: 'grid' | 'vertical';
}

export const MiniCharts: React.FC<MiniChartsProps> = ({ layout = 'grid' }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const sleepData = [45, 55, 70, 75, 65, 85, 75]; // heights in %
  const moodData = [55, 60, 65, 72, 75, 80, 85];
  const medData = [100, 100, 100, 100, 100, 100, 100];

  const containerClasses =
    layout === 'vertical'
      ? 'flex flex-col gap-4 w-full'
      : 'grid grid-cols-1 md:grid-cols-3 gap-4';

  const cardClasses =
    layout === 'vertical'
      ? 'bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60 flex flex-col justify-between shadow-2xs'
      : 'bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[170px]';

  const barHeightClass = layout === 'vertical' ? 'h-16' : 'h-20';

  return (
    <div className={containerClasses}>
      {/* 1. Sleep Quality */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-500 tracking-tight">Sleep Quality</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">8.2 hrs</span>
        </div>
        <div className={`${barHeightClass} flex items-end justify-between gap-2 pt-2`}>
          {sleepData.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div
                className="w-full bg-[#00cba9] rounded-full transition-all duration-300 group-hover:bg-teal-600"
                style={{ height: `${h}%` }}
                title={`${days[i]}: ${((h / 100) * 9).toFixed(1)} hrs`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-1.5 border-t border-slate-200/40 mt-1.5">
          {days.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Mood Trend */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-500 tracking-tight">Mood Trend</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">97% Happy</span>
        </div>
        <div className={`${barHeightClass} flex items-end justify-between gap-2 pt-2`}>
          {moodData.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div
                className="w-full bg-[#a855f7] rounded-full transition-all duration-300 group-hover:bg-purple-600"
                style={{ height: `${h}%` }}
                title={`${days[i]}: ${h}% happy`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-1.5 border-t border-slate-200/40 mt-1.5">
          {days.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Med Adherence */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-500 tracking-tight">Med Adherence</span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">100%</span>
        </div>
        <div className={`${barHeightClass} flex items-end justify-between gap-2 pt-2`}>
          {medData.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div
                className="w-full bg-[#ff5a79] rounded-full transition-all duration-300 group-hover:bg-rose-600"
                style={{ height: `${h}%` }}
                title={`${days[i]}: 100% taken`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-1.5 border-t border-slate-200/40 mt-1.5">
          {days.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400">
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};


