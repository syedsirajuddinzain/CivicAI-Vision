import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  isOnline,
  getPendingReports,
  removePendingReport,
  subscribeConnectivity,
} from '../../services/offlineQueueService';
import { createTicket } from '../../services/ticketService';

export default function OfflineBanner({ onReportsSynced }) {
  const [online, setOnline] = useState(true);
  const [pendingReports, setPendingReports] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);

  const refreshQueue = () => {
    setPendingReports(getPendingReports());
  };

  useEffect(() => {
    setOnline(isOnline());
    refreshQueue();

    const unsubscribe = subscribeConnectivity((status) => {
      setOnline(status);
      refreshQueue();
    });

    const handleQueueUpdated = () => refreshQueue();
    window.addEventListener('civic_offline_queue_updated', handleQueueUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('civic_offline_queue_updated', handleQueueUpdated);
    };
  }, []);

  const handleSyncAll = async () => {
    if (!online || pendingReports.length === 0) return;
    setSyncing(true);

    try {
      let count = 0;
      for (const item of pendingReports) {
        createTicket({
          issueType: item.issueType,
          severity: item.severity,
          confidence: item.confidence,
          description: item.description,
          image: item.image,
          latitude: item.latitude,
          longitude: item.longitude,
          ward: item.ward,
          department: item.department,
        });
        removePendingReport(item.tempId);
        count++;
      }

      setSyncSuccessMsg(`Successfully synced ${count} pending civic report(s)!`);
      if (onReportsSynced) onReportsSynced();
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setSyncing(false);
      refreshQueue();
    }
  };

  // If online and no pending reports, show nothing
  if (online && pendingReports.length === 0 && !syncSuccessMsg) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 px-4 py-2 w-full max-w-5xl mx-auto animate-in slide-in-from-top duration-200">
      {/* Offline Alert */}
      {!online && (
        <div className="bg-amber-600 text-white rounded-2xl p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-500">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <WifiOff className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold leading-tight">
                You are offline.
              </h4>
              <p className="text-[11px] text-amber-100 mt-0.5">
                Your report will be saved locally and submitted when connection is restored.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-black/20 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            Offline Storage Active
          </span>
        </div>
      )}

      {/* Online with Pending Reports Ready to Sync */}
      {online && pendingReports.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-3.5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-blue-500">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold leading-tight">
                Connection restored!
              </h4>
              <p className="text-[11px] text-blue-100 mt-0.5">
                You have {pendingReports.length} report(s) waiting in your offline queue.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.98] text-blue-900 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Pending Reports...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit {pendingReports.length} Queued Report{pendingReports.length > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Sync Success Feedback */}
      {syncSuccessMsg && (
        <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-md flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}
    </div>
  );
}
