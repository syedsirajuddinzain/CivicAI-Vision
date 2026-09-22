import React from 'react';
import { Search, RotateCcw, Filter, X } from 'lucide-react';
import { DEPARTMENT_ROUTING_MAP } from '../../config/departmentRouting';
import { MOCK_WARDS } from '../../config/wards';
import { TICKET_STATUSES, SEVERITY_LEVELS } from '../../services/ticketService';
import { SUPPORTED_ISSUE_TYPES } from '../../services/aiService';

const DEPARTMENTS_LIST = Object.values(DEPARTMENT_ROUTING_MAP);

export default function TicketFilters({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  issueTypeFilter,
  onIssueTypeChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  wardFilter,
  onWardChange,
  onResetFilters,
  totalMatching,
  totalTickets,
}) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(departmentFilter) ||
    Boolean(issueTypeFilter) ||
    Boolean(severityFilter) ||
    Boolean(statusFilter) ||
    Boolean(wardFilter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Ticket ID (e.g. CIV-2026) or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{totalMatching}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{totalTickets}</strong> reports
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold underline underline-offset-2 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {/* Department */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Department
          </label>
          <select
            value={departmentFilter || ''}
            onChange={(e) => onDepartmentChange(e.target.value || null)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS_LIST.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Type */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Issue Type
          </label>
          <select
            value={issueTypeFilter || ''}
            onChange={(e) => onIssueTypeChange(e.target.value || null)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">All Categories</option>
            {SUPPORTED_ISSUE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Severity
          </label>
          <select
            value={severityFilter || ''}
            onChange={(e) => onSeverityChange(e.target.value || null)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">All Severities</option>
            {SEVERITY_LEVELS.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Status
          </label>
          <select
            value={statusFilter || ''}
            onChange={(e) => onStatusChange(e.target.value || null)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">All Statuses</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Municipal Ward
          </label>
          <select
            value={wardFilter || ''}
            onChange={(e) => onWardChange(e.target.value || null)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">All Wards</option>
            {MOCK_WARDS.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
