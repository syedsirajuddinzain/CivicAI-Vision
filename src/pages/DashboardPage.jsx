import React from 'react';
import { LayoutDashboard, FileText, Clock, AlertTriangle, CheckCircle, Inbox } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Reports', value: 0, icon: FileText, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { label: 'Pending', value: 0, icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { label: 'In Progress', value: 0, icon: AlertTriangle, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { label: 'Resolved', value: 0, icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            <span>Authority Dashboard</span>
          </h1>
          <p className="text-slate-600 mt-1">Municipal management view for incoming reports and field dispatch.</p>
        </div>
        <span className="self-start sm:self-auto bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
          Step 1 Static Shell
        </span>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Reports Table / Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Civic Reports</h2>
          <span className="text-xs text-slate-500">Showing 0 entries</span>
        </div>

        {/* Empty State Display */}
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No reports logged yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Submitted citizen reports will appear here for authority triage and worker dispatch in future steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
