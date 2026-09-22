import React, { useState, useEffect, useMemo } from 'react';
import WorkerTaskCard from '../components/worker/WorkerTaskCard';
import WorkerTaskDetails from '../components/worker/WorkerTaskDetails';
import {
  getTickets,
  startTicketTask,
  submitResolutionForVerification,
} from '../services/ticketService.js';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  HardHat,
  Inbox,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'in_progress' | 'completed'
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const allTickets = await getTickets();
      const tList = Array.isArray(allTickets) ? allTickets : [];
      setTickets(tList);
    } catch (err) {
      console.error('Worker dashboard load error:', err);
      setError('Unable to load assigned work orders. Please try again.');
    } finally {
      if (showSpinner) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-switch to In Progress tab if Assigned has 0 tasks but In Progress has active tasks
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  useEffect(() => {
    if (!loading && !hasAutoSelected && tickets.length > 0) {
      const assignedCount = tickets.filter(
        (t) => t.status === 'Assigned' || t.status === 'Rework Required'
      ).length;
      const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
      if (assignedCount === 0 && inProgressCount > 0) {
        setActiveTab('in_progress');
        setHasAutoSelected(true);
      }
    }
  }, [loading, tickets, hasAutoSelected]);

  // Sub-queues filtered by state
  const assignedTasks = useMemo(
    () =>
      tickets.filter(
        (t) => t.status === 'Assigned' || t.status === 'Rework Required'
      ),
    [tickets]
  );

  const inProgressTasks = useMemo(
    () => tickets.filter((t) => t.status === 'In Progress'),
    [tickets]
  );

  const completedOrReviewTasks = useMemo(
    () => tickets.filter((t) => t.status === 'Resolved' || t.status === 'Pending Verification'),
    [tickets]
  );

  // Start Task
  const handleStartTask = async (ticketId, openModal = true) => {
    const found = tickets.find((t) => t.ticketId === ticketId || t._id === ticketId);
    if (found || openModal) {
      setSelectedTask((prev) => ({ ...(prev || found || { ticketId }), status: 'In Progress' }));
    }
    setActiveTab('in_progress');

    try {
      const updated = await startTicketTask(ticketId);
      const updatedData = updated?.ticket || updated?.data || updated || {};
      
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === ticketId || t._id === ticketId
            ? { ...t, status: 'In Progress', ...updatedData }
            : t
        )
      );

      setSelectedTask((prev) =>
        prev && (prev.ticketId === ticketId || prev._id === ticketId)
          ? { ...prev, status: 'In Progress', ...updatedData }
          : found
          ? { ...found, status: 'In Progress', ...updatedData }
          : null
      );

      loadData(false);
    } catch (err) {
      console.error('Failed to start task:', err);
    }
  };

  // Submit Resolution for AI Verification
  const handleResolveTask = async (ticketId, resolutionPayload) => {
    try {
      const { photo, note } = resolutionPayload;
      const updated = await submitResolutionForVerification(ticketId, {
        resolutionPhoto: photo,
        resolutionNote: note,
      });
      const updatedData = updated?.ticket || updated?.data || updated || {};

      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === ticketId || t._id === ticketId
            ? { ...t, status: 'Pending Verification', ...updatedData }
            : t
        )
      );

      setSelectedTask((prev) =>
        prev && (prev.ticketId === ticketId || prev._id === ticketId)
          ? { ...prev, status: 'Pending Verification', ...updatedData }
          : null
      );

      setActiveTab('completed');
      loadData(false);
    } catch (err) {
      console.error('Failed to submit resolution:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2 sm:py-4 px-3 sm:px-4">
      {/* Worker Authenticated Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">{user?.name}</h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {user?.workerId || 'Worker'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.department || 'Field Operations Unit'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="text-xs text-rose-700 underline font-extrabold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3 Status Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('assigned')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'assigned'
              ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-100'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Assigned</span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeTab === 'assigned'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {assignedTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'in_progress'
              ? 'bg-white text-purple-700 shadow-xs ring-1 ring-purple-100'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>In Progress</span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeTab === 'in_progress'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {inProgressTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-100'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Review / Done</span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
              activeTab === 'completed'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {completedOrReviewTasks.length}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading && tickets.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading your assigned tasks...</p>
        </div>
      )}

      {/* Tasks List */}
      {!loading && (
        <div className="space-y-3.5">
          {/* Tab 1: Assigned */}
          {activeTab === 'assigned' && (
            <>
              {assignedTasks.length === 0 ? (
                inProgressTasks.length > 0 ? (
                  <EmptyState
                    title="Work Order in Progress"
                    message={`You have ${inProgressTasks.length} task currently In Progress. Continue work and capture the completion photo.`}
                    actionLabel="View In-Progress Task & Take Photo"
                    onAction={() => {
                      setActiveTab('in_progress');
                      if (inProgressTasks[0]) setSelectedTask(inProgressTasks[0]);
                    }}
                  />
                ) : (
                  <EmptyState message="No tasks assigned yet. You will be notified when the municipal authority dispatches work orders to you." />
                )
              ) : (
                assignedTasks.map((task) => (
                  <WorkerTaskCard
                    key={task.ticketId}
                    ticket={task}
                    onOpenTask={(t) => setSelectedTask(t)}
                    onStartTask={handleStartTask}
                    distanceText={task.status === 'Rework Required' ? 'Rework Needed' : 'Assigned Order'}
                  />
                ))
              )}
            </>
          )}

          {/* Tab 2: In Progress */}
          {activeTab === 'in_progress' && (
            <>
              {inProgressTasks.length === 0 ? (
                <EmptyState message="No tasks currently in progress. Start an assigned task above when you arrive on site." />
              ) : (
                inProgressTasks.map((task) => (
                  <WorkerTaskCard
                    key={task.ticketId}
                    ticket={task}
                    onOpenTask={(t) => setSelectedTask(t)}
                    distanceText="Active site"
                  />
                ))
              )}
            </>
          )}

          {/* Tab 3: Review / Done */}
          {activeTab === 'completed' && (
            <>
              {completedOrReviewTasks.length === 0 ? (
                <EmptyState message="No tasks submitted for review or resolved yet." />
              ) : (
                completedOrReviewTasks.map((task) => (
                  <WorkerTaskCard
                    key={task.ticketId}
                    ticket={task}
                    onOpenTask={(t) => setSelectedTask(t)}
                    distanceText={task.status === 'Pending Verification' ? 'Audit Pending' : 'Resolved'}
                  />
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <WorkerTaskDetails
          ticket={selectedTask}
          currentWorker={user}
          onClose={() => setSelectedTask(null)}
          onStartTask={handleStartTask}
          onResolveTask={handleResolveTask}
        />
      )}
    </div>
  );
}

function EmptyState({ title = 'No tasks in this queue', message, actionLabel, onAction }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center space-y-3.5 shadow-2xs">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        <Inbox className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{message}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
