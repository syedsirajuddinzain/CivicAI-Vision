import React, { useState, useEffect, useRef } from 'react';
import { HardHat, User, ChevronDown, Check, Phone, MapPin, Tag } from 'lucide-react';
import { getWorkers } from '../../services/workerService.js';

export default function WorkerStatus({ currentWorker, onSelectWorker, workers = [] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [internalWorkers, setInternalWorkers] = useState([]);
  const dropdownRef = useRef(null);

  // If workers array was not provided as prop, fetch asynchronously
  useEffect(() => {
    if (!workers || workers.length === 0) {
      getWorkers()
        .then((data) => {
          if (Array.isArray(data)) setInternalWorkers(data);
        })
        .catch((err) => console.warn('WorkerStatus fetch error:', err));
    }
  }, [workers]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  if (!currentWorker) return null;

  const activeWorkerList = (Array.isArray(workers) && workers.length > 0) ? workers : internalWorkers;
  const currentWorkerId = currentWorker.workerId || currentWorker._id;
  const currentStatus = currentWorker.status || currentWorker.availabilityStatus || 'Available';
  const currentDept = (currentWorker.department || currentWorker.departmentName || 'Municipal Operations').replace(' Department', '');
  const currentWard = currentWorker.ward || currentWorker.wardName || 'All Wards';

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-800 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Worker Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <HardHat className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {currentWorker.name}
              </h2>
              <span className="text-[10px] font-mono bg-slate-800 text-blue-400 font-bold px-2 py-0.5 rounded border border-slate-700">
                {currentWorkerId}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              {currentDept} • <strong className="text-white">{currentWard}</strong>
            </p>
          </div>
        </div>

        {/* Switch Worker Dropdown Button & Status */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              currentStatus === 'Available'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : currentStatus === 'Busy'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}
          >
            ● {currentStatus}
          </span>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-sm transition cursor-pointer"
              title="Switch active worker persona"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch Worker</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                  Select Field Worker Persona
                </span>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {activeWorkerList.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Loading available workers...
                    </div>
                  ) : (
                    activeWorkerList.map((w) => {
                      const wId = w.workerId || w._id;
                      const isSelected = wId === currentWorkerId || w.name === currentWorker.name;
                      const dept = (w.department || w.departmentName || 'Field Team').replace(' Department', '');
                      const ward = w.ward || w.wardName || 'City Ward';
                      return (
                        <button
                          key={wId}
                          type="button"
                          onClick={() => {
                            onSelectWorker(w);
                            setShowDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-bold leading-tight flex items-center gap-1.5">
                              <span>{w.name}</span>
                              <span className="text-[10px] font-mono font-normal text-slate-500">
                                ({wId})
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                              {dept} • {ward}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
