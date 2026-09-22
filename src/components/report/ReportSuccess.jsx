import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  MapPin,
  Tag,
  FileText,
  Calendar,
  Building2,
  Map,
  ShieldAlert,
  Flame,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import RoutingPipeline from './RoutingPipeline';

const SEVERITY_BADGES = {
  Low: 'bg-blue-100 text-blue-800 border-blue-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
};

export default function ReportSuccess({ ticketData, onReset }) {
  const [copied, setCopied] = useState(false);

  const confidencePercent = ticketData.confidence
    ? Math.round(ticketData.confidence * 100)
    : null;

  const hasCoordinates = ticketData.latitude && ticketData.longitude;

  const handleCopyId = () => {
    if (navigator.clipboard && ticketData?.ticketId) {
      navigator.clipboard.writeText(ticketData.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-2 sm:py-4 space-y-6">
      {/* Main Success Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-lg space-y-6">
        {/* Top Header */}
        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
            Report Submitted Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ticket Created & Routed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your civic issue has been automatically classified, assigned to the responsible municipal department, and mapped to your local ward.
          </p>
        </div>

        {/* Prominent Ticket ID Card with Copy Feature */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center shadow-md space-y-2 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Official Ticket ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <p className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-400 tracking-wider">
              {ticketData.ticketId}
            </p>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
              title="Copy Ticket ID to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-xs font-medium">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{ticketData.formattedDate || new Date().toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Status: {ticketData.status}</span>
          </div>
        </div>

        {/* Primary Action Button: Track This Report */}
        <div className="p-1">
          <Link
            to={`/my-reports/${ticketData.ticketId}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Track This Report in Real-Time</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Structured Routing Result Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Routing Breakdown
            </h2>
            {confidencePercent && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                AI Confidence: {confidencePercent}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Detected Issue */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Detected Issue</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{ticketData.issueType}</p>
            </div>

            {/* Severity */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Severity Level</span>
              <div className="mt-1">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border inline-block ${
                    SEVERITY_BADGES[ticketData.severity] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ticketData.severity}
                </span>
              </div>
            </div>

            {/* Assigned Department */}
            <div className="p-3 bg-white rounded-xl border border-blue-100 bg-blue-50/20 sm:col-span-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase block">
                Assigned Department
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-extrabold text-slate-900 text-sm">
                  {ticketData.department}
                </span>
              </div>
            </div>

            {/* Ward */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Municipal Ward</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Map className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-bold text-slate-800">{ticketData.ward}</span>
              </div>
            </div>

            {/* Location Status */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Location Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-emerald-700 truncate">
                  {hasCoordinates ? 'Location detected successfully' : 'Default central location'}
                </span>
              </div>
            </div>
          </div>

          {/* Description Snippet */}
          {ticketData.description && (
            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Issue Description
              </span>
              <p className="italic bg-white p-3 rounded-xl border border-slate-200/80">
                "{ticketData.description}"
              </p>
            </div>
          )}
        </div>

        {/* Visual Pipeline (Reported -> Department Assigned -> Worker Assignment -> Resolution) */}
        <div className="pt-2 text-left">
          <RoutingPipeline
            currentStatus={ticketData.status}
            assignedDepartment={ticketData.department}
          />
        </div>

        {/* Secondary Navigation Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 active:scale-[0.98] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Submit Another Report</span>
          </button>

          <Link
            to="/my-reports"
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 active:scale-[0.98] transition"
          >
            <span>View All My Reports</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
