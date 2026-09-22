import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  PlusCircle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  Sparkles,
  Inbox,
  Building2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getMyTickets } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import ReportCard from '../components/citizen/ReportCard';

export default function MyReports() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'resolved'

  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTickets = async (showSpinner = true) => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }

    if (showSpinner) setLoading(true);
    else setIsRefreshing(true);

    try {
      const list = await getMyTickets();
      const listArr = Array.isArray(list) ? list : [];
      // Always sort by latest reported first
      listArr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setTickets(listArr);
    } catch (err) {
      console.warn('Failed to load tickets from backend:', err);
      setTickets([]);
    } finally {
      if (showSpinner) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets(true);

    const handleRefresh = () => loadTickets(false);
    window.addEventListener('civic_ticket_created', handleRefresh);
    window.addEventListener('civic_auth_changed', handleRefresh);

    const interval = setInterval(() => {
      loadTickets(false);
    }, 5000);

    return () => {
      window.removeEventListener('civic_ticket_created', handleRefresh);
      window.removeEventListener('civic_auth_changed', handleRefresh);
      clearInterval(interval);
    };
  }, [user?._id]);

  // Filter logic
  const filteredTickets = tickets.filter((ticket) => {
    // Search query match on ticketId, issueType, ward, or department
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      ticket.ticketId?.toLowerCase().includes(query) ||
      ticket.issueType?.toLowerCase().includes(query) ||
      (ticket.wardName || ticket.ward)?.toLowerCase().includes(query) ||
      (ticket.departmentName || ticket.department)?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeTab === 'resolved') {
      return ticket.status === 'Resolved';
    }
    if (activeTab === 'active') {
      return ticket.status !== 'Resolved' && ticket.status !== 'Rejected';
    }
    return true;
  });

  const totalCount = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const activeCount = tickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Rejected'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Citizen Tracking Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Civic Reports
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Track real-time progress, worker assignments, and AI resolution verification for your submitted reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadTickets(false)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-2xs transition-all disabled:opacity-50"
              title="Refresh reports"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New Issue</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Reports
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalCount}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              In Progress / Active
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {activeCount}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
              Resolved & Verified
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {resolvedCount}
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Resolution Rate
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ticket ID (e.g. CIV-2026-10492), issue, ward..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Reports ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'active'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({activeCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resolved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'resolved'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {loading && tickets.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Loading civic reports...</h3>
              <p className="text-xs text-slate-500">Fetching real-time records from municipal server</p>
            </div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTickets.map((ticket) => (
              <ReportCard key={ticket.ticketId} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 opacity-60" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {searchQuery ? 'No matching reports found' : 'No reports yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? `No report matches "${searchQuery}". Please check the Ticket ID and try again.`
                  : 'You have not submitted any reports yet.'}
              </p>
            </div>

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Clear Search Query
              </button>
            ) : (
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your First Report</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
