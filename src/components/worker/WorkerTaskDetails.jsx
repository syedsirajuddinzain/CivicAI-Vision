import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Navigation,
  CheckSquare,
  Shield,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import ResolutionForm from './ResolutionForm';
import BeforeAfterComparison from '../verification/BeforeAfterComparison';
import VerificationResult from '../verification/VerificationResult';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

const SEVERITY_BADGES = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function WorkerTaskDetails({
  ticket,
  currentWorker,
  onClose,
  onStartTask,
  onResolveTask,
}) {
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  React.useEffect(() => {
    if (ticket?.status) {
      setCurrentStatus(ticket.status);
    }
  }, [ticket?.status]);

  if (!ticket) return null;

  const isAssigned = currentStatus === 'Assigned';
  const isInProgress = currentStatus === 'In Progress';
  const isPendingVerification = currentStatus === 'Pending Verification';
  const isReworkRequired = currentStatus === 'Rework Required';
  const isResolved = currentStatus === 'Resolved';

  const handleStart = async () => {
    setCurrentStatus('In Progress');
    setIsStarting(true);
    try {
      await onStartTask(ticket.ticketId);
    } catch (err) {
      console.error('Failed to start task:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleResolve = async (resolutionData) => {
    setCurrentStatus('Pending Verification');
    setIsSubmittingResolution(true);
    try {
      await onResolveTask(ticket.ticketId, resolutionData);
    } catch (err) {
      console.error('Failed to resolve task:', err);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const confidencePercent = ticket.confidence
    ? Math.round(ticket.confidence * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="font-mono font-extrabold text-blue-400 text-base sm:text-lg block">
              {ticket.ticketId}
            </span>
            <span className="text-[11px] text-slate-400">
              Work Order Details • {ticket.department}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Rework Alert Banner */}
          {isReworkRequired && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-2 text-rose-900 animate-in shake">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Rework Requested by City Authority</span>
              </div>
              <p className="text-xs text-rose-800">
                The authority reviewed your resolution photo and requested adjustments:
              </p>
              {ticket.reworkInstructions && (
                <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs italic font-medium text-slate-800">
                  "{ticket.reworkInstructions}"
                </div>
              )}
            </div>
          )}

          {/* Pending Verification Notice */}
          {isPendingVerification && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 space-y-2 text-blue-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Resolution Pending Authority Audit</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  AI Assessed
                </span>
              </div>
              <p className="text-xs text-blue-800">
                Your AFTER photo was verified by AI and forwarded to city officials for final sign-off.
              </p>
            </div>
          )}

          {/* Status & Priority Badge Strip */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current State</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isPendingVerification
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : isReworkRequired
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : isInProgress
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                }`}
              >
                {ticket.status}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Priority</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${
                  SEVERITY_BADGES[ticket.severity] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {ticket.severity}
              </span>
            </div>
          </div>

          {/* If Resolved or in Verification: Show Before vs After Comparison */}
          {(ticket.resolutionPhoto || ticket.resolutionImageUrl) ? (
            <div className="space-y-3">
              <BeforeAfterComparison
                beforeImage={ticket.imageUrl || ticket.image}
                afterImage={ticket.resolutionImageUrl || ticket.resolutionPhoto}
                issueType={ticket.issueType}
              />

              {ticket.verification && (
                <VerificationResult verification={ticket.verification} />
              )}
            </div>
          ) : (
            /* Citizen Original Photo (BEFORE) */
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                BEFORE — Citizen Evidence Photo
              </span>
              <div className="relative aspect-video max-h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
                {(() => {
                  const imageSrc = getSafeImageUrl(ticket.imageUrl || ticket.image);
                  return imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="Original civic problem reported by citizen"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                      }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <Shield className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">No image provided</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Issue & AI Diagnostics */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-extrabold text-slate-900 text-sm">{ticket.issueType}</span>
              {confidencePercent && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Initial AI Confidence: {confidencePercent}%
                </span>
              )}
            </div>

            {ticket.description && (
              <p className="text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80">
                "{ticket.description}"
              </p>
            )}
          </div>

          {/* GPS Location & Map Pinpoint */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Work Site Location
              </span>
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {ticket.ward}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>
                  {ticket.latitude && ticket.longitude
                    ? `${ticket.latitude}°, ${ticket.longitude}°`
                    : 'Coordinates not provided'}
                </span>
              </div>

              {ticket.latitude && ticket.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${ticket.latitude},${ticket.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-sans font-bold inline-flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Navigate (Maps)</span>
                </a>
              )}
            </div>
          </div>

          {/* Action State 1: Assigned -> Worker clicks [Start Task] */}
          {(isAssigned || isReworkRequired) && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-3">
              <div>
                <h4 className="text-sm font-extrabold text-blue-900">
                  {isReworkRequired ? 'Rework Execution Required' : 'Task Ready to Begin'}
                </h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Click below when beginning work to change state to "In Progress".
                </p>
              </div>

              <button
                type="button"
                disabled={isStarting}
                onClick={handleStart}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl shadow-md shadow-blue-900/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Status...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{isReworkRequired ? 'Resume Rework (In Progress)' : 'Start Task'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action State 2: In Progress -> Show Resolution Form */}
          {isInProgress && (
            <ResolutionForm
              ticket={ticket}
              onResolve={handleResolve}
              isSubmitting={isSubmittingResolution}
            />
          )}

          {/* Action State 3: Resolved */}
          {isResolved && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Work Order Fully Approved & Resolved</span>
              </div>
              <p className="text-xs text-emerald-700">
                Resolution audited and approved by municipal authority.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Logged on {ticket.formattedDate}</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
