import React from 'react';
import { CheckCircle2, Building2, HardHat, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';

export default function RoutingPipeline({
  currentStatus = 'Reported',
  assignedDepartment,
  assignedWorkerName,
}) {
  const isAssigned =
    currentStatus === 'Assigned' ||
    currentStatus === 'In Progress' ||
    currentStatus === 'Pending Verification' ||
    currentStatus === 'Rework Required' ||
    currentStatus === 'Resolved';

  const isInProgress =
    currentStatus === 'In Progress' ||
    currentStatus === 'Pending Verification' ||
    currentStatus === 'Rework Required' ||
    currentStatus === 'Resolved';

  const isResolutionSubmitted =
    currentStatus === 'Pending Verification' || currentStatus === 'Resolved';

  const isResolved = currentStatus === 'Resolved';
  const isRework = currentStatus === 'Rework Required';

  const steps = [
    {
      id: 'reported',
      label: 'Report Submitted',
      desc: 'Civic issue verified by AI',
      icon: CheckCircle2,
      isComplete: true,
      badge: 'Verified ✓',
    },
    {
      id: 'department',
      label: 'Department Assigned',
      desc: assignedDepartment || 'Routed to Municipal Unit',
      icon: Building2,
      isComplete: true,
      badge: 'Routed ✓',
    },
    {
      id: 'worker',
      label: 'Worker Dispatched',
      desc: assignedWorkerName ? `Assigned to ${assignedWorkerName}` : 'Field personnel assigned',
      icon: HardHat,
      isComplete: isAssigned,
      badge: isAssigned ? (isInProgress ? 'In Field' : 'Assigned ✓') : 'Pending',
    },
    {
      id: 'progress',
      label: 'Resolution Submitted',
      desc: isResolutionSubmitted
        ? 'Proof submitted for audit'
        : isRework
        ? 'Additional work in progress'
        : 'Awaiting field repair',
      icon: Sparkles,
      isComplete: isResolutionSubmitted,
      badge: isResolutionSubmitted
        ? 'Submitted ✓'
        : isRework
        ? 'In Progress'
        : 'Pending',
    },
    {
      id: 'resolution',
      label: 'Resolved',
      desc: isResolved ? 'Issue resolution approved' : 'Awaiting authority sign-off',
      icon: CheckSquare,
      isComplete: isResolved,
      badge: isResolved ? 'Resolved ✓' : 'Pending',
    },
  ];

  const activeCount = steps.filter((s) => s.isComplete).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Citizen Resolution Timeline
        </span>
        <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Stage {activeCount} of 5 Completed
        </span>
      </div>

      {/* Citizen Rework Alert if additional work requested */}
      {isRework && (
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Additional work has been requested by municipal officials to ensure complete repair.</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-2xl border transition-all relative ${
                step.isComplete
                  ? 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200/80 text-slate-400 opacity-75'
              }`}
            >
              <div className="flex flex-col items-start gap-2">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    step.isComplete
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block">0{index + 1}</span>
                  <p
                    className={`text-xs font-bold leading-tight truncate ${
                      step.isComplete ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{step.desc}</p>
                </div>
              </div>

              <div className="mt-2 text-right">
                <span
                  className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                    step.isComplete
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : 'text-slate-400 bg-slate-100 border-slate-200'
                  }`}
                >
                  {step.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
