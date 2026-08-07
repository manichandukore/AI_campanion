import React from 'react';
import { X, CheckCircle, ExternalLink, PhoneCall, MessageCircle, AlertTriangle } from 'lucide-react';
import { Contact } from '../types';

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptomText?: string;
  contacts: Contact[];
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  isOpen,
  onClose,
  symptomText = 'Stomach Pain',
  contacts,
}) => {
  if (!isOpen) return null;

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const primaryContact = contacts.find((c) => c.role.includes('Son') || c.role.includes('Primary')) || contacts[0];
  const alertMsg = `🚨 URGENT HEALTH ALERT: Rajamma Dev reported ${symptomText} during voice check-in at ${currentTime}. Please check on her immediately. Location: Home.`;

  const cleanPhone = primaryContact?.phone.replace(/[^0-9]/g, '') || '919876543210';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-200 relative overflow-hidden">
        {/* Top Emergency Red Bar */}
        <div className="bg-rose-600 -mx-6 -mt-6 p-4 text-white flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-full animate-bounce">
              <AlertTriangle className="w-6 h-6 text-white" />
            </span>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                Emergency WhatsApp Alert Dispatched!
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                {symptomText} detected • Relatives notified instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Status Box */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900">
              WhatsApp Message Dispatched to Relatives
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Sent at {currentTime} via Care Circle Automated Dispatch.
            </p>
          </div>
        </div>

        {/* Message Content Preview */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 block mb-1">
            WhatsApp Message Content
          </span>
          <p className="text-xs font-mono text-gray-800 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed">
            {alertMsg}
          </p>
        </div>

        {/* Recipients List */}
        <div className="space-y-3 mb-6">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
            Notified Care Circle Members ({contacts.length}):
          </span>

          {contacts.map((contact) => {
            const contactPhoneClean = contact.phone.replace(/[^0-9]/g, '');
            const directWaUrl = `https://wa.me/${contactPhoneClean}?text=${encodeURIComponent(alertMsg)}`;

            return (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-2xs hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${contact.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                    {contact.initials}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 leading-tight">
                      {contact.name}
                    </h5>
                    <p className="text-xs text-gray-500">{contact.role} • {contact.phone}</p>
                  </div>
                </div>

                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Open WhatsApp Chat Now</span>
          </a>

          <a
            href={`tel:${cleanPhone}`}
            className="py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-rose-400" />
            <span>Call Son</span>
          </a>
        </div>
      </div>
    </div>
  );
};
