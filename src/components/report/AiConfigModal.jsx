import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Check, ShieldCheck, Cpu, Loader2, AlertCircle } from 'lucide-react';
import { getAiEngineStatus, configureAiApiKey } from '../../services/aiService';

export default function AiConfigModal({ isOpen, onClose, onUpdated }) {
  const [engineStatus, setEngineStatus] = useState(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getAiEngineStatus().then((status) => {
        setEngineStatus(status);
      });
      setSavedSuccess(false);
      setSaveError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {};
      if (openaiKey.trim()) payload.openaiApiKey = openaiKey.trim();
      if (geminiKey.trim()) payload.geminiApiKey = geminiKey.trim();

      const res = await configureAiApiKey(payload);
      if (res.success) {
        setSavedSuccess(true);
        const updated = await getAiEngineStatus();
        setEngineStatus(updated);
        if (onUpdated) onUpdated(updated);
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 1200);
      } else {
        setSaveError(res.message || 'Failed to configure API key');
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
      setSaveError(err.message || 'Network error saving API key');
    } finally {
      setSaving(false);
    }
  };

  const isCloudActive = engineStatus?.isCloud;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Vision AI Engine Settings</h3>
              <p className="text-xs text-slate-500">Configure Cloud Vision Provider</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Active Engine Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isCloudActive
                ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/80'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="space-y-0.5">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  isCloudActive ? 'text-blue-700' : 'text-amber-800'
                }`}
              >
                Currently Active Engine
              </span>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Cpu className={`w-4 h-4 ${isCloudActive ? 'text-blue-600' : 'text-amber-600'}`} />
                <span>{engineStatus?.engine || 'No Vision Provider Configured'}</span>
              </h4>
            </div>
            {isCloudActive ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active ✓
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Key Required
              </span>
            )}
          </div>

          {saveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>OpenAI API Key (GPT-4o-mini Vision)</span>
                </span>
                {engineStatus?.hasOpenAiKey && (
                  <span className="text-[11px] text-emerald-600 font-bold">Connected</span>
                )}
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={engineStatus?.hasOpenAiKey ? '•••••••••••••••••••••••• (Configured in server/.env)' : 'sk-proj-...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-[11px] text-slate-500">
                Stored strictly in backend <code className="font-mono">server/.env</code> and never exposed to the frontend.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Google Gemini API Key (Gemini 2.5 Flash)</span>
                </span>
                {engineStatus?.hasGeminiKey && (
                  <span className="text-[11px] text-emerald-600 font-bold">Connected</span>
                )}
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={engineStatus?.hasGeminiKey ? '•••••••••••••••••••••••• (Configured in server/.env)' : 'AIzaSy...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Backend-Only Security Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Your API keys are never bundled, never sent to the browser, and never logged in client storage. The frontend calls <code className="font-mono text-slate-700">POST /api/ai/analyze</code> and the server communicates with the vision model.
              </p>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving || (!openaiKey && !geminiKey)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-blue-900/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save & Connect</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
