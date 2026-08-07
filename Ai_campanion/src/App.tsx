import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { HeaderBanner } from './components/HeaderBanner';
import { MetricCards } from './components/MetricCards';
import { BodyMap } from './components/BodyMap';
import { VoiceCompanionCard } from './components/VoiceCompanionCard';
import { RecentLogs } from './components/RecentLogs';
import { NewCheckInModal } from './components/NewCheckInModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { SiriFloatingOrb } from './components/SiriFloatingOrb';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { WhatsAppAlertModal } from './components/WhatsAppAlertModal';
import { TrendsView } from './components/TrendsView';
import { CareCircleView } from './components/CareCircleView';
import { RecordsView } from './components/RecordsView';
import { SettingsView } from './components/SettingsView';
import { BodyObservation, Contact, CheckInLog } from './types';
import { createStomachObservation, isStomachPainMentioned, createHeartObservation, isHeartPainMentioned } from './utils/symptomDetector';
import { AppLanguage } from './utils/translations';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [currentLang, setCurrentLang] = useState<AppLanguage>('en');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [voiceCallInitialQuery, setVoiceCallInitialQuery] = useState<string | undefined>(undefined);
  const [isWhatsAppAlertOpen, setIsWhatsAppAlertOpen] = useState(false);
  const [alertSymptomText, setAlertSymptomText] = useState('Stomach Pain');
  const [userName, setUserName] = useState('Rajamma');
  const [companionLang, setCompanionLang] = useState<'auto' | 'te-IN' | 'hi-IN' | 'en-US'>('te-IN');

  const [lastSpokenNote, setLastSpokenNote] = useState<string>(
    'Knee is slightly stiff, but slept deep last night.'
  );

  const [metrics, setMetrics] = useState({
    overallWellness: 'Good Status',
    wellnessSubtext: 'No critical changes',
    lastCheckinTime: '2 hours ago',
    lastCheckinSubtext: 'Slept deep, reported good',
    moodStatus: 'Happy & Calm',
    moodSubtext: 'High engagement AI note',
    nextActivity: '4:00 PM Medication',
    nextActivitySubtext: 'Blood pressure pill',
  });

  const [observations, setObservations] = useState<BodyObservation[]>([
    {
      id: 'head-1',
      part: 'Head',
      condition: 'Clear Mind',
      status: 'Stable',
      details: 'Excellent mental clarity baseline',
      recommendation: 'Head and cognitive recall are sharp today.',
      cx: 100,
      cy: 35,
      color: 'teal',
      iconType: 'brain',
      side: 'front',
    },
    {
      id: 'knee-1',
      part: 'Knee',
      condition: 'Stiffness',
      status: 'Observation',
      details: 'Mild physical fatigue reported during daily walk',
      recommendation: 'Mild knee stiffness reported during morning voice log. Recommended light range-of-motion stretching exercises and warm compresses.',
      cx: 82,
      cy: 255,
      color: 'orange',
      iconType: 'knee',
      side: 'both',
    },
  ]);

  const [selectedObservation, setSelectedObservation] = useState<BodyObservation>(
    observations[1] // Default to knee observation watch
  );

  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([
    {
      id: '1',
      time: '7:15 AM',
      title: 'Morning Check-In',
      type: 'Morning',
      note: 'Sleep: Excellent. Stiffness reported.',
      dotColor: 'teal',
    },
    {
      id: '2',
      time: 'Yesterday',
      title: 'Evening Check-In',
      type: 'Evening',
      note: 'Stable. Mild physical fatigue on joints.',
      dotColor: 'purple',
    },
  ]);

  const [autoWhatsAppEnabled, setAutoWhatsAppEnabled] = useState(true);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      initials: 'SD',
      name: 'Suresh Dev',
      role: 'Primary Caregiver (Son)',
      phone: '+91 98765 43210',
      email: 'suresh.dev@example.com',
      location: 'Hyderabad (15 mins away)',
      avatarBg: 'bg-emerald-600',
      isPrimary: true,
      autoWhatsAppEnabled: true,
    },
    {
      id: '2',
      initials: 'LD',
      name: 'Lakshmi Devi',
      role: 'Support (Neighbor)',
      phone: '+91 98765 43211',
      email: 'lakshmi.d@example.com',
      location: 'Apartment 302 (Same Floor)',
      avatarBg: 'bg-[#f0ebfe] text-[#7c3aed]',
      autoWhatsAppEnabled: true,
    },
    {
      id: '3',
      initials: 'RP',
      name: 'Dr. Roy Pillai',
      role: 'Geriatric GP',
      phone: '+91 98765 43212',
      email: 'dr.roy@cityclinic.org',
      location: 'City Care Hospital',
      avatarBg: 'bg-rose-600',
      autoWhatsAppEnabled: true,
    },
  ]);

  const triggerHeartPainAlert = (userMessageText: string = 'Heart / Chest pain reported') => {
    // 1. Create heart pain observation with glowing red dot on chest region (cx: 96, cy: 80)
    const heartObs = createHeartObservation(userMessageText);

    // 2. Add or update Heart in observations list
    setObservations((prev) => {
      const filtered = prev.filter((o) => o.part !== 'Heart');
      return [heartObs, ...filtered];
    });

    // 3. Immediately set selectedObservation to heartObs so Body Map highlights it
    setSelectedObservation(heartObs);

    // 4. Update metrics for critical cardiac emergency
    setMetrics((prev) => ({
      ...prev,
      overallWellness: 'Critical Alert',
      wellnessSubtext: '🚨 Red Alert: Acute Heart / Chest Pain Reported',
      moodStatus: 'Chest Discomfort & Restless',
      moodSubtext: 'Emergency WhatsApp alert & doctor protocol dispatched',
    }));

    // Auto-dispatch WhatsApp API alert to care circle
    fetch('/api/whatsapp/send-emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptomText: userMessageText || 'Acute Heart / Chest Discomfort',
        contacts,
        userName,
        location: 'Home (Flat 302, Hyderabad)',
      }),
    }).catch(() => {});

    // 5. Open WhatsApp alert modal with pre-filled message & direct contact link
    setAlertSymptomText(userMessageText || 'Heart / Chest Pain');
    setIsWhatsAppAlertOpen(true);
  };

  const triggerStomachPainAlert = (userMessageText: string = 'Stomach pain reported') => {
    // 1. Create stomach pain observation with glowing red dot at center abdominal (cx: 100, cy: 110)
    const stomachObs = createStomachObservation(userMessageText);

    // 2. Add or update stomach in observations list
    setObservations((prev) => {
      const filtered = prev.filter((o) => o.part !== 'Stomach');
      return [stomachObs, ...filtered];
    });

    // 3. Immediately set selectedObservation to stomachObs so body map highlights it
    setSelectedObservation(stomachObs);

    // 4. Update metrics for emergency alert
    setMetrics((prev) => ({
      ...prev,
      overallWellness: 'Attention Needed',
      wellnessSubtext: '🚨 Red Alert: Acute Stomach Pain Reported',
      moodStatus: 'In Pain & Restless',
      moodSubtext: 'Emergency WhatsApp alert dispatched to family',
    }));

    // Auto-dispatch WhatsApp API alert to care circle
    fetch('/api/whatsapp/send-emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptomText: userMessageText || 'Acute Stomach / Abdominal Pain',
        contacts,
        userName,
        location: 'Home (Flat 302, Hyderabad)',
      }),
    }).catch(() => {});

    // 5. Open WhatsApp alert modal with pre-filled message & direct link
    setAlertSymptomText(userMessageText || 'Stomach Pain');
    setIsWhatsAppAlertOpen(true);
  };

  const handleCheckInComplete = (data: {
    summary: string;
    aiReply: string;
    bodyPart?: string;
    condition?: string;
    status?: string;
    mood?: string;
    wellness?: string;
  }) => {
    setLastSpokenNote(data.summary);

    // Check if user reported heart or stomach pain
    if (data.bodyPart === 'Heart' || isHeartPainMentioned(data.summary)) {
      triggerHeartPainAlert(data.summary);
    } else if (data.bodyPart === 'Stomach' || isStomachPainMentioned(data.summary)) {
      triggerStomachPainAlert(data.summary);
    } else {
      // Add to recent logs
      const newLog: CheckInLog = {
        id: Date.now().toString(),
        time: 'Just now',
        title: 'Voice Check-In',
        type: 'Morning',
        note: data.summary,
        dotColor: 'teal',
      };
      setRecentLogs((prev) => [newLog, ...prev]);

      if (data.mood) {
        setMetrics((prev) => ({ ...prev, moodStatus: data.mood! }));
      }
      if (data.wellness) {
        setMetrics((prev) => ({ ...prev, overallWellness: data.wellness! }));
      }
    }

    setIsCheckInOpen(false);
  };

  // If user is not logged in, show login screen
  if (!isLoggedIn) {
    return (
      <LoginPage
        userName={userName}
        onUserNameChange={setUserName}
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-gray-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setIsLoggedIn(false)}
        userName={userName}
        currentLang={currentLang}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Banner */}
        <HeaderBanner
          userName={userName}
          score={87}
          monitoringDays={143}
          onOpenSOS={() => setIsSOSOpen(true)}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
        />

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'Overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Main Content Grid (8 cols BodyMap + MetricCards, 4 cols Right Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <BodyMap
                  observations={observations}
                  selectedObservation={selectedObservation}
                  onSelectObservation={(obs) => setSelectedObservation(obs)}
                  currentLang={currentLang}
                />

                {/* 4 Metric Cards directly under Wellness Body Map */}
                <MetricCards
                  overallWellness={metrics.overallWellness}
                  wellnessSubtext={metrics.wellnessSubtext}
                  lastCheckinTime={metrics.lastCheckinTime}
                  lastCheckinSubtext={metrics.lastCheckinSubtext}
                  moodStatus={metrics.moodStatus}
                  moodSubtext={metrics.moodSubtext}
                  nextActivity={metrics.nextActivity}
                  nextActivitySubtext={metrics.nextActivitySubtext}
                  currentLang={currentLang}
                  onMedicationAcknowledged={(timeTaken) => {
                    setMetrics((prev) => ({
                      ...prev,
                      nextActivity: 'Medication Taken ✅',
                      nextActivitySubtext: `Logged at ${timeTaken} • Next due tomorrow`,
                    }));
                    setRecentLogs((prev) => [
                      {
                        id: Date.now().toString(),
                        time: timeTaken,
                        title: 'Medication Taken',
                        type: 'Meds',
                        note: 'Blood pressure pill (10mg) acknowledged by Rajamma',
                        dotColor: 'teal',
                      },
                      ...prev,
                    ]);
                  }}
                />
              </div>

              {/* Right Column (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <VoiceCompanionCard
                  lastSpokenNote={lastSpokenNote}
                  selectedLang={companionLang}
                  onLanguageChange={setCompanionLang}
                  onStartCheckIn={() => setIsCheckInOpen(true)}
                  onStartVoiceCall={() => setIsVoiceCallOpen(true)}
                  onStomachPainAlert={triggerStomachPainAlert}
                  currentLang={currentLang}
                  userName={userName}
                />
                <RecentLogs logs={recentLogs} currentLang={currentLang} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wellness Trends */}
        {activeTab === 'Wellness Trends' && <TrendsView currentLang={currentLang} />}

        {/* Tab 3: Care Circle */}
        {activeTab === 'Care Circle' && (
          <CareCircleView
            contacts={contacts}
            onUpdateContacts={setContacts}
            autoWhatsAppEnabled={autoWhatsAppEnabled}
            onToggleAutoWhatsApp={setAutoWhatsAppEnabled}
            onTriggerWhatsAppAlert={(symptomText) => {
              setAlertSymptomText(symptomText);
              setIsWhatsAppAlertOpen(true);
            }}
            userName={userName}
            currentLang={currentLang}
          />
        )}

        {/* Tab 4: Patient Records */}
        {activeTab === 'Patient Records' && <RecordsView currentLang={currentLang} />}

        {/* Tab 5: Settings */}
        {activeTab === 'Settings' && (
          <SettingsView
            userName={userName}
            onUserNameChange={setUserName}
            companionLang={companionLang}
            onLanguageChange={setCompanionLang}
            currentLang={currentLang}
            onAppLanguageChange={setCurrentLang}
          />
        )}
      </main>

      {/* Voice / Text Check-In Modal */}
      <NewCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCheckInComplete={handleCheckInComplete}
      />

      {/* Live Human-to-Human Voice Conversation Call Modal */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => {
          setIsVoiceCallOpen(false);
          setVoiceCallInitialQuery(undefined);
        }}
        userName={userName}
        initialQuery={voiceCallInitialQuery}
        onStomachPainAlert={triggerStomachPainAlert}
        onHeartPainAlert={triggerHeartPainAlert}
      />

      {/* Floating Hands-Free 'Siri / Aura' Wake-Word Orb */}
      <SiriFloatingOrb
        userName={userName}
        isVoiceCallOpen={isVoiceCallOpen}
        onOpenVoiceCall={(initialQuery?: string) => {
          setVoiceCallInitialQuery(initialQuery);
          setIsVoiceCallOpen(true);
        }}
      />

      {/* Emergency Assist SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        contacts={contacts}
      />

      {/* Automatic WhatsApp Alert Modal for Relatives */}
      <WhatsAppAlertModal
        isOpen={isWhatsAppAlertOpen}
        onClose={() => setIsWhatsAppAlertOpen(false)}
        symptomText={alertSymptomText}
        contacts={contacts}
      />
    </div>
  );
}
