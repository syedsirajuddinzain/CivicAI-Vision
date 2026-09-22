import React, { useState, useEffect } from 'react';
import {
  HardHat,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Building2,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Shield,
  UserCheck,
} from 'lucide-react';
import {
  getWorkers,
  createWorker,
  removeWorker,
  getWorkerRequests,
  approveWorkerRequest,
  rejectWorkerRequest,
} from '../../services/workerService';

export default function WorkerManagementSection({ departmentId, departmentName }) {
  const [activeSubTab, setActiveSubTab] = useState('roster'); // 'roster' | 'requests'
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Add Worker Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Worker123!');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remove Worker Confirmation
  const [removingWorker, setRemovingWorker] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Action processing IDs
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [workerList, requestList] = await Promise.all([
        getWorkers({ departmentId }),
        getWorkerRequests(),
      ]);
      setWorkers(Array.isArray(workerList) ? workerList : []);
      setRequests(Array.isArray(requestList) ? requestList : []);
    } catch (err) {
      console.error('Failed to load worker management data:', err);
      setError(err.message || 'Unable to load worker records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [departmentId]);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createWorker({
        name,
        email,
        password,
        phone,
        departmentId: departmentId || 'dept_roads',
        departmentName: departmentName || 'Roads & Infrastructure Department',
        skills,
      });

      setSuccessMsg(`Worker ${name} created and activated successfully!`);
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setSkills('');
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Create worker error:', err);
      setError(err.message || 'Failed to add worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveWorker = async () => {
    if (!removingWorker) return;
    setIsRemoving(true);
    try {
      await removeWorker(removingWorker.workerId || removingWorker._id);
      setSuccessMsg(`Worker ${removingWorker.name} removed from active roster`);
      setRemovingWorker(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Remove worker error:', err);
      setError(err.message || 'Failed to remove worker');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleApproveRequest = async (request) => {
    setProcessingId(request._id);
    try {
      await approveWorkerRequest(request._id);
      setSuccessMsg(`Worker request for ${request.name} approved! Account is now active.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Approve worker error:', err);
      setError(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (request) => {
    setProcessingId(request._id);
    try {
      await rejectWorkerRequest(request._id);
      setSuccessMsg(`Worker request for ${request.name} has been rejected.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Reject worker error:', err);
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'roster'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Active Department Workers ({workers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'requests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Worker Registration Requests ({requests.length})</span>
          </button>
        </div>

        {activeSubTab === 'roster' && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Worker</span>
          </button>
        )}
      </div>

      {/* Notices */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading municipal worker records...</p>
        </div>
      )}

      {/* VIEW 1: ACTIVE WORKERS ROSTER */}
      {!loading && activeSubTab === 'roster' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Department Field Personnel Roster
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized field workers available for municipal work order dispatch.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              {workers.length} Personnel
            </span>
          </div>

          {workers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <HardHat className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-slate-700">No active workers in this department.</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Click here to add your first department worker.
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {workers.map((w) => (
                <div
                  key={w._id || w.workerId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-slate-900">{w.name}</h4>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {w.workerId || w._id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          w.availabilityStatus === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {w.availabilityStatus || 'Available'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.departmentName || w.department}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.wardName || w.ward}</span>
                      </span>
                      {w.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{w.phone}</span>
                        </span>
                      )}
                    </div>

                    {w.skills && w.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(Array.isArray(w.skills) ? w.skills : [w.skills]).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setRemovingWorker(w)}
                    className="self-end sm:self-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Worker</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: WORKER REGISTRATION REQUESTS */}
      {!loading && activeSubTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Pending Worker Registration Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve or reject prospective municipal workers requesting access.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              {requests.length} Pending
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-slate-700">No pending worker registration requests.</p>
              <p className="text-xs text-slate-400">
                When new personnel sign up to join your department, their approval requests will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => {
                const isProcessing = processingId === req._id;
                return (
                  <div
                    key={req._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{req.name}</h4>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span>Email: <strong className="text-slate-700">{req.email}</strong></span>
                        {req.phone && <span>Phone: <strong className="text-slate-700">{req.phone}</strong></span>}
                        <span>Target Department: <strong className="text-blue-700">{req.departmentName}</strong></span>
                      </div>

                      {req.skills && (
                        <p className="text-xs text-slate-600">
                          Specialties:{' '}
                          <span className="font-semibold">
                            {Array.isArray(req.skills) ? req.skills.join(', ') : req.skills}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRejectRequest(req)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApproveRequest(req)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Approve Worker</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD WORKER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Add Department Worker</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zain Malik"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="zain.worker@civicai.gov"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Pothole Repair, Asphalt Laying"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Activate Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE WORKER CONFIRMATION MODAL */}
      {removingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Remove Worker from Active Roster?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong className="text-slate-800">{removingWorker.name}</strong> ({removingWorker.workerId || removingWorker._id})? They will no longer be assigned tasks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setRemovingWorker(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isRemoving}
                onClick={handleRemoveWorker}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm Removal</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
