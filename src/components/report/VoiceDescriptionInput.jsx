import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Volume2, Sparkles, Check } from 'lucide-react';

export default function VoiceDescriptionInput({
  value,
  onChange,
  aiDescription,
  placeholder = 'Describe details or nearby landmarks...',
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcriptNotice, setTranscriptNotice] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptNotice('Listening... Speak clearly now into your phone mic.');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          // Append or replace
          const updated = value ? `${value.trim()} ${finalTranscript.trim()}` : finalTranscript.trim();
          onChange(updated);
          setTranscriptNotice('Speech captured ✓');
          setTimeout(() => setTranscriptNotice(null), 3000);
        } else if (interimTranscript) {
          setTranscriptNotice(`Heard: "${interimTranscript}"`);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setTranscriptNotice('Microphone access was denied. Please allow microphone in browser settings.');
        } else if (event.error === 'no-speech') {
          setTranscriptNotice('No speech was detected. Tap to try again.');
        } else {
          setTranscriptNotice(`Voice input error: ${event.error}`);
        }
        setTimeout(() => setTranscriptNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition initialization failed:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [value, onChange]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setTranscriptNotice(null);
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="issue-voice-desc" className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
            4
          </span>
          <span>Describe the Problem</span>
          <span className="text-slate-400 font-normal text-xs">(Optional)</span>
        </label>

        {/* Web Speech API Voice Button */}
        {isSupported ? (
          <button
            type="button"
            onClick={toggleListening}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-white" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-blue-600" />
                <span>Describe by Voice</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      {/* Voice Status or Unsupported Notification */}
      {isListening && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping shrink-0" />
          <p className="text-xs font-bold text-rose-800 flex-1">
            {transcriptNotice || 'Listening... Speak now into your phone microphone.'}
          </p>
        </div>
      )}

      {!isListening && transcriptNotice && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800">
          {transcriptNotice}
        </div>
      )}

      {!isSupported && (
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Voice input is not supported on this browser. You can type instead.</span>
        </div>
      )}

      {/* Textarea for Typing or Editing Transcribed Text */}
      <div className="relative">
        <textarea
          id="issue-voice-desc"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none leading-relaxed"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* AI Context Clue */}
      {aiDescription && !value && (
        <p className="text-[11px] text-slate-400 italic">
          Tip: AI detected "{aiDescription}". Feel free to speak or type specific road names or landmarks.
        </p>
      )}
    </div>
  );
}
