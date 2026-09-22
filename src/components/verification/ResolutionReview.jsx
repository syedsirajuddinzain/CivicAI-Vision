import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Send,
  Loader2,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import BeforeAfterComparison from './BeforeAfterComparison';
import VerificationResult from './VerificationResult';

export default function ResolutionReview({
  ticket,
  onApprove,
  onRequestRework,
}) {
  const [reworkNote, setReworkNote] = useState('');
  const [showReworkInput, setShowReworkInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApprove(ticket._id || ticket.ticketId);
      setIsProcessing(false);
    }, 300);
  };

  const handleReworkSubmit = (e) => {
    e.preventDefault();
    if (!reworkNote.trim()) {
      alert('Please provide specific rework instructions for the field worker.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onRequestRework(ticket._id || ticket.ticketId, reworkNote.trim());
      setIsProcessing(false);
      setShowReworkInput(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-blue-200 p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Resolution Verification & Authority Audit
          </h3>
        </div>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Authority Review Pending
        </span>
      </div>

      {/* 1. Side-by-Side Before & After Comparison */}
      <BeforeAfterComparison
        beforeImage={ticket.imageUrl || ticket.image}
        afterImage={ticket.resolutionImageUrl || ticket.resolutionPhoto}
        issueType={ticket.issueType}
      />

      {/* Worker's Resolution Note */}
      {ticket.resolutionNote && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
            Field Worker Note ({ticket.resolvedBy || ticket.assignedWorkerName || 'Worker'})
          </span>
          <p className="italic text-slate-700">"{ticket.resolutionNote}"</p>
        </div>
      )}

      {/* 2. AI Assessment & Reasoning */}
      {ticket.verification && (
        <VerificationResult verification={ticket.verification} />
      )}

      {/* 3. Decision Control Actions */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Authority Decision
          </span>
          <span className="text-[11px] text-slate-400">
            Final sign-off remains with authority official
          </span>
        </div>

        {!showReworkInput ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Approve Resolution Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-emerald-900/20 active:scale-[0.99] transition cursor-pointer text-xs sm:text-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Work Completed</span>
                </>
              )}
            </button>

            {/* Request Rework Toggle */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowReworkInput(true)}
              className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold py-3 px-4 rounded-xl border border-amber-300 active:scale-[0.99] transition cursor-pointer text-xs sm:text-sm disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Request Rework</span>
            </button>
          </div>
        ) : (
          /* Rework Note Input Drawer */
          <form onSubmit={handleReworkSubmit} className="space-y-3 bg-amber-50/70 border border-amber-200 p-4 rounded-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Specify Deficiencies / Rework Instructions</span>
              </span>
              <button
                type="button"
                onClick={() => setShowReworkInput(false)}
                className="text-xs text-amber-700 hover:underline font-semibold"
              >
                Cancel
              </button>
            </div>

            <textarea
              required
              rows={2}
              value={reworkNote}
              onChange={(e) => setReworkNote(e.target.value)}
              placeholder="e.g. Surface remains uneven along boundary seams. Additional compactor pass required."
              className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Rework Instructions to Worker</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
