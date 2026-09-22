import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  RefreshCw,
  PlusCircle,
  ListFilter,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  HardHat,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import SummaryCards from '../components/authority/SummaryCards';
import DepartmentOverview from '../components/authority/DepartmentOverview';
import TicketFilters from '../components/authority/TicketFilters';
import TicketTable from '../components/authority/TicketTable';
import TicketDetailsModal from '../components/authority/TicketDetailsModal';
import WorkerAssignmentModal from '../components/authority/WorkerAssignmentModal';
import WorkerManagementSection from '../components/authority/WorkerManagementSection';
import IssueMap from '../components/authority/IssueMap';
import { getTickets, assignWorkerToTicket } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [mainTab, setMainTab] = useState('incidents'); // 'incidents' | 'workers'
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'map'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [issueTypeFilter, setIssueTypeFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [wardFilter, setWardFilter] = useState(null);

  const authorityDepartmentId = user?.departmentId;
  const authorityDepartmentName = user?.department || 'Municipal Operations Headquarters';

  // Load tickets on mount & live refresh
  const loadTickets = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = {};
      if (authorityDepartmentId && authorityDepartmentId !== 'all') {
        params.departmentId = authorityDepartmentId;
      }
      const data = await getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Authority ticket load failed:', err);
      if (!isBackground) {
        setError(err.message || 'Unable to load Authority Dashboard. Please try again.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const interval = setInterval(() => loadTickets(true), 4000);
    return () => clearInterval(interval);
  }, [authorityDepartmentId]);

  // Update Status handler
  const handleUpdateStatus = (ticketId, newStatus, updatedDoc) => {
    if (updatedDoc) {
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === ticketId ? updatedDoc : t))
      );
      if (selectedTicket && selectedTicket.ticketId === ticketId) {
        setSelectedTicket(updatedDoc);
      }
    }
    loadTickets(true);
  };

  // Handle permanent task deletion
  const handleTicketDeleted = (deletedTicketId) => {
    setTickets((prev) => prev.filter((t) => t.ticketId !== deletedTicketId));
    if (selectedTicket && selectedTicket.ticketId === deletedTicketId) {
      setSelectedTicket(null);
    }
    loadTickets(true);
  };

  // Direct Assign Worker handler (from table or modal)
  const handleDirectAssignWorker = async (ticketId, worker) => {
    try {
      const workerId = worker.workerId || worker._id;
      const targetId = assigningTicket?._id || ticketId;
      const updated = await assignWorkerToTicket(targetId, workerId);
      if (updated) {
        handleUpdateStatus(assigningTicket?.ticketId || ticketId, 'Assigned', updated);
      }
      setAssigningTicket(null);
    } catch (err) {
      console.error('Direct assign failed:', err);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter(null);
    setIssueTypeFilter(null);
    setSeverityFilter(null);
    setStatusFilter(null);
    setWardFilter(null);
  };

  // Filtered tickets computation
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = (ticket.ticketId || '').toLowerCase().includes(query);
        const matchIssue = (ticket.issueType || '').toLowerCase().includes(query);
        const matchDesc = (ticket.description || '').toLowerCase().includes(query);
        const matchDept = (ticket.department || ticket.departmentName || '').toLowerCase().includes(query);
        const matchWard = (ticket.ward || ticket.wardName || '').toLowerCase().includes(query);

        if (!matchId && !matchIssue && !matchDesc && !matchDept && !matchWard) {
          return false;
        }
      }

      // 2. Department
      if (departmentFilter && ticket.department !== departmentFilter && ticket.departmentName !== departmentFilter) {
        return false;
      }

      // 3. Issue Type
      if (issueTypeFilter && ticket.issueType !== issueTypeFilter) {
        return false;
      }

      // 4. Severity
      if (severityFilter && ticket.severity !== severityFilter) {
        return false;
      }

      // 5. Status
      if (statusFilter && ticket.status !== statusFilter) {
        return false;
      }

      // 6. Ward
      if (wardFilter) {
        const ticketWardId = (ticket.wardId || '').toLowerCase();
        const ticketWard = (ticket.ward || '').toLowerCase();
        const ticketWardName = (ticket.wardName || '').toLowerCase();
        const target = wardFilter.toLowerCase();
        const matched =
          ticketWardId === target ||
          ticketWard === target ||
          ticketWardName === target ||
          ticketWard.includes(target) ||
          target.includes(ticketWardId);
        if (!matched) return false;
      }

      return true;
    });
  }, [
    tickets,
    searchQuery,
    departmentFilter,
    issueTypeFilter,
    severityFilter,
    statusFilter,
    wardFilter,
  ]);

  // Loading State
  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center space-y-4 p-8 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">Loading Authority Dashboard...</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Retrieving municipal operations data, citizen incident reports, and departmental routing queues.
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && tickets.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 sm:p-12 text-center animate-in fade-in">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 max-w-md w-full shadow-md space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">
              Unable to load Authority Dashboard. Please try again.
            </h3>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadTickets(false)}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 sm:py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{authorityDepartmentName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <span>Department Operations Dashboard</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor verified civic issue tickets, triage operations, dispatch workers, and audit completed resolutions.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => loadTickets(false)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs transition cursor-pointer"
            title="Reload tickets"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log New Report</span>
          </Link>
        </div>
      </div>

      {/* Main Section Navigation Bar */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setMainTab('incidents')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === 'incidents'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Incident Queue & Triage ({tickets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('workers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === 'workers'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Worker Roster & Requests</span>
        </button>
      </div>

      {/* MAIN TAB 1: INCIDENTS & OPERATIONS */}
      {mainTab === 'incidents' && (
        <>
          {/* 1. Top Summary Metric Cards */}
          <section>
            <SummaryCards
              tickets={tickets}
              activeStatusFilter={statusFilter}
              activeSeverityFilter={severityFilter}
              onSelectStatusFilter={(status) => {
                setStatusFilter(status);
                setSeverityFilter(null);
              }}
              onSelectSeverityFilter={(sev) => {
                setSeverityFilter(sev);
                setStatusFilter(null);
              }}
              onClearFilter={() => {
                setStatusFilter(null);
                setSeverityFilter(null);
              }}
            />
          </section>

          {/* 2. Department Overview Queues (if authority has all access or viewing queues) */}
          {(!authorityDepartmentId || authorityDepartmentId === 'all') && (
            <section>
              <DepartmentOverview
                tickets={tickets}
                selectedDepartment={departmentFilter}
                onSelectDepartment={(dept) => setDepartmentFilter(dept)}
              />
            </section>
          )}

          {/* 3. Filters & View Toggle */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Civic Incident Records
                </h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {filteredTickets.length}
                </span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Table List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'map'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <TicketFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              issueTypeFilter={issueTypeFilter}
              onIssueTypeChange={setIssueTypeFilter}
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              wardFilter={wardFilter}
              onWardChange={setWardFilter}
              onResetFilters={handleResetFilters}
              totalMatching={filteredTickets.length}
              totalTickets={tickets.length}
            />

            {/* Tab 1: Table List View */}
            {activeTab === 'table' && (
              <TicketTable
                tickets={filteredTickets}
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onAssignTicket={(ticket) => setAssigningTicket(ticket)}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {/* Tab 2: Map View */}
            {activeTab === 'map' && (
              <IssueMap
                tickets={filteredTickets}
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
              />
            )}
          </section>
        </>
      )}

      {/* MAIN TAB 2: WORKER ROSTER & REQUESTS */}
      {mainTab === 'workers' && (
        <section>
          <WorkerManagementSection
            departmentId={authorityDepartmentId}
            departmentName={authorityDepartmentName}
          />
        </section>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
          onTicketDeleted={handleTicketDeleted}
        />
      )}

      {/* Direct Worker Assignment Modal */}
      {assigningTicket && (
        <WorkerAssignmentModal
          ticket={assigningTicket}
          onClose={() => setAssigningTicket(null)}
          onAssign={handleDirectAssignWorker}
        />
      )}
    </div>
  );
}
