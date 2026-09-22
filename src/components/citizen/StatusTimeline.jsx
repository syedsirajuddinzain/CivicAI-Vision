import React from 'react';
import {
  CheckCircle2,
  Building2,
  HardHat,
  Clock,
  Sparkles,
  CheckSquare,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const CITIZEN_STATUS_MESSAGES = {
  Reported: 'Your report has been received.',
  Assigned: 'A municipal team has been assigned.',
  'In Progress': 'Work is currently being carried out.',
  'Pending Verification': 'The repair has been submitted for verification.',
  'Rework Required': 'Additional work is required.',
  Resolved: 'The reported issue has been resolved.',
  Rejected: 'This report could not be processed by city authorities.',
  'Manual Review': 'Under municipal authority review.',
};

export default function StatusTimeline({ status, ticket }) {
  const currentStatus = status || 'Reported';
  const friendlyMessage =
    CITIZEN_STATUS_MESSAGES[currentStatus] || 'Your report is being processed.';

  // Determine active stage indices (1 to 6)
  const getActiveStageIndex = (st) => {
    switch (st) {
      case 'Reported':
        return 1;
      case 'Assigned':
        return 3;
      case 'In Progress':
        return 4;
      case 'Rework Required':
        return 4;
      case 'Pending Verification':
        return 5;
      case 'Resolved':
        return 6;
      case 'Rejected':
        return 1;
      default:
        return 1;
    }
  };

  const activeStage = getActiveStageIndex(currentStatus);

  const stages = [
    {
      step: 1,
      title: 'Report Submitted',
      desc: 'Received and verified by CivicAI',
      icon: CheckCircle2,
    },
    {
      step: 2,
      title: 'Department Assigned',
      desc: ticket?.department ? `Assigned to ${ticket.department}` : 'Department matched',
      icon: Building2,
    },
    {
      step: 3,
      title: 'Worker Assigned',
      desc: ticket?.assignedWorkerName ? `${ticket.assignedWorkerName} dispatched` : 'Field worker dispatched',
      icon: HardHat,
    },
    {
      step: 4,
      title: 'Work In Progress',
      desc: currentStatus === 'Rework Required' ? 'Additional work in progress' : 'Active on-site repair',
      icon: Clock,
    },
    {
      step: 5,
      title: 'Resolution Submitted',
      desc: 'Proof submitted for AI verification',
      icon: Sparkles,
    },
    {
      step: 6,
      title: 'Resolved',
      desc: 'Repair verified and closed by city authority',
      icon: CheckSquare,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Friendly Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center gap-3 ${
          currentStatus === 'Resolved'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : currentStatus === 'Rework Required'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : currentStatus === 'Rejected'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}
      >
        <div className="p-2 rounded-xl bg-white shadow-2xs">
          {currentStatus === 'Resolved' ? (
            <CheckSquare className="w-5 h-5 text-emerald-600" />
          ) : currentStatus === 'Rework Required' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : currentStatus === 'Rejected' ? (
            <XCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Current Status
          </span>
          <p className="font-extrabold text-sm sm:text-base leading-tight">
            {friendlyMessage}
          </p>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Lifecycle Progress Tracker
        </span>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {stages.map((st) => {
            const isCompleted = st.step < activeStage || (currentStatus === 'Resolved' && st.step === 6);
            const isCurrent = st.step === activeStage && currentStatus !== 'Resolved';
            const Icon = st.icon;

            return (
              <div key={st.step} className="relative flex items-start gap-3.5 group">
                {/* Milestone Node */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold leading-tight ${
                        isCompleted
                          ? 'text-slate-900 font-extrabold'
                          : isCurrent
                          ? 'text-blue-600 font-extrabold'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {st.title}
                    </h4>

                    {isCompleted && (
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Done ✓
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        In Progress
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[11px] mt-0.5 ${
                      isCompleted || isCurrent ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
