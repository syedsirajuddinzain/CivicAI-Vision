import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Building2,
  MapPin,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  HardHat,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { CITIZEN_STATUS_MESSAGES } from './StatusTimeline';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

export default function ReportCard({ ticket }) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Resolved',
        };
      case 'Pending Verification':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Pending Verification',
        };
      case 'Rework Required':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Rework Required',
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'In Progress',
        };
      case 'Assigned':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Team Assigned',
        };
      default:
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          label: 'Reported',
        };
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusBadge = getStatusBadge(ticket.status);
  const friendlyStatus = CITIZEN_STATUS_MESSAGES[ticket.status] || 'Report is being processed.';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Header / Image Area */}
      <div>
        <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
          {(() => {
            const imageSrc = getSafeImageUrl(ticket.imageUrl || ticket.image);
            return imageSrc ? (
              <img
                src={imageSrc}
                alt={ticket.issueType}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <Building2 className="w-10 h-10 mb-1 opacity-40" />
                <span className="text-xs font-semibold">No Image Provided</span>
              </div>
            );
          })()}

          {/* Top Overlays */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold border shadow-xs flex items-center gap-1.5 backdrop-blur-md bg-white/90 ${statusBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} animate-pulse`} />
              {statusBadge.label}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border shadow-2xs backdrop-blur-md bg-white/90 ${getSeverityBadge(
                ticket.severity
              )}`}
            >
              {ticket.severity || 'Medium'}
            </span>
          </div>

          {/* Bottom gradient on image */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          {/* Ticket ID & Copy */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
              <span>{ticket.ticketId}</span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy Ticket ID"
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {ticket.formattedDate || (ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recent')}
            </span>
          </div>

          {/* Issue Type Title */}
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {ticket.issueType}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
              {ticket.description || 'No detailed citizen description provided.'}
            </p>
          </div>

          {/* Metadata Badges (Department & Ward) */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{ticket.departmentName || ticket.department || 'Municipal Dept'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{ticket.wardName || ticket.ward || 'Zone'}</span>
            </div>
          </div>

          {/* Assigned Worker if present */}
          {ticket.assignedWorkerName && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
              <HardHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-medium truncate">
                Assigned: <strong className="font-bold text-slate-900">{ticket.assignedWorkerName}</strong>
              </span>
            </div>
          )}

          {/* Friendly Status summary message */}
          <p className="text-xs font-semibold text-slate-600 italic bg-blue-50/50 p-2 rounded-xl border border-blue-100/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span className="truncate">{friendlyStatus}</span>
          </p>
        </div>
      </div>

      {/* Card Footer / Action Button */}
      <div className="p-5 pt-0">
        <Link
          to={`/my-reports/${ticket.ticketId}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all group-hover:ring-2 group-hover:ring-blue-100"
        >
          <span>View Details & Timeline</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
