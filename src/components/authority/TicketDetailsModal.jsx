import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Tag,
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Map,
  Shield,
  HardHat,
  Phone,
  UserCheck,
  CheckSquare,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  TICKET_STATUSES,
  assignWorkerToTicket,
  approveResolution,
  requestRework,
  updateTicketStatus,
  deleteTicket,
} from '../../services/ticketService.js';
import WorkerAssignmentModal from './WorkerAssignmentModal';
import ResolutionReview from '../verification/ResolutionReview';
import BeforeAfterComparison from '../verification/BeforeAfterComparison';
import VerificationResult from '../verification/VerificationResult';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';
import { Trash2 } from 'lucide-react';

const SEVERITY_BADGES = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold',
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

export default function TicketDetailsModal({ ticket, onClose, onUpdateStatus, onTicketDeleted }) {
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status || 'Reported');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setCurrentTicket(ticket);
      setSelectedStatus(ticket.status || 'Reported');
    }
  }, [ticket]);

  if (!currentTicket) return null;

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await deleteTicket(currentTicket.ticketId || currentTicket._id);
      if (onTicketDeleted) {
        onTicketDeleted(currentTicket.ticketId);
      }
      onClose();
    } catch (err) {
      console.error('Delete task failed:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusSave = async (newStatus) => {
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    try {
      const updated = await updateTicketStatus(
        currentTicket._id || currentTicket.ticketId,
        newStatus
      );
      if (updated) {
        setCurrentTicket(updated);
        setSelectedStatus(updated.status || newStatus);
        onUpdateStatus(currentTicket.ticketId, newStatus, updated);
      } else {
        onUpdateStatus(currentTicket.ticketId, newStatus);
      }
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update status on server:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignWorker = async (ticketId, worker) => {
    try {
      const workerId = worker.workerId || worker._id;
      const targetId = currentTicket._id || ticketId;
      const updated = await assignWorkerToTicket(targetId, workerId);
      if (updated) {
        setCurrentTicket(updated);
        setSelectedStatus(updated.status || 'Assigned');
        onUpdateStatus(currentTicket.ticketId, updated.status || 'Assigned', updated);
      }
      setShowAssignModal(false);
    } catch (err) {
      console.warn('Assignment failed:', err);
      setShowAssignModal(false);
    }
  };

  // Authority Approves Resolution
  const handleApproveResolution = async (ticketId) => {
    try {
      const targetId = currentTicket._id || ticketId;
      const updated = await approveResolution(targetId);
      if (updated) {
        setCurrentTicket(updated);
        setSelectedStatus('Resolved');
        onUpdateStatus(currentTicket.ticketId, 'Resolved', updated);
      } else {
        setSelectedStatus('Resolved');
        onUpdateStatus(currentTicket.ticketId, 'Resolved');
      }
    } catch (err) {
      console.warn('Approve failed:', err);
    }
  };

  // Authority Requests Rework
  const handleRequestRework = async (ticketId, reworkNote) => {
    try {
      const targetId = currentTicket._id || ticketId;
      const updated = await requestRework(targetId, reworkNote);
      if (updated) {
        setCurrentTicket(updated);
        setSelectedStatus('Rework Required');
        onUpdateStatus(currentTicket.ticketId, 'Rework Required', updated);
      } else {
        setSelectedStatus('Rework Required');
        onUpdateStatus(currentTicket.ticketId, 'Rework Required');
      }
    } catch (err) {
      console.warn('Rework failed:', err);
    }
  };

  const confidencePercent = currentTicket.confidence || currentTicket.aiConfidence
    ? Math.round((currentTicket.confidence || currentTicket.aiConfidence) * (currentTicket.confidence > 1 ? 1 : 100))
    : null;

  const hasResolutionProof = Boolean(
    currentTicket.resolutionPhoto || currentTicket.resolutionImageUrl
  );
  const isPendingVerification = currentTicket.status === 'Pending Verification';
  const isResolved = currentTicket.status === 'Resolved';
  const isReworkRequired = currentTicket.status === 'Rework Required';
  const formattedDate =
    currentTicket.formattedDate ||
    (currentTicket.createdAt
      ? new Date(currentTicket.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recently');

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono font-extrabold text-blue-400 text-lg sm:text-xl">
                {currentTicket.ticketId}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  STATUS_BADGES[selectedStatus] || 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedStatus}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
            {/* 1. Resolution Verification & Audit Module if after proof exists */}
            {hasResolutionProof && (
              <div className="space-y-4">
                {isPendingVerification ? (
                  <ResolutionReview
                    ticket={currentTicket}
                    onApprove={handleApproveResolution}
                    onRequestRework={handleRequestRework}
                  />
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                        Resolution Proof Audit History
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {currentTicket.status}
                      </span>
                    </div>

                    <BeforeAfterComparison
                      beforeImage={currentTicket.imageUrl || currentTicket.image}
                      afterImage={
                        currentTicket.resolutionImageUrl || currentTicket.resolutionPhoto
                      }
                      issueType={currentTicket.issueType}
                    />

                    {currentTicket.verification && (
                      <VerificationResult verification={currentTicket.verification} />
                    )}

                    {isReworkRequired && currentTicket.reworkInstructions && (
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-900">
                        <span className="font-bold block text-xs">
                          Rework Dispatched to Worker:
                        </span>
                        <p className="italic text-xs mt-0.5">
                          "{currentTicket.reworkInstructions}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Original Report Info & Citizen Photo Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Citizen Evidence Photo */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Citizen Photo Evidence
                </span>
                <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
                  {(() => {
                    const imageSrc = getSafeImageUrl(
                      currentTicket.imageUrl || currentTicket.image
                    );
                    return imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Citizen report proof"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <Shield className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-xs">No photographic evidence attached</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* AI Diagnostics & Severity */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  AI Issue Diagnostics
                </span>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Classified Category
                    </span>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {currentTicket.issueType}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Model Confidence
                      </span>
                      <span className="font-bold text-blue-600 mt-0.5 block">
                        {confidencePercent ? `${confidencePercent}%` : 'High (Vision)'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Estimated Severity
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${
                          SEVERITY_BADGES[currentTicket.severity] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {currentTicket.severity}
                      </span>
                    </div>
                  </div>

                  {currentTicket.description && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Citizen Description / Summary
                      </span>
                      <p className="italic text-slate-700 text-xs mt-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                        "{currentTicket.description}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Department & Ward Routing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 border border-blue-100 rounded-2xl p-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Assigned Municipal Department
                </span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-extrabold text-slate-900 text-sm">
                    {currentTicket.department || currentTicket.departmentName}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Municipal Ward & Zone
                </span>
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-extrabold text-slate-900 text-sm">
                    {currentTicket.ward || currentTicket.wardName}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Field Worker Dispatch Section */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                    Field Worker Dispatch
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {currentTicket.assignedWorkerName
                      ? 'Worker has been dispatched to this civic order'
                      : 'No field personnel assigned yet'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <HardHat className="w-4 h-4" />
                  <span>
                    {currentTicket.assignedWorkerName ? 'Reassign Worker' : 'Assign Worker'}
                  </span>
                </button>
              </div>

              {currentTicket.assignedWorkerName && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">
                          {currentTicket.assignedWorkerName}
                        </span>
                        {currentTicket.assignedWorkerId && (
                          <span className="text-[10px] font-mono text-slate-400">
                            ({currentTicket.assignedWorkerId})
                          </span>
                        )}
                      </div>
                      {currentTicket.assignedWorkerPhone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{currentTicket.assignedWorkerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      STATUS_BADGES[currentTicket.status] ||
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    Status: {currentTicket.status}
                  </span>
                </div>
              )}
            </div>

            {/* 5. Location & Timestamp Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentTicket.latitude && currentTicket.longitude
                      ? `Lat: ${Number(currentTicket.latitude).toFixed(4)}°, Lng: ${Number(
                          currentTicket.longitude
                        ).toFixed(4)}°`
                      : 'Coordinates not recorded'}
                  </span>
                </div>

                <span className="text-slate-400 text-[11px]">
                  Logged on {formattedDate}
                </span>
              </div>
            </div>

            {/* 6. Manual Status Override Bar */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Manual Status Override
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Direct administrative override for municipal operations.
                  </p>
                </div>

                {statusSuccess && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Status Updated!</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {TICKET_STATUSES.map((st) => {
                  const isSelected = selectedStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusSave(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              title="Permanently remove task from active municipal records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Task</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Task Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Are you sure you want to remove this task?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will permanently delete ticket <strong className="text-slate-800 font-mono">{currentTicket.ticketId}</strong> from the municipal database and all associated records.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTask}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Assignment Modal Sub-dialog */}
      {showAssignModal && (
        <WorkerAssignmentModal
          ticket={currentTicket}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignWorker}
        />
      )}
    </>
  );
}
