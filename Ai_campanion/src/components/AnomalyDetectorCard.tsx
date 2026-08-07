import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Sliders,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  evaluatePersonalAnomaly,
  MOCK_RAJAMMA_BASELINE,
  ElderCheckInMetrics,
  AnomalyEvaluationResult
} from '../ml/anomalyEngine';

export const AnomalyDetectorCard: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<ElderCheckInMetrics>({
    elderId: 'rajamma',
    timestamp: new Date().toISOString(),
    pauseTime: 3.4,
    responseWords: 10,
    repetitionScore: 0.22,
    missedDoses: 1,
    moodScore: 6.0,
  });

  const [evaluation, setEvaluation] = useState<AnomalyEvaluationResult | null>(null);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);

  // Run Isolation Forest ML Anomaly evaluation
  const runEvaluation = (metrics: ElderCheckInMetrics) => {
    const res = evaluatePersonalAnomaly(metrics, MOCK_RAJAMMA_BASELINE);
    setEvaluation(res);
  };

  useEffect(() => {
    runEvaluation(currentMetrics);
  }, [currentMetrics]);

  const resetToNormal = () => {
    const normal: ElderCheckInMetrics = {
      elderId: 'rajamma',
      timestamp: new Date().toISOString(),
      pauseTime: 1.2,
      responseWords: 25,
      repetitionScore: 0.05,
      missedDoses: 0,
      moodScore: 8.5,
    };
    setCurrentMetrics(normal);
  };

  const setSimulatedAnomaly = () => {
    const anomaly: ElderCheckInMetrics = {
      elderId: 'rajamma',
      timestamp: new Date().toISOString(),
      pauseTime: 3.8,
      responseWords: 8,
      repetitionScore: 0.32,
      missedDoses: 1,
      moodScore: 5.2,
    };
    setCurrentMetrics(anomaly);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl shadow-inner">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                ML Anomaly Monitor
              </h2>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                Isolation Forest
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Detects deviations from Rajamma's 14-day personal baseline
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetToNormal}
            className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Reset Normal
          </button>
          <button
            onClick={setSimulatedAnomaly}
            className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Simulate Deviation
          </button>
          <button
            onClick={() => setIsInteractiveMode(!isInteractiveMode)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              isInteractiveMode
                ? 'bg-purple-700 text-white'
                : 'bg-purple-50 text-purple-800 border border-purple-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isInteractiveMode ? 'Hide Sliders' : 'ML Sliders'}</span>
          </button>
        </div>
      </div>

      {/* Main Status & Gauge Display */}
      {evaluation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Anomaly Gauge Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              evaluation.isAnomaly
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Isolation Forest Score
              </span>
              {evaluation.isAnomaly ? (
                <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              )}
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight">
                  {evaluation.anomalyScore.toFixed(2)}
                </span>
                <span className="text-xs text-stone-500 font-bold">/ 1.0</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    evaluation.isAnomaly ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(evaluation.anomalyScore * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wide font-black ${
                  evaluation.isAnomaly
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {evaluation.isAnomaly ? 'Deviation Detected' : 'Normal Baseline'}
              </span>
              <span className="text-stone-500 font-medium">
                ({evaluation.baselineDaysCount} Days Baseline)
              </span>
            </div>
          </div>

          {/* Caregiver Explanation Layer Findings */}
          <div className="md:col-span-2 bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Caregiver Explainable Findings Layer (explain.py)
              </h3>

              <ul className="space-y-2 mt-2">
                {evaluation.caregiverFindings.map((finding, idx) => (
                  <li
                    key={idx}
                    className="text-xs sm:text-sm font-semibold text-stone-800 bg-white p-2.5 rounded-xl border border-stone-200 flex items-start gap-2 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action */}
            <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs font-bold text-purple-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-700 shrink-0" />
                <span>{evaluation.recommendedAction}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Feature Sliders Mode */}
      {isInteractiveMode && (
        <div className="bg-purple-50/60 p-4 sm:p-5 rounded-2xl border border-purple-200/80 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-700" />
              Interactive Feature Vector Tuning
            </h3>
            <span className="text-xs font-bold text-purple-700">
              Real-time Isolation Forest Test
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
            {/* 1. Pause Time */}
            <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
              <div className="flex justify-between mb-1">
                <span>Average Speech Pause</span>
                <span className="text-purple-700">{currentMetrics.pauseTime.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={currentMetrics.pauseTime}
                onChange={(e) =>
                  setCurrentMetrics({ ...currentMetrics, pauseTime: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-stone-400 font-normal">Baseline: ~1.2s</span>
            </div>

            {/* 2. Response Words */}
            <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
              <div className="flex justify-between mb-1">
                <span>Average Response Words</span>
                <span className="text-purple-700">{currentMetrics.responseWords} words</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={currentMetrics.responseWords}
                onChange={(e) =>
                  setCurrentMetrics({ ...currentMetrics, responseWords: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-stone-400 font-normal">Baseline: ~25 words</span>
            </div>

            {/* 3. Repetition Score */}
            <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
              <div className="flex justify-between mb-1">
                <span>Repetition Score</span>
                <span className="text-purple-700">{(currentMetrics.repetitionScore * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.02"
                value={currentMetrics.repetitionScore}
                onChange={(e) =>
                  setCurrentMetrics({ ...currentMetrics, repetitionScore: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-stone-400 font-normal">Baseline: ~5%</span>
            </div>

            {/* 4. Missed Doses */}
            <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
              <div className="flex justify-between mb-1">
                <span>Missed Doses</span>
                <span className="text-purple-700">{currentMetrics.missedDoses} doses</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={currentMetrics.missedDoses}
                onChange={(e) =>
                  setCurrentMetrics({ ...currentMetrics, missedDoses: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-stone-400 font-normal">Baseline: 0 missed</span>
            </div>

            {/* 5. Mood Score */}
            <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
              <div className="flex justify-between mb-1">
                <span>Mood Score</span>
                <span className="text-purple-700">{currentMetrics.moodScore.toFixed(1)}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={currentMetrics.moodScore}
                onChange={(e) =>
                  setCurrentMetrics({ ...currentMetrics, moodScore: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-stone-400 font-normal">Baseline: ~8.5/10</span>
            </div>
          </div>
        </div>
      )}

      {/* Safety Rule Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-center gap-2 text-xs font-semibold text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Safety Rule:</strong> The Isolation Forest model detects statistical behavioral deviations to assist caregivers and family members, but does <u>NOT</u> diagnose medical conditions.
        </span>
      </div>
    </div>
  );
};
