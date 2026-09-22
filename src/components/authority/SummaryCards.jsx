import React from 'react';
import {
  FileText,
  Clock,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export default function SummaryCards({
  tickets = [],
  activeStatusFilter = null,
  activeSeverityFilter = null,
  onSelectStatusFilter,
  onSelectSeverityFilter,
  onClearFilter,
}) {
  const total = tickets.length;
  const reported = tickets.filter((t) => t.status === 'Reported').length;
  const assigned = tickets.filter((t) => t.status === 'Assigned').length;
  const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
  const pendingVerification = tickets.filter((t) => t.status === 'Pending Verification').length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;
  const highOrCritical = tickets.filter(
    (t) => t.severity === 'Critical' || t.severity === 'High'
  ).length;

  const cards = [
    {
      id: 'total',
      label: 'Total Reports',
      value: total,
      subtext: 'Logged across city wards',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      activeRing: 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/40',
      isActive: !activeStatusFilter && !activeSeverityFilter,
      onClick: () => onClearFilter && onClearFilter(),
    },
    {
      id: 'reported',
      label: 'Reported / New',
      value: reported,
      subtext: 'Awaiting triage & dispatch',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      activeRing: 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/40',
      isActive: activeStatusFilter === 'Reported',
      onClick: () => {
        if (activeStatusFilter === 'Reported') onClearFilter && onClearFilter();
        else onSelectStatusFilter && onSelectStatusFilter('Reported');
      },
    },
    {
      id: 'assigned',
      label: 'Assigned',
      value: assigned,
      subtext: 'Dispatched to workers',
      icon: UserCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/40',
      isActive: activeStatusFilter === 'Assigned',
      onClick: () => {
        if (activeStatusFilter === 'Assigned') onClearFilter && onClearFilter();
        else onSelectStatusFilter && onSelectStatusFilter('Assigned');
      },
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      value: inProgress,
      subtext: 'Active field operations',
      icon: RotateCcw,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      activeRing: 'ring-2 ring-purple-500 border-purple-400 bg-purple-50/40',
      isActive: activeStatusFilter === 'In Progress',
      onClick: () => {
        if (activeStatusFilter === 'In Progress') onClearFilter && onClearFilter();
        else onSelectStatusFilter && onSelectStatusFilter('In Progress');
      },
    },
    {
      id: 'pending_verification',
      label: 'Pending Verification',
      value: pendingVerification,
      subtext: 'After-photo review needed',
      icon: ShieldCheck,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      activeRing: 'ring-2 ring-cyan-500 border-cyan-400 bg-cyan-50/40',
      isActive: activeStatusFilter === 'Pending Verification',
      onClick: () => {
        if (activeStatusFilter === 'Pending Verification') onClearFilter && onClearFilter();
        else onSelectStatusFilter && onSelectStatusFilter('Pending Verification');
      },
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: resolved,
      subtext: 'Verified & closed',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/40',
      isActive: activeStatusFilter === 'Resolved',
      onClick: () => {
        if (activeStatusFilter === 'Resolved') onClearFilter && onClearFilter();
        else onSelectStatusFilter && onSelectStatusFilter('Resolved');
      },
    },
    {
      id: 'urgent',
      label: 'High / Critical',
      value: highOrCritical,
      subtext: 'Urgent priority action',
      icon: Flame,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      activeRing: 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/40',
      isActive: activeSeverityFilter === 'High' || activeSeverityFilter === 'Critical',
      onClick: () => {
        if (activeSeverityFilter === 'High') onClearFilter && onClearFilter();
        else onSelectSeverityFilter && onSelectSeverityFilter('High');
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            title={`Click to filter by ${card.label}`}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
              card.isActive
                ? `${card.activeRing} shadow-sm transform scale-[1.02]`
                : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-center justify-between gap-1 w-full">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5 w-full">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block">
                {card.value}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{card.subtext}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
