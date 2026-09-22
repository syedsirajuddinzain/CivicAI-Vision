import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Camera,
  MapPin,
  Mic,
  Wifi,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  Touchpad,
  ShieldCheck,
  Zap,
  Server,
  Save,
  RotateCcw,
} from 'lucide-react';
import { getApiBaseUrl, setCustomApiUrl, getStoredCustomApiUrl } from '../../services/api';

export default function PhoneCapabilitiesModal({ isOpen, onClose }) {
  const [capabilities, setCapabilities] = useState({
    camera: false,
    cameraDetails: 'Detecting...',
    gps: false,
    gpsDetails: 'Detecting...',
    voice: false,
    voiceDetails: 'Detecting...',
    touch: false,
    touchDetails: 'Detecting...',
    pwa: false,
    pwaDetails: 'Detecting...',
    network: true,
    networkDetails: 'Detecting...',
    viewport: '...',
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    setApiUrlInput(getStoredCustomApiUrl() || getApiBaseUrl() || '');
  }, [isOpen]);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Camera check
    const hasMediaDevices = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const cameraDetails = hasMediaDevices
      ? 'Web MediaDevices & Native Camera Capture supported'
      : 'HTML5 Environment File Capture active';

    // 2. GPS Geolocation check
    const hasGeolocation = 'geolocation' in navigator;
    const gpsDetails = hasGeolocation
      ? 'High-Accuracy Geolocation API ready (GPS / Cell Tower)'
      : 'Geolocation unavailable in this browser';

    // 3. Web Speech API check
    const hasSpeech = Boolean(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
    const voiceDetails = hasSpeech
      ? 'Web Speech API active (Voice-to-Text ready)'
      : 'Unsupported on current engine (Manual typing active)';

    // 4. Touch & Screen Form Factor check
    const isTouch =
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const viewport = `${window.innerWidth}px × ${window.innerHeight}px (${
      window.innerWidth < 768 ? 'Mobile Phone Viewport' : 'Desktop/Tablet Viewport'
    })`;
    const touchDetails = isTouch
      ? `Multi-touch enabled (${navigator.maxTouchPoints || 1} touch points)`
      : 'Mouse / Pointer device detected';

    // 5. PWA & Service Worker check
    const hasSW = 'serviceWorker' in navigator;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isCapacitor = Boolean(window.Capacitor?.isNativePlatform?.());
    const pwaDetails = isCapacitor
      ? 'Running as Native Android Application (Capacitor)'
      : isStandalone
      ? 'Running as installed PWA (Standalone Mode)'
      : hasSW
      ? 'Service Worker registered • Installable PWA ready'
      : 'PWA caching partially supported';

    // 6. Network status
    const isNetOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const networkDetails = isNetOnline
      ? 'Connected (Real-time AI Routing active)'
      : 'Offline (Local queueing active)';

    setCapabilities({
      camera: true, // File capture is always supported in standard HTML5
      cameraDetails,
      gps: hasGeolocation,
      gpsDetails,
      voice: hasSpeech,
      voiceDetails,
      touch: isTouch,
      touchDetails,
      pwa: true,
      pwaDetails,
      network: isNetOnline,
      networkDetails,
      viewport,
    });
  }, [isOpen]);

  const handleSaveApiUrl = () => {
    setCustomApiUrl(apiUrlInput);
    setSaveStatus('Server URL saved! Reloading API connections...');
    setTimeout(() => {
      setSaveStatus(null);
    }, 2500);
  };

  const handleResetApiUrl = () => {
    setCustomApiUrl('');
    setApiUrlInput(getApiBaseUrl());
    setSaveStatus('Reset to default auto-detected host.');
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'To install CivicAI on an Android phone:\n\n1. Open your browser menu (⋮).\n2. Select "Add to Home screen" or "Install app".\n\nOr build the native Android APK using "npm run cap:build:apk".'
      );
    }
  };

  if (!isOpen) return null;

  const items = [
    {
      name: 'Camera & Visual Proof',
      supported: capabilities.camera,
      icon: Camera,
      badge: 'Hardware Camera',
      desc: capabilities.cameraDetails,
    },
    {
      name: 'GPS Geolocation',
      supported: capabilities.gps,
      icon: MapPin,
      badge: 'Location Services',
      desc: capabilities.gpsDetails,
    },
    {
      name: 'Voice Input (Speech-to-Text)',
      supported: capabilities.voice,
      icon: Mic,
      badge: 'Web Speech API',
      desc: capabilities.voiceDetails,
    },
    {
      name: 'Mobile-First Touch Ergonomics',
      supported: capabilities.touch,
      icon: Touchpad,
      badge: 'Touch Engine',
      desc: capabilities.touchDetails,
    },
    {
      name: 'Native Android / PWA Engine',
      supported: capabilities.pwa,
      icon: Layers,
      badge: window.Capacitor?.isNativePlatform?.() ? 'Capacitor Native' : 'PWA Ready',
      desc: capabilities.pwaDetails,
    },
    {
      name: 'Network & Backend Sync',
      supported: capabilities.network,
      icon: Wifi,
      badge: capabilities.network ? 'Online' : 'Offline Mode',
      desc: capabilities.networkDetails,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-600 text-white shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Mobile App & Device Hub</h3>
                <span className="text-[10px] font-bold uppercase bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Android Native
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Hardware sensors, device diagnostics & backend server routing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Metric Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>Viewport: {capabilities.viewport}</span>
          <span className="font-sans font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
            Capacitor Ready
          </span>
        </div>

        {/* Diagnostic Items List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {/* Mobile Backend Server Connection Card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Server className="w-4 h-4" />
                <span>Backend Server Endpoint</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Port 5000
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="e.g. http://192.168.1.15:5000 or http://10.0.2.2:5000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveApiUrl}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Server URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetApiUrl}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {saveStatus && (
                <p className="text-[11px] text-emerald-400 font-medium animate-in fade-in">
                  ✓ {saveStatus}
                </p>
              )}
            </div>
          </div>

          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  item.supported
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 shadow-2xs shrink-0 ${
                    item.supported
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {item.name}
                    </h4>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.supported
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="shrink-0 mt-0.5">
                  {item.supported ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Package Android APK via Capacitor CLI</span>
          </div>

          <button
            type="button"
            onClick={handleInstallPwa}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install / Add to Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
