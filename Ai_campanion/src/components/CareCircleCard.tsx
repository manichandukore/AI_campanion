import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { CareContact } from '../types';

interface CareCircleCardProps {
  contacts?: CareContact[];
}

export const CareCircleCard: React.FC<CareCircleCardProps> = ({ contacts }) => {
  const [callingName, setCallingName] = useState<string | null>(null);

  const defaultContacts: CareContact[] = contacts || [
    {
      id: '1',
      initials: 'SD',
      name: 'Suresh Dev',
      role: 'Primary (Son)',
      phone: '+91 98765 43210',
      avatarBg: 'bg-[#f0ebfe] text-[#7c3aed]',
      isPrimary: true,
    },
    {
      id: '2',
      initials: 'LD',
      name: 'Lakshmi Devi',
      role: 'Support (Neighbor)',
      phone: '+91 98765 43211',
      avatarBg: 'bg-purple-100 text-purple-700',
    },
    {
      id: '3',
      initials: 'RP',
      name: 'Dr. Roy Pillai',
      role: 'Geriatric GP',
      phone: '+91 98765 43212',
      avatarBg: 'bg-rose-100 text-rose-600',
    },
  ];

  const handleCall = (contact: CareContact) => {
    setCallingName(contact.name);
    setTimeout(() => {
      setCallingName(null);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-2xs flex flex-col justify-between h-full relative">
      <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4">
        Care Circle Contacts
      </h3>

      <div className="space-y-3.5">
        {defaultContacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-1 hover:bg-stone-50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${contact.avatarBg}`}
              >
                {contact.initials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">
                  {contact.name}
                </h4>
                <p className="text-xs text-gray-400 font-medium">
                  {contact.role}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCall(contact)}
              className="w-8 h-8 rounded-xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              title={`Call ${contact.name}`}
            >
              <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        ))}
      </div>

      {callingName && (
        <div className="absolute inset-x-4 bottom-4 bg-gray-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-lg text-xs font-semibold animate-bounce">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Connecting call to {callingName}...</span>
          </div>
          <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Calling</span>
        </div>
      )}
    </div>
  );
};
