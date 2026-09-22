import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  Layers,
  ExternalLink,
  X,
  Compass,
  Building2,
  Navigation,
} from 'lucide-react';
import { MOCK_WARDS } from '../../config/wards';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

const SEVERITY_PIN_COLORS = {
  Critical: 'bg-rose-600 text-white ring-4 ring-rose-200 shadow-rose-900/30',
  High: 'bg-orange-500 text-white ring-4 ring-orange-200 shadow-orange-900/30',
  Medium: 'bg-amber-500 text-white ring-4 ring-amber-200 shadow-amber-900/30',
  Low: 'bg-blue-500 text-white ring-4 ring-blue-200 shadow-blue-900/30',
};

const SEVERITY_BADGES = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function IssueMap({ tickets = [], onSelectTicket }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [showWards, setShowWards] = useState(true);

  // Approximate coordinate bounds of mock city area
  const minLat = 12.91;
  const maxLat = 13.03;
  const minLng = 77.50;
  const maxLng = 77.69;

  // Convert GPS coordinates to percentage position on mock map
  const getCoordinatesPosition = (lat, lng, defaultIdx = 0) => {
    if (!lat || !lng) {
      // Fallback coordinate positioning if no GPS
      const offsets = [
        { top: 50, left: 50 },
        { top: 35, left: 45 },
        { top: 60, left: 55 },
        { top: 40, left: 65 },
        { top: 55, left: 35 },
      ];
      return offsets[defaultIdx % offsets.length];
    }

    const top = 100 - ((lat - minLat) / (maxLat - minLat)) * 80 - 10;
    const left = ((lng - minLng) / (maxLng - minLng)) * 80 + 10;

    return {
      top: Math.max(10, Math.min(88, top)),
      left: Math.max(8, Math.min(90, left)),
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-3">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Municipal Geographic Incident Map
            </h3>
            <p className="text-[10px] text-slate-400">
              Visualizing incident coordinates across {MOCK_WARDS.length} administrative wards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowWards(!showWards)}
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
              showWards
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showWards ? 'Hide Ward Boundaries' : 'Show Ward Boundaries'}</span>
          </button>

          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {tickets.length} Plotted Pins
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-[480px] sm:h-[540px] w-full bg-slate-100 overflow-hidden select-none">
        {/* Subtle Map Grid / Landmass Simulation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

        {/* River / Geographic Feature simulation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -100 280 Q 200 320, 500 240 T 1200 290"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="32"
          />
        </svg>

        {/* Ward Boundary Overlays */}
        {showWards && (
          <div className="absolute inset-0 pointer-events-none p-6 grid grid-cols-3 grid-rows-2 gap-4 opacity-55">
            {MOCK_WARDS.map((ward) => (
              <div
                key={ward.id}
                className="border-2 border-dashed border-blue-400/60 rounded-3xl p-3 flex flex-col justify-between bg-blue-500/5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold bg-blue-600/20 text-blue-700 px-2 py-0.5 rounded-md">
                    {ward.id}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate">{ward.zone}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Center: {ward.centerLat}, {ward.centerLng}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Ticket Markers */}
        {tickets.map((ticket, idx) => {
          const isSelected = activeTicket?.ticketId === ticket.ticketId;
          const pos = getCoordinatesPosition(ticket.latitude, ticket.longitude, idx);
          const colorClass = SEVERITY_PIN_COLORS[ticket.severity] || SEVERITY_PIN_COLORS.Medium;

          return (
            <div
              key={ticket.ticketId}
              style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => setActiveTicket(ticket)}
                className={`p-2 rounded-full shadow-lg transition-all duration-200 transform cursor-pointer ${colorClass} ${
                  isSelected ? 'scale-135 ring-4 ring-blue-600' : 'hover:scale-120'
                }`}
                title={`${ticket.ticketId} - ${ticket.issueType} (${ticket.severity})`}
              >
                {ticket.severity === 'Critical' ? (
                  <Flame className="w-4 h-4 animate-bounce" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}

        {/* Active Ticket Popup Card */}
        {activeTicket && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 z-30 animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                  {activeTicket.ticketId}
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight mt-0.5">
                  {activeTicket.issueType}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              {/* Photo Thumbnail */}
              <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                {(() => {
                  const imageSrc = getSafeImageUrl(activeTicket.imageUrl || activeTicket.image);
                  return imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={activeTicket.issueType}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Photo
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Severity:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    SEVERITY_BADGES[activeTicket.severity] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {activeTicket.severity}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-800">{activeTicket.status}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">
                  {activeTicket.department}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ward:</span>
                <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {activeTicket.ward}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectTicket(activeTicket);
                  setActiveTicket(null);
                }}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <span>Inspect Full Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-sm text-[10px] space-y-1 z-10">
          <span className="font-bold text-slate-700 uppercase block mb-1">Severity Legend</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="font-medium text-slate-700">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="font-medium text-slate-700">High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="font-medium text-slate-700">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
