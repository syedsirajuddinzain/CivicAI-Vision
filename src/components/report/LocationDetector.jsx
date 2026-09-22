import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';

export default function LocationDetector({ location, onLocationDetected, onClearLocation }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const requestLocation = () => {
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        const { latitude, longitude, accuracy } = position.coords;
        onLocationDetected({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
          detectedAt: new Date().toLocaleTimeString(),
        });
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission was denied. Please allow location access in your browser settings to detect coordinates.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location information is currently unavailable from your device.');
            break;
          case error.TIMEOUT:
            setErrorMsg('Request to get location timed out. Please try again.');
            break;
          default:
            setErrorMsg('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>2. Issue Location</span>
          <span className="text-slate-400 font-normal text-xs">(GPS Coordinates)</span>
        </label>
        {location && (
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Location detected ✓</span>
          </span>
        )}
      </div>

      {!location ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Pinpoint coordinates</p>
                <p className="text-xs text-slate-500">
                  Allow browser GPS access to attach precise latitude and longitude.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={requestLocation}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-[0.98] disabled:opacity-60 cursor-pointer flex-shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span>Use My Location</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="block mt-1 font-bold text-amber-900 underline hover:text-amber-700"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Detected Location Display */
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold">Location detected ✓</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestLocation}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                title="Re-detect GPS"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={onClearLocation}
                className="text-xs text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-3 border border-emerald-100 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Latitude</span>
              <span className="text-slate-800 font-bold">{location.latitude}°</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Longitude</span>
              <span className="text-slate-800 font-bold">{location.longitude}°</span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-700/80">
            Detected via device GPS (Accuracy: ±{location.accuracy}m at {location.detectedAt})
          </p>
        </div>
      )}
    </div>
  );
}
