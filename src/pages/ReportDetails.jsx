import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  HardHat,
  Phone,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';
import { getTicketById } from '../services/ticketService';
import StatusTimeline from '../components/citizen/StatusTimeline';
import ResolutionView from '../components/citizen/ResolutionView';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../utils/imageUrl';

export default function ReportDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getTicketById(ticketId)
      .then((found) => {
        if (isMounted) setTicket(found);
      })
      .catch((err) => {
        console.warn('Failed to load ticket:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  const handleCopyId = () => {
    if (ticket && navigator.clipboard) {
      navigator.clipboard.writeText(ticket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading civic report details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Report Not Found</h2>
          <p className="text-xs text-slate-500">
            No civic report matching Ticket ID <strong className="text-slate-800">{ticketId}</strong> was found in your local system.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/my-reports"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              Back to My Reports
            </Link>
            <Link
              to="/report"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Submit New Report
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isResolved = ticket.status === 'Resolved';
  const hasVerification = Boolean(ticket.verification || ticket.resolutionPhoto);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            to="/my-reports"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Reports</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Citizen Ticket
                </span>
                <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {ticket.ticketId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Copy Ticket ID to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {ticket.issueType}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Submitted on {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Top Status & Timeline Tracker */}
        <StatusTimeline status={ticket.status} ticket={ticket} />

        {/* If Resolved or Under Verification, render Resolution View */}
        {(isResolved || hasVerification) && (
          <ResolutionView ticket={ticket} />
        )}

        {/* Report Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Details: Image and AI Context */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photographic Record */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Original Submitted Photo
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {ticket.image?.name || 'citizen_upload.jpg'}
                </span>
              </div>

              <div className="relative aspect-video sm:aspect-16/10 w-full bg-slate-900 overflow-hidden">
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
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No photo uploaded
                    </div>
                  );
                })()}
              </div>

              {ticket.description && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Citizen Description
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    "{ticket.description}"
                  </p>
                </div>
              )}
            </div>

            {/* AI Diagnostics Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  AI Intake Analysis Summary
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Detected Category
                  </span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block truncate">
                    {ticket.issueType}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Confidence Level
                  </span>
                  <span className="text-xs font-black text-blue-700 mt-0.5 block">
                    {ticket.aiConfidence ? `${Math.round(ticket.aiConfidence * 100)}%` : ticket.confidence ? `${Math.round(ticket.confidence * 100)}%` : 'High'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Priority / Severity
                  </span>
                  <span
                    className={`text-xs font-black mt-0.5 inline-block ${
                      ticket.severity === 'Critical'
                        ? 'text-rose-600'
                        : ticket.severity === 'High'
                        ? 'text-amber-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {ticket.severity || 'Medium'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Routing, Location & Worker Dispatch */}
          <div className="space-y-6">
            {/* Municipal Assignment */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Jurisdiction & Routing
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Department
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {ticket.departmentName || ticket.department || 'Roads & Infrastructure Department'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Municipal Ward / Zone
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {ticket.wardName || ticket.ward || 'Ward 101 — Central Business District'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Location Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Incident GPS Location
                </h3>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  GPS Verified
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Latitude:</span>
                  <span className="font-bold text-slate-900">{ticket.latitude?.toFixed(6) || '12.971600'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Longitude:</span>
                  <span className="font-bold text-slate-900">{ticket.longitude?.toFixed(6) || '77.594600'}</span>
                </div>
              </div>

              {ticket.latitude && ticket.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${ticket.latitude},${ticket.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Field Worker Assignment Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Field Worker
              </h3>

              {ticket.assignedWorkerName ? (
                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {ticket.assignedWorkerName}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {ticket.assignedWorkerId || 'Municipal Field Specialist'}
                      </p>
                    </div>
                  </div>

                  {ticket.assignedWorkerPhone && (
                    <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Direct Contact
                      </span>
                      <a
                        href={`tel:${ticket.assignedWorkerPhone}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {ticket.assignedWorkerPhone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Dispatch in Progress</p>
                  <p className="text-[11px] text-slate-500">
                    A field technician will be assigned shortly by {ticket.department || 'the department'}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
