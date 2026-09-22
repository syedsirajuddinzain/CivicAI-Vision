import React from 'react';
import {
  ExternalLink,
  Construction,
  Lightbulb,
  Droplets,
  Trash2,
  HelpCircle,
  Clock,
  MapPin,
  Flame,
  ChevronRight,
  Inbox,
  Download,
  HardHat,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

const CATEGORY_ICONS = {
  'Pothole / Road Damage': Construction,
  'Streetlight / Electrical Issue': Lightbulb,
  'Drainage / Wastewater Issue': Droplets,
  'Garbage / Sanitation Issue': Trash2,
  'Other / Unknown': HelpCircle,
};

const SEVERITY_BADGES = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold ring-1 ring-rose-300',
  High: 'bg-orange-100 text-orange-800 border-orange-200 font-bold',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
  Low: 'bg-blue-100 text-blue-800 border-blue-200 font-medium',
};

const STATUS_BADGES = {
  Reported: 'bg-amber-50 text-amber-700 border-amber-200',
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
  'Pending Verification': 'bg-cyan-50 text-cyan-700 border-cyan-200 font-bold',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rework Required': 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  Rejected: 'bg-slate-100 text-slate-600 border-slate-200',
  'Manual Review': 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function TicketTable({
  tickets = [],
  onSelectTicket,
  onAssignTicket,
  onUpdateStatus,
}) {
  // Export current filtered tickets to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) return;

    const headers = [
      'Ticket ID',
      'Issue Type',
      'Severity',
      'Status',
      'Department',
      'Ward',
      'Assigned Worker',
      'Created Date',
      'Latitude',
      'Longitude',
      'Description',
    ];

    const rows = tickets.map((t) => [
      t.ticketId || '',
      `"${(t.issueType || '').replace(/"/g, '""')}"`,
      t.severity || '',
      t.status || '',
      `"${(t.department || t.departmentName || '').replace(/"/g, '""')}"`,
      `"${(t.ward || t.wardName || '').replace(/"/g, '""')}"`,
      `"${(t.assignedWorkerName || 'Unassigned').replace(/"/g, '""')}"`,
      t.createdAt || t.formattedDate || '',
      t.latitude || '',
      t.longitude || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `civic_reports_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Inbox className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">No matching tickets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing your filters, or waiting for new citizen reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
          <span>Active View:</span>
          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            {tickets.length} records
          </span>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs transition cursor-pointer active:scale-95"
          title="Download current filtered tickets as CSV spreadsheet"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Photo</th>
              <th className="py-3.5 px-4">Ticket ID</th>
              <th className="py-3.5 px-4">Issue Type</th>
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Ward</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Worker</th>
              <th className="py-3.5 px-4">Logged Time</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {tickets.map((ticket) => {
              const Icon = CATEGORY_ICONS[ticket.issueType] || HelpCircle;
              const isUrgent = ticket.severity === 'Critical' || ticket.severity === 'High';
              const imageSrc = getSafeImageUrl(ticket.imageUrl || ticket.image);
              const formattedDate =
                ticket.formattedDate ||
                (ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recently');

              return (
                <tr
                  key={ticket.ticketId}
                  onClick={() => onSelectTicket(ticket)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                    ticket.severity === 'Critical' ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Photo Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="Evidence thumbnail"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  </td>

                  {/* Ticket ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                    <span className="group-hover:underline">{ticket.ticketId}</span>
                  </td>

                  {/* Issue Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 whitespace-nowrap">
                        {ticket.issueType}
                      </span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                        SEVERITY_BADGES[ticket.severity] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isUrgent && <Flame className="w-3 h-3 text-rose-500" />}
                      <span>{ticket.severity}</span>
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                    <span className="truncate block max-w-[170px]">
                      {ticket.department || ticket.departmentName}
                    </span>
                  </td>

                  {/* Ward */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                      {ticket.ward || ticket.wardName}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        STATUS_BADGES[ticket.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  {/* Assigned Worker */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {ticket.assignedWorkerName ? (
                      <span className="inline-flex items-center gap-1 text-slate-800 font-bold text-[11px]">
                        <HardHat className="w-3.5 h-3.5 text-blue-600" />
                        <span>{ticket.assignedWorkerName}</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Created Time */}
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {ticket.latitude && ticket.longitude ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-mono text-[11px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>
                          {Number(ticket.latitude).toFixed(4)}°, {Number(ticket.longitude).toFixed(4)}°
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No GPS</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {(!ticket.assignedWorkerName || ticket.status === 'Reported') && onAssignTicket && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignTicket(ticket);
                          }}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 font-bold px-2.5 py-1.5 rounded-lg transition text-xs shadow-2xs cursor-pointer"
                          title="Quick Assign Field Worker"
                        >
                          <HardHat className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket);
                        }}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold px-3 py-1.5 rounded-lg transition text-xs shadow-2xs cursor-pointer"
                        title="View Complete Report Dossier"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
