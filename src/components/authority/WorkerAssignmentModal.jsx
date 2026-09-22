import React, { useState, useEffect } from 'react';
import {
  X,
  HardHat,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Sparkles,
  Phone,
  Shield,
  Tag,
  Clock,
  Loader2,
  Check,
} from 'lucide-react';
import { getRecommendedWorkers, getWorkers } from '../../services/workerService.js';

const AVAILABILITY_BADGES = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  Busy: 'bg-amber-50 text-amber-700 border-amber-200',
  Offline: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function WorkerAssignmentModal({ ticket, onClose, onAssign }) {
  const [showManualRoster, setShowManualRoster] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [allDepartmentWorkers, setAllDepartmentWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const ticketId = ticket._id || ticket.ticketId;
    Promise.all([
      getRecommendedWorkers(ticketId).catch(() => []),
      getWorkers().catch(() => []),
    ])
      .then(([recs, all]) => {
        if (isMounted) {
          setRecommendations(Array.isArray(recs) ? recs : []);
          setAllDepartmentWorkers(Array.isArray(all) ? all : []);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ticket]);

  const handleSelectWorker = async (worker) => {
    const id = worker.workerId || worker._id;
    setAssigningId(id);
    try {
      await onAssign(ticket._id || ticket.ticketId, worker);
    } catch (err) {
      console.error('Assignment failed:', err);
    } finally {
      setAssigningId(null);
    }
  };

  // Filter department roster matching ticket department or all
  const departmentWorkers = allDepartmentWorkers.filter((w) => {
    const ticketDept = (ticket.department || ticket.departmentName || '').toLowerCase();
    const workerDept = (w.departmentName || w.department || w.departmentId || '').toLowerCase();
    return !ticketDept || workerDept.includes(ticketDept) || ticketDept.includes(workerDept);
  });

  const rosterToDisplay = departmentWorkers.length > 0 ? departmentWorkers : allDepartmentWorkers;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Dispatch Municipal Field Worker</h3>
              <p className="text-[11px] text-slate-400">
                Work Order <span className="font-mono text-blue-400 font-bold">{ticket.ticketId}</span> • {ticket.department || ticket.departmentName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Cancel Dispatch"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Ticket Context Header */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Civic Issue</span>
              <span className="font-bold text-slate-900">{ticket.issueType}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Ward</span>
              <span className="font-bold text-purple-700">{ticket.ward || ticket.wardName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Priority</span>
              <span className="font-bold text-rose-600">{ticket.severity}</span>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <p className="text-xs text-slate-500 font-medium">
                Scoring departmental workers by proximity, skills, and availability...
              </p>
            </div>
          )}

          {!loading && (
            <>
              {/* View 1: AI Recommended Matches */}
              {!showManualRoster && recommendations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI Scored Recommendations</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {recommendations.length} Candidates Scored
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recommendations.map((worker) => {
                      const id = worker.workerId || worker._id;
                      const isAssigning = assigningId === id;
                      const status = worker.availabilityStatus || worker.status || 'Available';
                      const isCurrentlyAssigned = ticket.assignedWorkerId === id;

                      return (
                        <div
                          key={id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isCurrentlyAssigned
                              ? 'border-blue-300 bg-blue-50/30 ring-1 ring-blue-300'
                              : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/50 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  {worker.name}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                  {id}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    AVAILABILITY_BADGES[status] || 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {status}
                                </span>
                                {isCurrentlyAssigned && (
                                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                    Currently Assigned
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {worker.departmentName || worker.department} •{' '}
                                <strong className="text-slate-700">
                                  {worker.wardName || worker.ward}
                                </strong>
                              </p>
                            </div>

                            {/* Match Score & Proximity */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {worker.score != null && (
                                <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-blue-600" />
                                  <span>{worker.score}% Match</span>
                                </span>
                              )}
                              {worker.distanceKm != null && (
                                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                  <Navigation className="w-3 h-3 text-slate-400" />
                                  <span>{worker.distanceKm} km away</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Match Reasons */}
                          {worker.matchReasons && worker.matchReasons.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {worker.matchReasons.map((reason, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>{reason}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Skills list */}
                          {worker.skills && worker.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {worker.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer: Phone + Dispatch Button */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{worker.phone || 'No direct phone registered'}</span>
                            </div>

                            <button
                              type="button"
                              disabled={isAssigning}
                              onClick={() => handleSelectWorker(worker)}
                              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                            >
                              {isAssigning ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Assigning...</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>
                                    {isCurrentlyAssigned ? 'Re-confirm Worker' : 'Dispatch Worker'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* View 2: Full Department Roster */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                          Department Personnel Roster
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          You can manually dispatch any field personnel from the municipal roster below.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {rosterToDisplay.map((worker) => {
                      const id = worker.workerId || worker._id;
                      const isAssigning = assigningId === id;
                      const status = worker.availabilityStatus || worker.status || 'Available';
                      const isCurrentlyAssigned = ticket.assignedWorkerId === id;

                      return (
                        <div
                          key={id}
                          className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900">{worker.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">({id})</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  AVAILABILITY_BADGES[status] || 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {worker.wardName || worker.ward || 'General Zone'} • {worker.phone}
                            </p>
                            {worker.skills && (
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                                {Array.isArray(worker.skills) ? worker.skills.join(', ') : worker.skills}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={isAssigning}
                            onClick={() => handleSelectWorker(worker)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            {isAssigning ? 'Assigning...' : isCurrentlyAssigned ? 'Reassign' : 'Assign'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggle Link between Recommended and Full Roster */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualRoster(!showManualRoster)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold underline underline-offset-2 cursor-pointer"
                >
                  {showManualRoster
                    ? '← Show AI Recommended Matches'
                    : 'View all department personnel roster manually'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Dispatched orders update worker's mobile interface immediately
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
