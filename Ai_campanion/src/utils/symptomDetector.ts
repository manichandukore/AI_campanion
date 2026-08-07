import { BodyObservation } from '../types';

export const isStomachPainMentioned = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("stomach") ||
    lower.includes("stomachache") ||
    lower.includes("stomach pain") ||
    lower.includes("stamoh") ||
    lower.includes("stoma") ||
    lower.includes("abdomen") ||
    lower.includes("abdominal") ||
    lower.includes("కడుపు") ||
    lower.includes("పొట్ట") ||
    lower.includes("కడుపు నొప్పి") ||
    lower.includes("పొట్ట నొప్పి") ||
    lower.includes("పొట్టలో నొప్పి") ||
    lower.includes("కడుపులో నొప్పి") ||
    lower.includes("पेट दर्द") ||
    lower.includes("पेट में दर्द") ||
    lower.includes("belly pain") ||
    lower.includes("kadupulo") ||
    lower.includes("kadupu")
  );
};

export const isGasMentioned = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("gas") ||
    lower.includes("acidity") ||
    lower.includes("bloating") ||
    lower.includes("గ్యాస్") ||
    lower.includes("ఉబ్బరం") ||
    lower.includes("జీర్ణం") ||
    lower.includes("पेट में गैस") ||
    lower.includes("एसिडिटी")
  );
};

export const createStomachObservation = (userText: string = "Stomach pain reported"): BodyObservation => ({
  id: 'stomach-alert-' + Date.now(),
  part: 'Stomach',
  condition: 'Stomach Pain / Gas',
  status: 'Emergency',
  details: `Acute abdominal discomfort: "${userText}"`,
  recommendation: '🚨 RED ALERT: Acute stomach pain reported during check-in. Emergency WhatsApp notification dispatched immediately to primary care circle (Suresh Dev & Lakshmi Devi).',
  cx: 100,
  cy: 110,
  color: 'red',
  iconType: 'heart',
  side: 'both',
});

export const isHeartPainMentioned = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("heart") ||
    lower.includes("heart pain") ||
    lower.includes("chest") ||
    lower.includes("chest pain") ||
    lower.includes("heart attack") ||
    lower.includes("cardiac") ||
    lower.includes("chest tightness") ||
    lower.includes("angina") ||
    lower.includes("heart discomfort") ||
    lower.includes("గుండె") ||
    lower.includes("గుండె నొప్పి") ||
    lower.includes("గుండెలో నొప్పి") ||
    lower.includes("ఛాతీ") ||
    lower.includes("ఛాతీ నొప్పి") ||
    lower.includes("గుండె భారంగా") ||
    lower.includes("दिल") ||
    lower.includes("दिल में दर्द") ||
    lower.includes("सीने में दर्द") ||
    lower.includes("छाती में दर्द") ||
    lower.includes("हार्ट पेन") ||
    lower.includes("gundello") ||
    lower.includes("gunde") ||
    lower.includes("chathi")
  );
};

export const createHeartObservation = (userText: string = "Heart / Chest pain reported"): BodyObservation => ({
  id: 'heart-alert-' + Date.now(),
  part: 'Heart',
  condition: 'Heart / Chest Pain',
  status: 'Emergency',
  details: `Acute cardiac/chest discomfort: "${userText}"`,
  recommendation: '🚨 RED EMERGENCY ALERT: Acute Heart / Chest pain reported during voice check-in. Immediate WhatsApp emergency alert and clinical protocol dispatched to primary care circle (Suresh Dev & Dr. Roy Pillai).',
  cx: 96,
  cy: 80,
  color: 'red',
  iconType: 'heart',
  side: 'front',
});

export const isEmergencySymptomMentioned = (text: string): boolean => {
  return isHeartPainMentioned(text) || isStomachPainMentioned(text) || isGasMentioned(text);
};


