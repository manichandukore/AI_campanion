import React from 'react';

interface MicroChartsProps {
  sleepHours: number;
  moodPercent: number;
  medAdherence: number;
}

export const MicroCharts: React.FC<MicroChartsProps> = ({
  sleepHours,
  moodPercent,
  medAdherence,
}) => {
  const sleepBars = [40, 60, 85, 70, 95, 80, 88];
  const moodBars = [70, 80, 90, 85, 95, 90, 97];
  const medBars = [100, 100, 100, 100, 100, 100, 100];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: Sleep Quality */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500">Sleep Quality</span>
          <span className="text-sm font-extrabold text-gray-900">{sleepHours} hrs</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-10 pt-1">
          {sleepBars.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#10B981] rounded-t-sm transition-all duration-300 hover:bg-[#0D9488]"
              style={{ height: `${h}%` }}
              title={`Day ${i + 1}: ${((h / 100) * 9).toFixed(1)} hrs`}
            />
          ))}
        </div>
      </div>

      {/* Card 2: Mood Trend */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500">Mood Trend</span>
          <span className="text-sm font-extrabold text-gray-900">{moodPercent}% Happy</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-10 pt-1">
          {moodBars.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#8B5CF6] rounded-t-sm transition-all duration-300 hover:bg-[#7C3AED]"
              style={{ height: `${h}%` }}
              title={`Day ${i + 1}: ${h}%`}
            />
          ))}
        </div>
      </div>

      {/* Card 3: Med Adherence */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500">Med Adherence</span>
          <span className="text-sm font-extrabold text-gray-900">{medAdherence}%</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-10 pt-1">
          {medBars.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#FF6B6B] rounded-t-sm transition-all duration-300 hover:bg-[#EF4444]"
              style={{ height: `${h}%` }}
              title={`Day ${i + 1}: 100% taken`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
