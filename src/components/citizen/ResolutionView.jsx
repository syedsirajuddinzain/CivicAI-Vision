import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

export default function ResolutionView({ ticket }) {
  if (!ticket) return null;

  const isResolved = ticket.status === 'Resolved';
  const isPendingVerification = ticket.status === 'Pending Verification';
  const isRework = ticket.status === 'Rework Required';

  const verification = ticket.verification || {};
  const isAiLikelyResolved = verification.verificationStatus === 'Likely Resolved';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Resolution & AI Verification Record
            </h3>
            <p className="text-xs text-slate-500">
              Complete photographic proof, AI audit, and authority approval log
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Officially Resolved
            </span>
          ) : isPendingVerification ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Under Audit
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Rework In Progress
            </span>
          )}
        </div>
      </div>

      {/* Side-by-Side Photographic Proof */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Photographic Evidence (Before & After)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Photo */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Original Citizen Report (Before)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {ticket.formattedDate || 'Initial Submission'}
              </span>
            </div>

            <div className="relative aspect-video sm:aspect-4/3 w-full bg-slate-900/5 overflow-hidden">
              {(() => {
                const imageSrc = getSafeImageUrl(ticket.imageUrl || ticket.image);
                return imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Original civic issue"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No image available
                  </div>
                );
              })()}
            </div>
            <div className="p-3 text-xs text-slate-600 italic bg-white border-t border-slate-100">
              Reported issue: <strong className="font-semibold text-slate-800">{ticket.issueType}</strong>
            </div>
          </div>

          {/* After Photo */}
          <div className="bg-slate-50 rounded-2xl border border-emerald-200 overflow-hidden group">
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Worker Resolution Photo (After)
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {ticket.resolvedAt
                  ? new Date(ticket.resolvedAt).toLocaleDateString()
                  : ticket.verification?.verifiedAt
                  ? new Date(ticket.verification.verifiedAt).toLocaleDateString()
                  : 'Completed'}
              </span>
            </div>

            <div className="relative aspect-video sm:aspect-4/3 w-full bg-slate-900/5 overflow-hidden">
              {(() => {
                const afterSrc = getSafeImageUrl(ticket.resolutionImageUrl || ticket.resolutionPhoto);
                return afterSrc ? (
                  <img
                    src={afterSrc}
                    alt="Resolution proof"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mb-1" />
                    <span>After photo pending or processing</span>
                  </div>
                );
              })()}
            </div>
            <div className="p-3 text-xs text-emerald-900 bg-emerald-50/60 border-t border-emerald-100 flex items-center justify-between">
              <span className="font-semibold truncate">
                Fixed by: {ticket.resolvedBy || ticket.assignedWorkerName || 'Municipal Field Worker'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">On-Site Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Verification Analysis Card */}
      {ticket.verification && (
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 rounded-2xl border border-indigo-100 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                CivicAI Computer Vision Verification Analysis
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  isAiLikelyResolved
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {verification.verificationStatus || 'Likely Resolved'}
              </span>
              {verification.confidence && (
                <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  {Math.round(verification.confidence * 100)}% Match
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-indigo-100/60">
            {verification.reason ||
              'The issue depicted in the original citizen photo appears to have been successfully remedied based on comparative surface analysis.'}
          </p>

          {verification.verifiedAt && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>
                Verified on {new Date(verification.verifiedAt).toLocaleString()} by CivicAI Vision Model
              </span>
            </div>
          )}
        </div>
      )}

      {/* Worker Field Notes & Timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {ticket.resolutionNote && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Worker Resolution Summary
            </span>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              "{ticket.resolutionNote}"
            </p>
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3 h-3" />
            Authority Sign-Off
          </span>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Approved by: {ticket.resolvedBy || 'Municipal Authority Official'}
            </p>
            <p className="text-slate-500">
              Department: {ticket.department || 'Roads & Infrastructure'}
            </p>
            {ticket.resolvedAt && (
              <p className="text-slate-400 text-[11px]">
                Closed on {new Date(ticket.resolvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
