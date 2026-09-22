import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-850 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-700/50">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Driven Municipal Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            CivicAI — AI-Powered Civic Issue Reporting & Routing Platform
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            Report civic concerns in seconds, automatically classify issues with AI vision, auto-route to municipal departments & wards, and follow live progress through resolution.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/report"
              className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </Link>

            <Link
              to="/my-reports"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Track My Reports</span>
            </Link>

            <Link
              to="/authority"
              className="inline-flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700 font-medium px-5 py-3.5 rounded-xl transition-all"
            >
              <span>Authority Portal</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative grid/glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            End-to-End Civic Intelligence
          </h2>
          <p className="text-slate-600 mt-2">
            Connecting citizens, municipal departments, and field technicians seamlessly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Citizen Intake</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload photos with auto-geolocation and instant AI classification for potholes, streetlights, wastewater, and sanitation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Department Routing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Rules-based and geospatial algorithms assign reports to the right municipal department and local ward automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Worker Dispatch</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Smart field worker matching, dispatching, and mobile-friendly task management with proof-of-work submission.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Verification & Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Before/after image verification, visual 6-stage lifecycle tracking, and in-app citizen notifications.
            </p>
          </div>
        </div>
      </section>

      {/* Live System Status Banner */}
      <section className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-base sm:text-lg text-white">
              CivicAI System Active — Steps 1 through 8 Operational
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Citizen Reporting, AI Intake, Routing, Authority Dashboard, Worker Dispatch, AI Resolution Audit, and Citizen Tracking are live.
            </p>
          </div>
        </div>

        <Link
          to="/my-reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow-xs transition-colors"
        >
          <span>Open Citizen Tracker</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
