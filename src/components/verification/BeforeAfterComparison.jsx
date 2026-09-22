import React from 'react';
import { Camera, CheckCircle2, Shield, Eye } from 'lucide-react';
import { getSafeImageUrl, FALLBACK_CIVIC_IMAGE } from '../../utils/imageUrl';

export default function BeforeAfterComparison({ beforeImage, afterImage, issueType }) {
  const beforeSrc = getSafeImageUrl(beforeImage);
  const afterSrc = getSafeImageUrl(afterImage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Visual Verification: Before vs After</span>
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Side-by-Side Audit</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* BEFORE CONTAINER */}
        <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              BEFORE (Citizen Report)
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
              {beforeImage?.name || 'Citizen Evidence'}
            </span>
          </div>

          <div className="relative aspect-video max-h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
            {beforeSrc ? (
              <img
                src={beforeSrc}
                alt="Before issue proof"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-slate-400 text-xs">
                <Shield className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <span>Original photo not attached</span>
              </div>
            )}
          </div>
        </div>

        {/* AFTER CONTAINER */}
        <div className="space-y-1.5 bg-emerald-50/40 p-2.5 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
              AFTER (Worker Resolution)
            </span>
            <span className="text-[10px] text-emerald-600 truncate max-w-[120px]">
              {afterImage?.name || 'Repair Proof'}
            </span>
          </div>

          <div className="relative aspect-video max-h-56 rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
            {afterSrc ? (
              <img
                src={afterSrc}
                alt="After resolution proof"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_CIVIC_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-slate-400 text-xs">
                <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <span>After photo not uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
