import { useState, useEffect } from 'react';
import { MapPin, Navigation, Check, X } from 'lucide-react';
import { UserLocation } from '../types';

export const LAGOS_LGAS = [
  "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry",
  "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu",
  "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo",
  "Shomolu", "Surulere"
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation | null;
  onLocationConfirmed: (location: UserLocation) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onLocationConfirmed
}: LocationModalProps) {
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Ikeja');
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  useEffect(() => {
    if (currentLocation) {
      setState(currentLocation.state);
      setLga(currentLocation.lga);
    }
  }, [currentLocation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const loc = { state, lga };
    localStorage.setItem('osoahia_user_location', JSON.stringify(loc));
    onLocationConfirmed(loc);
    onClose();
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setGeoNotice(null);
    navigator.geolocation.getCurrentPosition(
      (_pos) => {
        setLocating(false);
        // Nigerian GPS coordinates mapped to Lagos hub
        setState('Lagos');
        setLga('Ikeja');
        setGeoNotice("Location detected: Ikeja, Lagos State");
      },
      (_err) => {
        setLocating(false);
        setGeoNotice("Location access denied or unavailable. Please select your LGA below.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div
      id="location-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div id="location-modal-card" className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-t-4 border-purple-700 relative">
        {/* Top-right Cancel / Close Button */}
        <button
          id="close-location-modal-button"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          aria-label="Close location selector"
          title="Close / Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-700 rounded-full mb-3 shadow-inner">
            <MapPin className="w-6 h-6 text-purple-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Where are you shopping from?</h2>
          <p className="text-sm text-gray-600 mt-1">
            Delivery rates, estimated dispatch times, and available multi-vendor stocks adapt automatically to your LGA.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">State</label>
            <select
              id="location-state-select"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none transition"
            >
              <option value="Lagos">Lagos State (Active Dispatch Zone)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              LGA (Local Government Area)
            </label>
            <select
              id="location-lga-select"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none transition"
            >
              {LAGOS_LGAS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {geoNotice && (
            <p className="text-xs text-center text-purple-700 bg-purple-50 p-2 rounded-lg font-medium">
              {geoNotice}
            </p>
          )}

          <button
            id="use-gps-button"
            onClick={handleGeolocation}
            disabled={locating}
            type="button"
            className="w-full text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center justify-center gap-1.5 py-1.5 transition disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            {locating ? "Determining GPS coordinates..." : "Use My Current Location (GPS)"}
          </button>

          {/* Action buttons: Cancel + Confirm */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              id="cancel-location-button"
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 text-xs font-bold transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              id="confirm-location-button"
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Check className="w-4 h-4" />
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
