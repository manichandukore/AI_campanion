export type TabType = 'Overview' | 'Wellness Trends' | 'Care Circle' | 'Settings';

export interface BodyObservation {
  id: string;
  part: string;
  condition: string;
  status: 'Stable' | 'Observation' | 'Watch' | 'Emergency';
  details: string;
  recommendation: string;
  cx: number;
  cy: number;
  color: 'teal' | 'orange' | 'purple' | 'red';
  iconType: 'brain' | 'heart' | 'speech' | 'knee';
  side: 'front' | 'back' | 'both';
}

export interface CheckInLog {
  id: string;
  time: string;
  title: string;
  type: 'Morning' | 'Evening' | 'Afternoon' | 'Emergency';
  note: string;
  dotColor: 'teal' | 'purple' | 'orange';
}

export interface Contact {
  id: string;
  initials: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  location?: string;
  avatarBg: string;
  isPrimary?: boolean;
  autoWhatsAppEnabled?: boolean;
}

export type CareContact = Contact;

export interface WellnessData {
  userTitle: string;
  overallScore: number;
  overallWellness: string;
  wellnessSubtext: string;
  lastCheckinTime: string;
  lastCheckinSubtext: string;
  moodStatus: string;
  moodSubtext: string;
  nextActivity: string;
  nextActivitySubtext: string;
  lastSpokenNote: string;
  dailyNote: string;
  sleepHours: number;
  moodPercent: number;
  medAdherence: number;
  observations: BodyObservation[];
  recentLogs: CheckInLog[];
  contacts: Contact[];
}
