import React from 'react';
import { Activity, Heart, Moon, Smile, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AppLanguage, t } from '../utils/translations';

interface TrendsViewProps {
  currentLang?: AppLanguage;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ currentLang = 'en' }) => {
  const trendData = [
    { day: 'Mon', sleep: 7.5, mood: 85, score: 82 },
    { day: 'Tue', sleep: 8.0, mood: 90, score: 85 },
    { day: 'Wed', sleep: 7.8, mood: 88, score: 84 },
    { day: 'Thu', sleep: 8.2, mood: 97, score: 87 },
    { day: 'Fri', sleep: 8.5, mood: 92, score: 88 },
    { day: 'Sat', sleep: 8.1, mood: 95, score: 89 },
    { day: 'Sun', sleep: 8.3, mood: 96, score: 90 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#f0ebfe] rounded-3xl p-6 border border-purple-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{t(currentLang, 'wellnessTrendsAnalytics')}</h2>
          <p className="text-sm text-gray-600 font-medium mt-1">
            7-day physiological and cognitive trends for Rajamma
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-bold shadow-md">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" /> Overall Score Trend
          </h3>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            +5% Improved Stability
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed metrics breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-stone-100 space-y-2">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
            <Moon className="w-4 h-4" /> Sleep Baseline
          </div>
          <p className="text-2xl font-black text-gray-900">8.2 hrs / night</p>
          <p className="text-xs text-gray-500 font-medium">Deep REM cycle consistency is 92%</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-100 space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
            <Smile className="w-4 h-4" /> Emotional Balance
          </div>
          <p className="text-2xl font-black text-gray-900">97% Positive</p>
          <p className="text-xs text-gray-500 font-medium">Daily AI voice sentiment analysis</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-100 space-y-2">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
            <Heart className="w-4 h-4" /> Vitals & Mobility
          </div>
          <p className="text-2xl font-black text-gray-900">Stable</p>
          <p className="text-xs text-gray-500 font-medium">Joint stiffness monitored daily</p>
        </div>
      </div>
    </div>
  );
};
