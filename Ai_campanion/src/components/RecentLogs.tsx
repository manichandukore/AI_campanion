import React from 'react';
import { CheckInLog } from '../types';
import { AppLanguage, t } from '../utils/translations';

interface RecentLogsProps {
  logs: CheckInLog[];
  currentLang?: AppLanguage;
}

export const RecentLogs: React.FC<RecentLogsProps> = ({ logs, currentLang = 'en' }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between h-full">
      <h3 className="text-base font-bold text-gray-900 mb-4">{t(currentLang, 'recentLogsTitle')}</h3>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 italic">{t(currentLang, 'noLogsYet')}</p>
        ) : (
          logs.map((log) => {
            const isPurple = log.dotColor === 'purple';
            const isOrange = log.dotColor === 'orange';

            return (
              <div key={log.id} className="flex items-start gap-4">
                <span className="text-xs font-semibold text-gray-400 shrink-0 w-14 pt-0.5 text-right">
                  {log.time}
                </span>

                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      isPurple
                        ? 'bg-purple-600 ring-2 ring-purple-100'
                        : isOrange
                        ? 'bg-orange-500 ring-2 ring-orange-100'
                        : 'bg-emerald-500 ring-2 ring-emerald-100'
                    }`}
                  />

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{log.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{log.note}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
