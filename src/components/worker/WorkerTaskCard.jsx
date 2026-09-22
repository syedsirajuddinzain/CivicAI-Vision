import React from 'react';
import {
  MapPin,
  Navigation,
  Flame,
  Clock,
  ArrowRight,
  Shield,
  Building2,
  Tag,
  CheckCircle2,
  Play,
  Camera,
} from 'lucide-react';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

const SEVERITY_BADGES = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold',
  High: 'bg-orange-100 text-orange-800 border-orange-200 font-bold',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
  Low: 'bg-blue-100 text-blue-800 border-blue-200 font-medium',
};

const STATUS_BADGES = {
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  'Pending Verification': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rework Required': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function WorkerTaskCard({ ticket, onOpenTask, onStartTask, distanceText }) {
  const isUrgent = ticket.severity === 'Critical' || ticket.severity === 'High';
  const isAssigned = ticket.status === 'Assigned' || ticket.status === 'Rework Required';
  const isInProgress = ticket.status === 'In Progress';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all space-y-3.5">
      {/* Top Meta row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-blue-600 text-xs sm:text-sm">
            {ticket.ticketId}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              STATUS_BADGES[ticket.status] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {ticket.status}
          </span>
        </div>

        {/* Severity Badge */}
        <span
          className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            SEVERITY_BADGES[ticket.severity] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {isUrgent && <Flame className="w-3 h-3 text-rose-500" />}
          <span>{ticket.severity}</span>
        </span>
      </div>

      {/* Main Content: Photo Thumbnail + Details */}
      <div className="flex items-start gap-3.5">
        {/* Photo Thumbnail */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 relative">
          {(() => {
            const imageSrc = getSafeImageUrl(ticket.imageUrl || ticket.image);
            return imageSrc ? (
              <img
                src={imageSrc}
                alt="Citizen reported issue evidence"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                <Shield className="w-6 h-6 mb-0.5 opacity-50" />
                <span className="text-[9px] font-bold uppercase tracking-wider">No Photo</span>
              </div>
            );
          })()}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5 text-xs">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
            {ticket.issueType}
          </h3>

          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{ticket.department}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
              {ticket.ward}
            </span>

            {distanceText && (
              <span className="flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span>{distanceText}</span>
              </span>
            )}
          </div>

          {ticket.description && (
            <p className="text-[11px] text-slate-500 italic line-clamp-2">
              "{ticket.description}"
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{ticket.formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {isAssigned && onStartTask && (
            <button
              type="button"
              onClick={() => onStartTask(ticket.ticketId, true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Task</span>
            </button>
          )}

          {isInProgress ? (
            <button
              type="button"
              onClick={() => onOpenTask(ticket)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Completion Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenTask(ticket)}
              className={`inline-flex items-center gap-1.5 font-bold px-3.5 py-2 rounded-xl text-xs transition active:scale-[0.98] cursor-pointer ${
                isAssigned
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              }`}
            >
              <span>{isAssigned ? 'Details' : 'View Task'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
