import React from 'react';
import { HardHat, ClipboardList, CheckCircle2, CheckSquare } from 'lucide-react';

export default function WorkerPage() {
  const stats = [
    { label: 'Assigned Tasks', value: 0, icon: ClipboardList, color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    { label: 'Completed', value: 0, icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <HardHat className="w-8 h-8 text-amber-600" />
            <span>Worker Dashboard</span>
          </h1>
          <p className="text-slate-600 mt-1">Field personnel task queue and resolution logging portal.</p>
        </div>
        <span className="self-start sm:self-auto bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
          Step 1 Static Shell
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${stat.color}`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">My Assigned Work Orders</h2>
          <span className="text-xs text-slate-500">0 tasks assigned</span>
        </div>

        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No tasks yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              When authority officials route issues to your team, active field tasks will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
