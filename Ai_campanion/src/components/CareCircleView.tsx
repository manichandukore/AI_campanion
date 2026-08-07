import React, { useState } from 'react';
import {
  Users,
  Phone,
  ShieldCheck,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Bell,
  X,
  ExternalLink,
  ShieldAlert,
  Send,
  Sparkles
} from 'lucide-react';
import { Contact } from '../types';
import { AppLanguage, t } from '../utils/translations';

interface CareCircleViewProps {
  contacts: Contact[];
  onUpdateContacts: (updated: Contact[]) => void;
  autoWhatsAppEnabled: boolean;
  onToggleAutoWhatsApp: (enabled: boolean) => void;
  onTriggerWhatsAppAlert: (symptomText: string) => void;
  userName?: string;
  currentLang?: AppLanguage;
}

export const CareCircleView: React.FC<CareCircleViewProps> = ({
  contacts,
  onUpdateContacts,
  autoWhatsAppEnabled,
  onToggleAutoWhatsApp,
  onTriggerWhatsAppAlert,
  userName = 'Rajamma',
  currentLang = 'en',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingBatch, setIsSendingBatch] = useState(false);

  // Form State for Add / Edit Modal
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    location: '',
    isPrimary: false,
    avatarBg: 'bg-emerald-600',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const openAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      role: 'Family Member (Relative)',
      phone: '+91 ',
      email: '',
      location: 'Hyderabad',
      isPrimary: false,
      avatarBg: 'bg-[#f0ebfe] text-[#7c3aed]',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email || '',
      location: contact.location || 'Home / Nearby',
      isPrimary: !!contact.isPrimary,
      avatarBg: contact.avatarBg || 'bg-emerald-600',
    });
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please provide a name and valid phone number for WhatsApp delivery.');
      return;
    }

    // Generate initials
    const nameParts = formData.name.trim().split(' ');
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : formData.name.trim().substring(0, 2).toUpperCase();

    if (editingContact) {
      // Update existing contact
      const updated = contacts.map((c) =>
        c.id === editingContact.id
          ? {
              ...c,
              name: formData.name.trim(),
              role: formData.role.trim() || 'Caregiver',
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              location: formData.location.trim(),
              initials,
              isPrimary: formData.isPrimary,
              avatarBg: formData.avatarBg,
            }
          : c
      );
      onUpdateContacts(updated);
      showToast(`Updated contact details for ${formData.name}`);
    } else {
      // Create new contact
      const newContact: Contact = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        role: formData.role.trim() || 'Caregiver',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        initials,
        isPrimary: formData.isPrimary,
        avatarBg: formData.avatarBg,
        autoWhatsAppEnabled: true,
      };
      onUpdateContacts([...contacts, newContact]);
      showToast(`Added ${formData.name} to Care Circle automatic WhatsApp alert recipients!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteContact = (id: string, name: string) => {
    if (confirm(`Remove ${name} from ${userName}'s Care Circle?`)) {
      const updated = contacts.filter((c) => c.id !== id);
      onUpdateContacts(updated);
      showToast(`Removed ${name} from Care Circle.`);
    }
  };

  const handleBatchBroadcastWhatsApp = async () => {
    setIsSendingBatch(true);
    showToast('🚀 Launching Automatic WhatsApp Emergency Dispatch to all Care Circle members...');

    try {
      await fetch('/api/whatsapp/send-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomText: 'Acute Health Emergency (Manual Trigger)',
          contacts,
          userName,
          location: 'Home (Flat 302, Hyderabad)',
        }),
      });
    } catch {
      // fallback handled gracefully
    }

    setTimeout(() => {
      setIsSendingBatch(false);
      onTriggerWhatsAppAlert('Acute Health SOS Triggered by Caregiver');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-bold leading-snug">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#f0ebfe] via-purple-50 to-emerald-50 rounded-3xl p-6 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> WhatsApp Auto-Dispatch Ready
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Care Circle & Emergency WhatsApp Sender</h2>
          <p className="text-sm text-gray-600 font-medium mt-1">
            {userName}'s connected family members, doctors, and automatic emergency WhatsApp alert dispatch engine
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-3 px-5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Family / Doctor</span>
        </button>
      </div>

      {/* AUTOMATIC WHATSAPP EMERGENCY DISPATCHER CONTROL CARD */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-emerald-100">
              <MessageCircle className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-900">
                  Automatic WhatsApp Emergency Alert Sender
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  autoWhatsAppEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {autoWhatsAppEnabled ? 'ACTIVE ✅' : 'PAUSED ⏸️'}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1 max-w-xl">
                When acute symptoms (Chest pain, Stomach pain, High discomfort) are detected during voice check-ins or SOS calls,
                WhatsApp emergency messages automatically dispatch to all family members in Care Circle.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 shrink-0">
            <span className="text-xs font-extrabold text-gray-700">Auto-Dispatch Mode:</span>
            <button
              onClick={() => {
                onToggleAutoWhatsApp(!autoWhatsAppEnabled);
                showToast(`WhatsApp Auto-Dispatch ${!autoWhatsAppEnabled ? 'ENABLED ✅' : 'PAUSED ⏸️'}`);
              }}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                autoWhatsAppEnabled ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  autoWhatsAppEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Emergency WhatsApp Preview & Trigger Row */}
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2 bg-stone-50 border border-stone-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Automatic Emergency Message Template
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                Auto-Formatted
              </span>
            </div>
            <p className="text-xs font-mono text-gray-800 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed shadow-2xs">
              🚨 <span className="font-bold text-rose-600">URGENT HEALTH ALERT:</span> {userName} Dev reported acute symptoms ([Symptom]) at [Time]. Please check on her immediately. GPS Location: Home (Flat 302, Hyderabad).
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleBatchBroadcastWhatsApp}
              disabled={isSendingBatch}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingBatch ? 'Dispatching WhatsApp Alerts...' : 'Trigger WhatsApp SOS to Care Circle Now'}</span>
            </button>

            <button
              onClick={() => onTriggerWhatsAppAlert('Test Health Check Alert')}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-200"
            >
              <Bell className="w-3.5 h-3.5 text-teal-600" />
              <span>Test Emergency Modal & Recipients</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARE CIRCLE CONTACT CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Care Circle Members ({contacts.length})
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            All listed members receive automatic WhatsApp emergency notifications
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((member) => {
            const cleanPhone = member.phone.replace(/[^0-9]/g, '');
            const alertMsg = `🚨 URGENT HEALTH ALERT: ${userName} Dev reported symptoms during voice check-in. Please check on her immediately.`;
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertMsg)}`;

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center shadow-xs ${member.avatarBg}`}>
                        {member.initials}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-gray-900 leading-tight">
                          {member.name}
                        </h4>
                        <p className="text-xs text-teal-600 font-bold mt-0.5">{member.role}</p>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(member.id, member.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Meta Details */}
                  <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono font-bold text-gray-800">{member.phone}</span>
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{member.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-WhatsApp Status Pill & Action Buttons */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      WhatsApp Auto-Recipient
                    </span>

                    {member.isPrimary && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-md uppercase">
                        Primary 1st Responder
                      </span>
                    )}
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                    </a>

                    <a
                      href={`tel:${member.phone}`}
                      className="py-2 px-3 bg-gray-900 hover:bg-black active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>Direct Call</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD / EDIT CONTACT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingContact ? 'Edit Care Circle Member' : 'Add Family Member / Doctor'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Configure contacts for automatic emergency WhatsApp dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Dev or Dr. Pillai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1">
                    Relationship / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Son & Caregiver, Doctor"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="suresh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1">
                    Location / Proximity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad (15 mins away)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Avatar Theme Color */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1.5">
                  Avatar Theme Color
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { bg: 'bg-[#f0ebfe] text-[#7c3aed]', label: 'Purple' },
                    { bg: 'bg-emerald-600 text-white', label: 'Emerald' },
                    { bg: 'bg-teal-600 text-white', label: 'Teal' },
                    { bg: 'bg-rose-600 text-white', label: 'Rose' },
                    { bg: 'bg-indigo-600 text-white', label: 'Indigo' },
                  ].map((theme, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarBg: theme.bg })}
                      className={`w-9 h-9 rounded-xl ${theme.bg} font-bold text-xs flex items-center justify-center border-2 transition-all cursor-pointer ${
                        formData.avatarBg === theme.bg ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'
                      }`}
                    >
                      {formData.name ? formData.name.substring(0, 1).toUpperCase() : 'A'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Contact Checkbox */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="isPrimary" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Set as Primary First Responder (Receives top priority WhatsApp alerts)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingContact ? 'Save Changes' : 'Add to Care Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
