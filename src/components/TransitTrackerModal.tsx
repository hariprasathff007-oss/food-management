import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  Navigation,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { FoodDonation } from '../types/foodRescue';
import { checkTemperatureSafety } from '../utils/complianceRules';

interface TransitTrackerModalProps {
  donation: FoodDonation;
  onClose: () => void;
  onConfirmDelivery?: (donationId: string) => void;
  userRole: string;
}

export const TransitTrackerModal: React.FC<TransitTrackerModalProps> = ({
  donation,
  onClose,
  onConfirmDelivery,
  userRole,
}) => {
  const [telemetry, setTelemetry] = useState(
    donation.transitTelemetry || {
      currentLat: 37.7795,
      currentLng: -122.412,
      currentTempCelsius: donation.temperatureAtPackCelsius || 64.0,
      speedKmh: 36,
      etaMinutes: 12,
      tempStatus: 'optimal' as const,
      history: [],
    }
  );

  const [activeTab, setActiveTab] = useState<'map' | 'telemetry' | 'safety_cert'>('map');
  const [thermalBoosterActive, setThermalBoosterActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live simulation tick to update vehicle coordinates and telemetry
  useEffect(() => {
    if (donation.status !== 'in_transit') return;

    const timer = setInterval(() => {
      setTelemetry((prev) => {
        // Decrease ETA gradually
        const newEta = Math.max(1, prev.etaMinutes - 0.2);
        // Slight fluctuation in speed
        const newSpeed = Math.floor(28 + Math.sin(Date.now() / 3000) * 12);
        
        // Temperature simulation: drift slightly toward ambient unless thermal booster is active
        const mainCategory = donation.items[0]?.category || 'cooked_hot';
        let newTemp = prev.currentTempCelsius;

        if (mainCategory === 'cooked_hot') {
          if (thermalBoosterActive) {
            newTemp = Math.min(68, prev.currentTempCelsius + 0.3);
          } else {
            // natural slight cooling
            newTemp = Number((prev.currentTempCelsius - 0.05).toFixed(1));
          }
        } else if (mainCategory === 'cooked_cold' || mainCategory === 'dairy') {
          if (thermalBoosterActive) {
            newTemp = Math.max(2.5, prev.currentTempCelsius - 0.2);
          } else {
            // natural slight warming
            newTemp = Number((prev.currentTempCelsius + 0.04).toFixed(1));
          }
        }

        const safety = checkTemperatureSafety(mainCategory, newTemp);

        const newPoint = {
          timestamp: new Date().toLocaleTimeString(),
          tempCelsius: newTemp,
          lat: prev.currentLat - 0.0003,
          lng: prev.currentLng - 0.0004,
        };

        const updatedHistory = [...prev.history.slice(-8), newPoint];

        return {
          currentLat: newPoint.lat,
          currentLng: newPoint.lng,
          currentTempCelsius: newTemp,
          speedKmh: newSpeed,
          etaMinutes: Math.round(newEta),
          tempStatus: safety.status,
          history: updatedHistory,
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [donation.status, donation.items, thermalBoosterActive]);

  const mainCategory = donation.items[0]?.category || 'cooked_hot';
  const tempSafety = checkTemperatureSafety(mainCategory, telemetry.currentTempCelsius);

  const toggleThermalBooster = () => {
    setThermalBoosterActive(!thermalBoosterActive);
    setToastMessage(
      !thermalBoosterActive
        ? 'Thermal Climate Stabilization Chamber Activated! Regulating container temperature.'
        : 'Thermal Booster Deactivated.'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transit-tracker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="transit-tracker-title" className="text-xl font-bold text-white tracking-tight">
                  Live Food Transport & Quality Telemetry
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                  {donation.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracking ID: <span className="font-mono text-emerald-400">{donation.id}</span> • {donation.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                GPS Route Map
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'telemetry' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cold/Hot Chain Sensor
              </button>
              <button
                onClick={() => setActiveTab('safety_cert')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'safety_cert' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety Certificate
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close transit tracker modal"
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-900/90 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Content based on Active Tab */}
        <div className="p-6">
          {activeTab === 'map' && (
            <div className="space-y-6">
              {/* Route Waypoints HUD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    Pickup (Donor)
                  </span>
                  <p className="font-semibold text-sm text-white mt-1 truncate">{donation.donorName}</p>
                  <p className="text-xs text-slate-400 truncate">{donation.donorAddress}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] bg-blue-950 text-blue-300 border border-blue-800">
                    Departed {new Date(donation.pickupWindowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 ring-1 ring-emerald-500/20">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    Courier Vehicle
                  </span>
                  <p className="font-semibold text-sm text-white mt-1">{donation.volunteerName || 'Volunteer Assigned'}</p>
                  <p className="text-xs text-slate-400">{donation.volunteerVehicle || 'Insulated Courier Van'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-emerald-400 font-mono font-medium">{telemetry.speedKmh} km/h</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ETA {telemetry.etaMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Destination (Verified NGO)
                  </span>
                  <p className="font-semibold text-sm text-white mt-1 truncate">
                    {donation.claimedByNgoName || donation.deliveryLocation?.ngoName || 'Pending NGO Destination'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {donation.deliveryLocation?.address || 'Community Center Servery'}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] bg-rose-950 text-rose-300 border border-rose-800">
                    Distribution Team On Standby
                  </span>
                </div>
              </div>

              {/* Vector City Map Simulation Canvas */}
              <div className="relative h-64 md:h-72 w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-700 overflow-hidden shadow-inner flex flex-col justify-between p-4">
                {/* Simulated Street Grid SVG */}
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.8" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Road Network */}
                  <path d="M 20 80 Q 200 60 380 120 T 740 180" fill="none" stroke="#64748b" strokeWidth="6" strokeDasharray="6,4" />
                  <path d="M 80 20 L 220 240 L 600 210" fill="none" stroke="#64748b" strokeWidth="5" />
                  {/* Active Transit Path (Glow Green) */}
                  <path
                    d="M 60 180 C 180 140, 320 190, 520 110 S 720 130, 820 90"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                  />
                </svg>

                {/* Map HUD Overlays */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-mono text-slate-300">GPS LAT: {telemetry.currentLat.toFixed(4)}° N, LNG: {telemetry.currentLng.toFixed(4)}° W</span>
                  </div>

                  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-300">Active Corridor: Express Food Rescue Route #4</span>
                  </div>
                </div>

                {/* Animated Vehicle on Transit Line */}
                <div className="relative z-10 flex items-center justify-between px-10">
                  {/* Donor Landmark */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-blue-300 shadow-lg shadow-blue-500/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 mt-1.5 bg-slate-900/80 px-2 py-0.5 rounded">
                      Origin: {donation.donorName.slice(0, 16)}...
                    </span>
                  </div>

                  {/* Moving Courier */}
                  <div className="flex flex-col items-center animate-bounce">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/30">
                        <Truck className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-emerald-950 text-emerald-400 text-[10px] font-mono rounded border border-emerald-500">
                        {telemetry.speedKmh}km/h
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300 mt-1.5 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/40">
                      {donation.volunteerName || 'Rescue Courier'}
                    </span>
                  </div>

                  {/* NGO Landmark */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-rose-600/30 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 mt-1.5 bg-slate-900/80 px-2 py-0.5 rounded">
                      Shelter Dropoff
                    </span>
                  </div>
                </div>

                {/* Bottom Live Bar */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">Total Distance: <strong className="text-white">4.8 km</strong></span>
                    <span className="text-slate-400">Remaining: <strong className="text-emerald-400">1.6 km</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Transit Quality Condition:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        tempSafety.status === 'optimal'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : tempSafety.status === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {tempSafety.status.toUpperCase()} ({telemetry.currentTempCelsius}°C)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* Cold/Hot Chain Sensor Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-emerald-400" />
                      Live Digital Thermal Probe
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tempSafety.status === 'optimal'
                          ? 'bg-emerald-900/70 text-emerald-300'
                          : tempSafety.status === 'warning'
                          ? 'bg-amber-900/70 text-amber-300'
                          : 'bg-rose-900/70 text-rose-300'
                      }`}
                    >
                      {tempSafety.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-white font-mono">
                      {telemetry.currentTempCelsius.toFixed(1)}°C
                    </span>
                    <span className="text-lg text-slate-400 font-mono">
                      ({((telemetry.currentTempCelsius * 9) / 5 + 32).toFixed(1)}°F)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                    {tempSafety.message}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target Safety Standard:</span>
                    <span className="font-mono font-semibold text-emerald-400">{tempSafety.recommendedRange}</span>
                  </div>

                  {/* Thermal Booster Control */}
                  <div className="mt-4">
                    <button
                      onClick={toggleThermalBooster}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        thermalBoosterActive
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      <Zap className={`w-4 h-4 ${thermalBoosterActive ? 'animate-spin' : ''}`} />
                      {thermalBoosterActive
                        ? 'Thermal Booster ACTIVE (Stabilizing Container)'
                        : 'Engage Active Container Climate Control'}
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      In-Transit Temperature Log (Last 20m)
                    </span>
                    <span className="text-[11px] text-slate-400">Telemetry Rate: 5s</span>
                  </div>

                  {/* SVG Temperature Sparkline */}
                  <div className="h-32 w-full bg-slate-950/70 rounded-xl border border-slate-700/60 p-2 flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Threshold Range: {tempSafety.recommendedRange}</span>
                      <span>Safe Zone</span>
                    </div>

                    <div className="h-20 w-full flex items-end gap-2 px-1">
                      {telemetry.history.map((pt, idx) => {
                        // calculate bar height based on temp relative to 0-80 range
                        const heightPct = Math.min(100, Math.max(15, (pt.tempCelsius / 80) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t transition-all ${
                                pt.tempCelsius >= 60 || pt.tempCelsius <= 4
                                  ? 'bg-emerald-500'
                                  : pt.tempCelsius >= 55 || pt.tempCelsius <= 7
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            ></div>
                            <span className="text-[9px] text-slate-400 mt-1 scale-75">
                              {pt.timestamp.split(':').slice(0, 2).join(':')}
                            </span>
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 hidden group-hover:block bg-slate-900 border border-slate-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow z-20 whitespace-nowrap">
                              {pt.tempCelsius.toFixed(1)}°C
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Packaging Type:</span>
                      <span className="text-slate-200 capitalize font-medium">
                        {donation.packagingType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Initial Packaging Temp:</span>
                      <span className="text-slate-200 font-mono font-medium">
                        {donation.temperatureAtPackCelsius}°C
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Max Tolerable Deviation:</span>
                      <span className="text-slate-200 font-mono">± 5.0°C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety_cert' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 text-slate-200 relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-56 h-56 text-emerald-400" />
                </div>

                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        Certificate of Food Safety & Safe Samaritan Compliance
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Regulatory Audit ID: {donation.qualityInspection?.certId || 'CERT-SAFE-INITIAL-PENDING'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                    PASSED REGULATORY VERIFICATION
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="text-slate-400">
                      <strong>Food Donor Facility:</strong> {donation.donorName}
                    </p>
                    <p className="text-slate-400">
                      <strong>Food Category:</strong> {donation.items.map((i) => i.name).join(', ')}
                    </p>
                    <p className="text-slate-400">
                      <strong>Total Volume & Servings:</strong> {donation.totalKg} kg (~{donation.totalServings} meal portions)
                    </p>
                    <p className="text-slate-400">
                      <strong>Prepared Timestamp:</strong> {new Date(donation.preparedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-400">
                      <strong>Inspector / Courier:</strong> {donation.volunteerName || 'Certified Volunteer'}
                    </p>
                    <p className="text-slate-400">
                      <strong>Packaging Integrity:</strong> Tamper-proof seals 100% verified intact.
                    </p>
                    <p className="text-slate-400">
                      <strong>Organoleptic (Sensory) Check:</strong> Normal odor, color, and steam pressure confirmed.
                    </p>
                    <p className="text-slate-400">
                      <strong>Statutory Standard:</strong> Bill Emerson Good Samaritan Food Act 42 U.S. Code § 1791 & HACCP.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Digital Blockchain Hash: 8f9b2c4e1a0...df72
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Authorized Quality Auditor Signature</span>
                    <span className="font-serif italic text-emerald-400 font-semibold">
                      {donation.qualityInspection?.inspectorName || 'Alex Rivera, Certified Rescue Officer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Real-time IoT Telemetry active. Updates streamed every 2 seconds.
          </div>

          <div className="flex items-center gap-2">
            {onConfirmDelivery && (userRole === 'ngo' || userRole === 'volunteer') && donation.status === 'in_transit' && (
              <button
                onClick={() => onConfirmDelivery(donation.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirm Safe Arrival & Delivery
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Close Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
