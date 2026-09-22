import React, { useState, useRef } from 'react';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  RotateCcw,
  AlertCircle,
  FileCheck,
  Send,
  Loader2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { verifyResolution } from '../../services/verificationService.js';
import { compressImage } from '../../utils/imageCompressor.js';

export default function ResolutionForm({ ticket, onResolve, isSubmitting }) {
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [simPreset, setSimPreset] = useState(null);
  const [isVerifyingAi, setIsVerifyingAi] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, or WEBP)');
      return;
    }

    try {
      setIsCompressing(true);
      setErrorMsg(null);
      const compressed = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.85 });
      setPhoto({
        name: compressed.name || file.name,
        previewUrl: compressed.previewUrl,
        size: compressed.size,
      });
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        setPhoto({
          name: file.name,
          previewUrl: readEvent.target.result,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleTriggerSubmit = (e) => {
    e.preventDefault();
    if (!photo) {
      setErrorMsg('A completion photo is required before marking this task as finished.');
      return;
    }
    handleConfirmSubmit();
  };

  const handleConfirmSubmit = async () => {
    setIsVerifyingAi(true);

    try {
      // Run AI comparison between citizen's BEFORE photo and worker's AFTER photo
      const verificationResult = await verifyResolution({
        beforeImage: ticket?.imageUrl || ticket?.image,
        afterImage: photo,
        issueType: ticket?.issueType || 'Civic Issue',
        description: ticket?.description || '',
        simulatedPreset: simPreset,
      });

      onResolve({
        photo,
        note: note.trim() || 'Work completed on-site and verified.',
        verification: verificationResult,
      });
    } catch (err) {
      console.error('Resolution verification failed:', err);
      // Fallback
      onResolve({
        photo,
        note: note.trim() || 'Work completed on-site.',
        verification: {
          verificationStatus: 'Unable to Verify',
          confidence: 0.45,
          reason: 'Automated verification unavailable; flagged for manual review.',
          requiresHumanReview: true,
        },
      });
    } finally {
      setIsVerifyingAi(false);
    }
  };

  return (
    <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-3xl p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-extrabold">Complete Work Order & Verification</h3>
        </div>

        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
          Completion Photo Required
        </span>
      </div>

      <form onSubmit={handleTriggerSubmit} className="space-y-4 text-xs">
        {/* Step 1: Completion Photo Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Take Completion Photo</span>
              <span className="text-rose-500 font-semibold text-[10px]">*Required</span>
            </label>
            {photo && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Proof Attached ✓
              </span>
            )}
          </div>

          {/* Native HTML5 camera and gallery file inputs */}
          <input
            type="file"
            id="worker-camera-input"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
          />
          <input
            type="file"
            id="worker-gallery-input"
            accept="image/*"
            onChange={handleFileChange}
            style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
          />

          {!photo ? (
            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center bg-white space-y-3">
              <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Camera className="w-7 h-7" />
              </div>

              <div>
                <p className="font-bold text-slate-900 text-sm">Capture Completed Repair / Cleanup Photo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Take a live photo on-site using your camera or upload from gallery
                </p>
              </div>

              {isCompressing ? (
                <div className="flex items-center justify-center gap-2 py-3 text-emerald-700 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing completion photo...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
                  <label
                    htmlFor="worker-camera-input"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl transition cursor-pointer shadow-md shadow-emerald-900/10 active:scale-[0.98] select-none text-xs sm:text-sm"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Completion Photo</span>
                  </label>

                  <label
                    htmlFor="worker-gallery-input"
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-4 rounded-2xl transition cursor-pointer border border-slate-200 active:scale-[0.98] select-none text-xs sm:text-sm"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                    <span>Upload from Gallery</span>
                  </label>
                </div>
              )}
            </div>
          ) : (
            /* Image Preview Card */
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-sm text-white">
              <div className="relative aspect-video max-h-56 bg-black flex items-center justify-center">
                <img
                  src={photo.previewUrl}
                  alt="Resolution proof"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3 bg-slate-800 flex items-center justify-between gap-2 border-t border-slate-700 text-xs">
                <span className="text-slate-300 truncate max-w-xs">{photo.name}</span>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="worker-camera-input"
                    className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer select-none"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake Photo</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Step 2: Resolution Note */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 block">
            Resolution Note <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Completed repair and cleared site according to safety standards."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Work Finished Button */}
        <button
          type="submit"
          disabled={isSubmitting || isVerifyingAi || isCompressing}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] text-sm disabled:opacity-50"
        >
          {isVerifyingAi || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Completion Proof to Authority...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Work Finished</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
