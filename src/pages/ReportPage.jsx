import React, { useState, useMemo, useEffect } from 'react';
import PhotoUploader from '../components/report/PhotoUploader';
import LocationDetector from '../components/report/LocationDetector';
import AiAnalysisCard from '../components/report/AiAnalysisCard';
import VoiceDescriptionInput from '../components/report/VoiceDescriptionInput';
import ReportSuccess from '../components/report/ReportSuccess';
import OfflineBanner from '../components/common/OfflineBanner';
import PhoneCapabilitiesModal from '../components/mobile/PhoneCapabilitiesModal';
import AiConfigModal from '../components/report/AiConfigModal';
import { analyzeCivicImage, getAiEngineStatus } from '../services/aiService';
import { determineRouting } from '../services/routingService';
import { createTicket } from '../services/ticketService';
import { isOnline, savePendingReport } from '../services/offlineQueueService';
import {
  Send,
  Eye,
  AlertCircle,
  Loader2,
  Sparkles,
  Smartphone,
  WifiOff,
  Settings2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import { classifyImageInBrowser } from '../utils/localVisionClassifier';

export default function ReportPage() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [aiError, setAiError] = useState(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [offlineQueuedReport, setOfflineQueuedReport] = useState(null);

  // Modals state
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [engineInfo, setEngineInfo] = useState(null);

  useEffect(() => {
    getAiEngineStatus().then(setEngineInfo).catch(() => {});
  }, []);

  // Photo handlers: Instant in-browser neural classification (<50ms) + background cloud deep AI
  const handlePhotoSelect = async (photoObj) => {
    setPhoto(photoObj);
    setPhotoError(false);
    setAiError(null);

    if (photoObj?.file) {
      setIsAnalyzing(true);
      try {
        // 1. Instant sub-second perception on device
        const instantResult = await classifyImageInBrowser(photoObj.file);
        setAiResult({
          ...instantResult,
          departmentId: (instantResult.issueType.includes('Road') ? 'dept_roads' : instantResult.issueType.includes('Electrical') ? 'dept_electrical' : instantResult.issueType.includes('Drainage') ? 'dept_water' : instantResult.issueType.includes('Garbage') ? 'dept_sanitation' : 'dept_general'),
          departmentName: (instantResult.issueType.includes('Road') ? 'Roads & Infrastructure Department' : instantResult.issueType.includes('Electrical') ? 'Electrical Department' : instantResult.issueType.includes('Drainage') ? 'Water & Drainage Department' : instantResult.issueType.includes('Garbage') ? 'Sanitation Department' : 'General Municipal Department'),
          engineUsed: 'CivicAI Instant Vision Neural Engine (1.0s)',
        });
      } catch (e) {
        console.warn('Instant classifier fallback:', e);
      } finally {
        setIsAnalyzing(false);
      }

      // 2. Background Gemini multimodal enrichment
      handleAnalyzeWithAi(photoObj.file);
    }
  };

  const handlePhotoRemove = () => {
    setPhoto(null);
    setAiResult(null);
    setAiError(null);
  };

  // Trigger Cloud AI Deep Analysis
  const handleAnalyzeWithAi = async (overrideFile = null) => {
    const fileToProcess = overrideFile || photo?.file;
    if (!fileToProcess) return;

    try {
      const result = await analyzeCivicImage(fileToProcess);
      if (result && result.issueType) {
        setAiResult(result);
      }
    } catch (err) {
      console.warn('Background AI Note:', err.message);
      // Keep instant result intact without crashing UI
    }
  };

  // Compute live routing preview
  const liveRouting = useMemo(() => {
    const effectiveCategory = aiResult?.issueType || 'Scanning photo...';
    return determineRouting({
      issueType: effectiveCategory,
      confidence: aiResult?.confidence ?? 0.95,
      latitude: location ? location.latitude : null,
      longitude: location ? location.longitude : null,
      isManualSelection: false,
    });
  }, [aiResult, location]);

  // Submit Handler with Automated AI Routing
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Mandatory Photo validation
    if (!photo) {
      setPhotoError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    let currentAiResult = aiResult;

    // 2. If AI hasn't completed yet, trigger it now
    if (!currentAiResult) {
      try {
        currentAiResult = await analyzeCivicImage(photo.file);
        setAiResult(currentAiResult);
      } catch (err) {
        console.error('AI Analysis failed on submit:', err);
        setAiError(err.message || 'AI analysis is unavailable. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    const currentCategory = currentAiResult?.issueType || 'Other / Unknown';

    // Determine final routing
    const routingResult = determineRouting({
      issueType: currentCategory,
      confidence: currentAiResult ? currentAiResult.confidence : 0.95,
      latitude: location ? location.latitude : null,
      longitude: location ? location.longitude : null,
      isManualSelection: false,
    });

    const finalSeverity = currentAiResult?.severity || 'Medium';
    const finalDescription = description.trim() || currentAiResult?.description || 'Citizen submitted issue';

    // Check offline status
    if (!isOnline()) {
      setTimeout(() => {
        const queued = savePendingReport({
          issueType: currentCategory,
          severity: finalSeverity,
          confidence: currentAiResult ? currentAiResult.confidence : null,
          description: finalDescription,
          image: photo,
          latitude: location ? location.latitude : null,
          longitude: location ? location.longitude : null,
          ward: routingResult.ward,
          department: routingResult.department,
        });

        setIsSubmitting(false);
        setOfflineQueuedReport(queued);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
      return;
    }

    // Submit to real backend MongoDB
    try {
      const ticket = await createTicket({
        issueType: currentCategory,
        severity: finalSeverity,
        confidence: currentAiResult ? currentAiResult.confidence : 0.95,
        description: finalDescription,
        image: photo,
        imageUrl: currentAiResult?.imageUrl || (photo?.previewUrl?.startsWith('/uploads/') ? photo.previewUrl : ''),
        latitude: location ? location.latitude : null,
        longitude: location ? location.longitude : null,
        ward: routingResult.ward,
        department: routingResult.department,
        citizenId: user?._id || user?.id || 'citizen_guest',
      });

      if (ticket?.ticketId && typeof window !== 'undefined' && window.localStorage) {
        try {
          const storedIds = JSON.parse(window.localStorage.getItem('civic_reported_ticket_ids') || '[]');
          if (!storedIds.includes(ticket.ticketId)) {
            storedIds.unshift(ticket.ticketId);
            window.localStorage.setItem('civic_reported_ticket_ids', JSON.stringify(storedIds));
          }
        } catch (storageErr) {
          console.warn('Could not store reported ticket ID locally:', storageErr);
        }
      }

      window.dispatchEvent(new Event('civic_ticket_created'));
      setCreatedTicket(ticket);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit report failed:', err);
      setAiError(err.message || 'Failed to submit report to municipal server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhoto(null);
    setDescription('');
    setLocation(null);
    setPhotoError(false);
    setAiResult(null);
    setAiError(null);
    setCreatedTicket(null);
    setOfflineQueuedReport(null);
  };

  if (createdTicket) {
    return <ReportSuccess ticketData={createdTicket} onReset={handleReset} />;
  }

  // Offline Queued Confirmation Screen
  if (offlineQueuedReport) {
    return (
      <div className="max-w-xl mx-auto py-6 px-4 space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center">
            <WifiOff className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Saved in Offline Queue
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Report Stored on Device
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              You are currently offline. Your report has been compressed and stored safely on your phone. It will be submitted automatically once your network connection is restored.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1 font-mono">
            <div className="flex justify-between text-slate-500">
              <span>Local Queue ID:</span>
              <span className="font-bold text-slate-900">{offlineQueuedReport.tempId}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Issue:</span>
              <span className="font-bold text-slate-900">{offlineQueuedReport.issueType}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Department:</span>
              <span className="font-bold text-slate-900">{offlineQueuedReport.department}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const effectiveIssueType = aiResult?.issueType || 'Analyzing photo...';

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2 sm:py-4 px-3 sm:px-4">
      {/* Offline Status Sticky Banner */}
      <OfflineBanner onReportsSynced={handleReset} />

      {/* Header & Vision Settings Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Automated Issue Detection & Routing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Report a Civic Issue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload or take a photo — AI automatically analyzes the issue and routes to the correct municipal department.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAiConfig(true)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Configure OpenAI / Gemini API Keys or view active Vision engine"
          >
            <Settings2 className="w-4 h-4 text-blue-600" />
            <span>AI Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCapabilities(true)}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Phone Diagnostics</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: [📷 TAKE PHOTO] / [🖼 UPLOAD PHOTO] */}
        <section className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <PhotoUploader
            photo={photo}
            onPhotoSelect={handlePhotoSelect}
            onPhotoRemove={handlePhotoRemove}
            hasError={photoError}
          />
        </section>

        {/* Step 2: AUTOMATIC AI ANALYSIS (No manual cards) */}
        {photo && (
          <section className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3.5 animate-in fade-in duration-200">
            <AiAnalysisCard
              photo={photo}
              aiResult={aiResult}
              isAnalyzing={isAnalyzing}
              aiError={aiError}
              onAnalyze={handleAnalyzeWithAi}
              onOpenSettings={() => setShowAiConfig(true)}
            />
          </section>
        )}

        {/* Step 3: 📍 LOCATION PINPOINT (GPS) */}
        <section className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
              2
            </span>
            <span className="text-sm font-bold text-slate-800">Pinpoint GPS Location</span>
          </div>

          <LocationDetector
            location={location}
            onLocationDetected={(loc) => setLocation(loc)}
            onClearLocation={() => setLocation(null)}
          />
        </section>

        {/* Step 4: 🎤 OPTIONAL DESCRIPTION WITH VOICE INPUT */}
        <section className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <VoiceDescriptionInput
            value={description}
            onChange={(val) => setDescription(val)}
            aiDescription={aiResult?.description}
            placeholder="Additional details (optional)..."
          />
        </section>

        {/* Step 5: REVIEW & AUTOMATIC ROUTING */}
        <section className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Review & Automatic Department Routing
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            {/* Attached Photo Thumbnail */}
            <div className="sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Visual Evidence
              </span>
              {photo ? (
                <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                  <img
                    src={photo.previewUrl}
                    alt="Preview thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video sm:aspect-square rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-3 text-center bg-slate-800/40 text-slate-500">
                  <AlertCircle className="w-5 h-5 mb-1 text-slate-500" />
                  <span className="text-xs">No photo</span>
                </div>
              )}
            </div>

            {/* Live Routing Details */}
            <div className="sm:col-span-2 space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Detected Category
                </span>
                <p className="font-bold text-slate-100 text-sm">{effectiveIssueType}</p>
              </div>

              {liveRouting && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 block">
                      Target Department
                    </span>
                    <span className="font-bold text-slate-200 text-xs truncate block">
                      {liveRouting.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-400 block">
                      Municipal Ward
                    </span>
                    <span className="font-bold text-slate-200 text-xs truncate block">
                      {liveRouting.ward}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Location
                </span>
                <span className="text-slate-300 text-xs">
                  {location
                    ? `${location.latitude}°, ${location.longitude}° (GPS Pinpointed)`
                    : 'Default central location'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Step 6: [SUBMIT REPORT] */}
        <div className="space-y-2 pt-1 pb-4">
          <button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className="w-full min-h-[54px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/30 transition-all disabled:opacity-75 cursor-pointer text-base sm:text-lg"
          >
            {isSubmitting || isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isAnalyzing ? 'Analyzing Photo with AI...' : 'Submitting to Authority...'}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Report</span>
              </>
            )}
          </button>

          {!photo && (
            <p className="text-center text-xs text-slate-400">
              * Please take or upload a photo to submit.
            </p>
          )}
          {photo && isAnalyzing && (
            <p className="text-center text-xs text-blue-600 font-bold">
              * AI is analyzing photo and matching the municipal department automatically...
            </p>
          )}
        </div>
      </form>

      {/* Phone Capabilities Modal */}
      <PhoneCapabilitiesModal
        isOpen={showCapabilities}
        onClose={() => setShowCapabilities(false)}
      />

      {/* AI Engine & API Key Settings Modal */}
      <AiConfigModal
        isOpen={showAiConfig}
        onClose={() => setShowAiConfig(false)}
        onUpdated={(status) => setEngineInfo(status)}
      />
    </div>
  );
}
