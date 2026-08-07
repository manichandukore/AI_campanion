import React from 'react';
import { LayoutGrid, Activity, Users, Settings, Heart, LogOut, FileText } from 'lucide-react';
import { MiniCharts } from './MiniCharts';
import { AppLanguage, t, TranslationKey } from '../utils/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  userName?: string;
  currentLang?: AppLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  userName = 'Rajamma Dev',
  currentLang = 'en',
}) => {
  const navItems: { id: string; key: TranslationKey; icon: any }[] = [
    { id: 'Overview', key: 'navOverview', icon: LayoutGrid },
    { id: 'Wellness Trends', key: 'navWellnessTrends', icon: Activity },
    { id: 'Care Circle', key: 'navCareCircle', icon: Users },
    { id: 'Patient Records', key: 'navPatientRecords', icon: FileText },
    { id: 'Settings', key: 'navSettings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg leading-tight">
              {t(currentLang, 'brandName')}
            </h2>
            <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider">
              {t(currentLang, 'brandTagline')}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const translatedLabel = t(currentLang, item.key);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{translatedLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Health Metrics */}
        <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
          <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider px-1">
            {t(currentLang, 'sparklinesTitle')}
          </p>
          <MiniCharts layout="vertical" />
        </div>
      </div>

      {/* Profile Card Footer */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
              alt={userName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 text-xs truncate">{userName}</h4>
              <p className="text-[10px] text-gray-400 font-medium">{t(currentLang, 'premiumMember')}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title={t(currentLang, 'logout')}
              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
