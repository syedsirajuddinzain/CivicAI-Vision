import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';

const STATUS_CONFIG = {
  'Likely Resolved': {
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    containerClass: 'bg-emerald-50/60 border-emerald-200',
  },
  'Possibly Resolved': {
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    containerClass: 'bg-amber-50/60 border-amber-200',
  },
  'Not Resolved': {
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold',
    icon: XCircle,
    iconColor: 'text-rose-600',
    containerClass: 'bg-rose-50/60 border-rose-200',
  },
  'Unable to Verify': {
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold',
    icon: HelpCircle,
    iconColor: 'text-slate-600',
    containerClass: 'bg-slate-50 border-slate-200',
  },
};

export default function VerificationResult({ verification }) {
  if (!verification) return null;

  const { verificationStatus, confidence, reason, requiresHumanReview } = verification;
  const config = STATUS_CONFIG[verificationStatus] || STATUS_CONFIG['Unable to Verify'];
  const StatusIcon = config.icon;
  const confidencePercent = confidence ? Math.round(confidence * 100) : null;

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${config.containerClass}`}>
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-lg shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              AI Assessment
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
              <span className="font-extrabold text-slate-900 text-sm">{verificationStatus}</span>
            </div>
          </div>
        </div>

        {/* Confidence Badge */}
        {confidencePercent && (
          <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Confidence</span>
            <span className="text-xs font-extrabold text-blue-600">{confidencePercent}%</span>
          </div>
        )}
      </div>

      {/* AI Reason explanation */}
      <div className="space-y-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-500 block">
          Visual Comparison Reasoning
        </span>
        <p className="text-slate-700 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/80">
          "{reason}"
        </p>
      </div>

      {/* Human Review Alert Banner if applicable */}
      {requiresHumanReview && (
        <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-900 font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Manual Review Required: Visual evidence is inconclusive or shows remaining defects. Authority review recommended.
          </span>
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic">
        * Safety Notice: AI assessments are advisory estimates and do not guarantee structural or safety compliance. Final approval remains with the authority.
      </p>
    </div>
  );
}
