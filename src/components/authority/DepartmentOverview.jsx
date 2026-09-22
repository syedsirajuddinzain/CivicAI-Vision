import React from 'react';
import {
  Construction,
  Lightbulb,
  Droplets,
  Trash2,
  Building,
  Filter,
  Check,
  Flame,
} from 'lucide-react';

const DEPARTMENTS = [
  {
    name: 'Roads & Infrastructure Department',
    shortName: 'Roads & Infrastructure',
    icon: Construction,
    color: 'border-orange-200 bg-orange-50/40 text-orange-700',
    activeRing: 'ring-orange-400 border-orange-500 bg-orange-50/70',
  },
  {
    name: 'Electrical Department',
    shortName: 'Electrical',
    icon: Lightbulb,
    color: 'border-amber-200 bg-amber-50/40 text-amber-700',
    activeRing: 'ring-amber-400 border-amber-500 bg-amber-50/70',
  },
  {
    name: 'Water & Drainage Department',
    shortName: 'Water & Drainage',
    icon: Droplets,
    color: 'border-cyan-200 bg-cyan-50/40 text-cyan-700',
    activeRing: 'ring-cyan-400 border-cyan-500 bg-cyan-50/70',
  },
  {
    name: 'Sanitation Department',
    shortName: 'Sanitation',
    icon: Trash2,
    color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700',
    activeRing: 'ring-emerald-400 border-emerald-500 bg-emerald-50/70',
  },
  {
    name: 'General Municipal Department',
    shortName: 'General Municipal',
    icon: Building,
    color: 'border-slate-200 bg-slate-50 text-slate-700',
    activeRing: 'ring-slate-400 border-slate-500 bg-slate-100',
  },
];

export default function DepartmentOverview({ tickets = [], selectedDepartment, onSelectDepartment }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Departmental Queues & Overview
          </h3>
        </div>
        {selectedDepartment && (
          <button
            type="button"
            onClick={() => onSelectDepartment(null)}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
          >
            Clear Department Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDepartment === dept.name;

          const deptTickets = tickets.filter(
            (t) => t.department === dept.name || t.departmentName === dept.name
          );
          const openCount = deptTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Rejected').length;
          const highPriorityCount = deptTickets.filter(
            (t) => (t.severity === 'Critical' || t.severity === 'High') && t.status !== 'Resolved'
          ).length;
          const resolvedCount = deptTickets.filter((t) => t.status === 'Resolved').length;

          return (
            <button
              key={dept.name}
              type="button"
              onClick={() => onSelectDepartment(isSelected ? null : dept.name)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? `${dept.activeRing} ring-2 shadow-xs`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl border ${dept.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>Active Filter</span>
                    </span>
                  )}
                </div>

                <p className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-1">
                  {dept.shortName}
                </p>
              </div>

              {/* Department Statistics */}
              <div className="grid grid-cols-3 gap-1 pt-3 mt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50/80 rounded-lg p-1">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Open</span>
                  <span className="text-xs font-extrabold text-slate-800">{openCount}</span>
                </div>

                <div className="bg-rose-50/60 rounded-lg p-1">
                  <span className="text-[9px] font-bold text-rose-500 block uppercase">High</span>
                  <span className="text-xs font-extrabold text-rose-700">{highPriorityCount}</span>
                </div>

                <div className="bg-emerald-50/60 rounded-lg p-1">
                  <span className="text-[9px] font-bold text-emerald-600 block uppercase">Done</span>
                  <span className="text-xs font-extrabold text-emerald-700">{resolvedCount}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
