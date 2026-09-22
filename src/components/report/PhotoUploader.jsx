import React, { useRef, useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Loader2,
  Zap,
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

export default function PhotoUploader({ photo, onPhotoSelect, onPhotoRemove, hasError }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndCompressFile(file);
    }
    // Reset inputs so user can choose the same file again if desired
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const processAndCompressFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP)');
      return;
    }

    setCompressing(true);
    try {
      // Compress for fast mobile upload and localStorage safety
      const compressed = await compressImage(file, { maxWidth: 1280, quality: 0.8 });
      setCompressionInfo({
        originalSize: compressed.originalSize,
        compressedSize: compressed.size,
        savedPercent: compressed.savedPercent,
      });

      onPhotoSelect({
        file: compressed.file,
        previewUrl: compressed.previewUrl,
        name: compressed.name,
        size: compressed.size,
        originalSize: compressed.originalSize,
        savedPercent: compressed.savedPercent,
      });
    } catch (err) {
      console.warn('Image compression fallback:', err);
      // Fallback to uncompressed if canvas compression fails
      const previewUrl = URL.createObjectURL(file);
      onPhotoSelect({
        file,
        previewUrl,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAndCompressFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
            1
          </span>
          <span>Capture Civic Issue</span>
          <span className="text-rose-500 font-bold text-xs">*Required</span>
        </label>

        {photo && (
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Photo Attached ✓
          </span>
        )}
      </div>

      {/* Hidden Native Camera & Gallery Inputs */}
      {/* capture="environment" opens rear camera directly on supported Android/iQOO browsers */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="iqoo-camera-capture-input"
      />
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="iqoo-gallery-upload-input"
      />

      {/* Loading state during compression */}
      {compressing && (
        <div className="p-8 bg-blue-50/70 border border-blue-200 rounded-3xl text-center space-y-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-800">
            Optimizing image for mobile upload...
          </p>
          <p className="text-[11px] text-slate-500">
            Compressing high-resolution camera photo for instant AI analysis.
          </p>
        </div>
      )}

      {/* When No Photo is Selected */}
      {!photo && !compressing && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-3xl p-5 sm:p-7 text-center bg-slate-50/80 transition-all ${
            hasError
              ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-200'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-3xl flex items-center justify-center shadow-md">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Snap or Upload Photo
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visual proof is analyzed by AI to route your issue automatically.
              </p>
            </div>

            {/* Primary Mobile Action Buttons (Min 48px height for finger touch) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Primary Mobile Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full min-h-[50px] flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-sm py-3 px-5 rounded-2xl shadow-md shadow-blue-900/25 transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 text-white" />
                <span>Take Photo</span>
              </button>

              {/* Secondary Upload from Gallery */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full min-h-[50px] flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-800 font-extrabold text-sm py-3 px-5 rounded-2xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 text-slate-500" />
                <span>Upload Photo</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              Supports mobile camera capture, gallery selection, and drag & drop.
            </p>
          </div>

          {hasError && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-100/70 px-3 py-1.5 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Please take or upload a photo before submitting.</span>
            </div>
          )}
        </div>
      )}

      {/* When Photo is Attached: Preview Card */}
      {photo && !compressing && (
        <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-md">
          <div className="relative aspect-video sm:aspect-16/9 max-h-72 w-full bg-black/60 flex items-center justify-center overflow-hidden">
            <img
              src={photo.previewUrl}
              alt="Citizen report photo"
              className="w-full h-full object-contain"
            />

            {/* Top Compression Badge if compressed */}
            {photo.savedPercent > 0 && (
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Optimized {photo.savedPercent}% ({photo.originalSize} → {photo.size})</span>
              </div>
            )}
          </div>

          {/* Bottom Action Strip */}
          <div className="p-3.5 sm:p-4 bg-slate-800/95 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700">
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <p className="text-xs font-bold text-slate-200 truncate">{photo.name}</p>
              <p className="text-[11px] text-slate-400">{photo.size}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={onPhotoRemove}
                className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
