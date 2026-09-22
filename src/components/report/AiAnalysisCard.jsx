import React from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle,
  RotateCcw,
  Construction,
  Lightbulb,
  Droplets,
  Trash2,
  HelpCircle,
  Building2,
  Cpu,
  ShieldAlert,
  Settings2,
} from 'lucide-react';

const ISSUE_ICONS = {
  'Road / Pothole': Construction,
  'Pothole / Road Damage': Construction,
  'Electrical / Streetlight': Lightbulb,
  'Streetlight / Electrical Issue': Lightbulb,
  'Drainage / Wastewater': Droplets,
  'Drainage / Wastewater Issue': Droplets,
  'Garbage / Sanitation': Trash2,
  'Garbage / Sanitation Issue': Trash2,
  'Other / Unknown': HelpCircle,
};

const SEVERITY_COLORS = {
  Low: 'bg-blue-100 text-blue-800 border-blue-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
};

export default function AiAnalysisCard({
  photo,
  aiResult,
  isAnalyzing,
  aiError,
  onAnalyze,
  onOpenSettings,
}) {
  if (!photo) return null;

  const IssueIcon = (aiResult && ISSUE_ICONS[aiResult.issueType]) || Sparkles;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/10 text-blue-600 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">AI Civic Issue Detection</span>
        </div>
        {aiResult && !isAnalyzing && (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Analysis Complete</span>
          </span>
        )}
      </div>

      {/* Case 1: Active Analysis / Loading State */}
      {isAnalyzing && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 text-center space-y-4 border border-slate-800 shadow-lg animate-in fade-in">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-slate-800 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">
              Analyzing photo with Vision AI...
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scanning infrastructure damage, measuring visual surface features, and auto-matching the responsible municipal department.
            </p>
          </div>

          <div className="w-full max-w-xs mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 h-full w-3/4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Case 2: Error State */}
      {!isAnalyzing && aiError && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">
                AI Vision Analysis Notice
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {aiError}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onAnalyze()}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry AI Analysis</span>
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Open AI Settings</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Case 3: Initial Waiting State */}
      {!aiResult && !isAnalyzing && !aiError && (
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-5 text-center space-y-3">
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">Automatic AI Diagnostics</h3>
            <p className="text-xs text-slate-600">
              Photo attached. Click below to analyze photo with Vision AI.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAnalyze()}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Photo Now</span>
          </button>
        </div>
      )}

      {/* Case 4: AI Result Available */}
      {aiResult && !isAnalyzing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Main Issue Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
                <IssueIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  AI Detected Issue
                </span>
                <h4 className="text-base font-black text-slate-900">{aiResult.issueType}</h4>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Confidence percentage */}
              <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-center min-w-[75px]">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">
                  Certainty
                </span>
                <span className="text-sm font-black text-blue-600">
                  {Math.round((aiResult.confidence || 0) * 100)}%
                </span>
              </div>

              {/* Severity Pill */}
              <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-center min-w-[75px]">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">
                  Severity
                </span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md border inline-block ${
                    SEVERITY_COLORS[aiResult.severity] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {aiResult.severity || 'Medium'}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-Routed Municipal Department Card */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Target Municipal Department
                </span>
                <h5 className="text-sm font-black text-slate-900">
                  {aiResult.departmentName || 'Municipal Authority Department'}
                </h5>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
              Auto-Matched ✓
            </span>
          </div>

          {/* AI Visual Description */}
          {aiResult.description && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-blue-900 block mb-0.5">AI Visual Assessment:</span>
              {aiResult.description}
            </div>
          )}

          {/* Engine Info & Re-analyze */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>{aiResult.engineUsed || 'Vision AI Engine'}</span>
            </span>

            <button
              type="button"
              onClick={() => onAnalyze()}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Re-analyze</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
