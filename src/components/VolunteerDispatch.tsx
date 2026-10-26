import React, { useState } from 'react';
import {
  Bike,
  Truck,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  FileCheck,
  Phone,
  Navigation,
  Sparkles,
  ArrowRight,
  UserCheck,
  Star,
} from 'lucide-react';
import { VolunteerCourier, FoodDonation } from '../types/foodRescue';
import { checkTemperatureSafety } from '../utils/complianceRules';

interface VolunteerDispatchProps {
  volunteers: VolunteerCourier[];
  activeVolunteerId: string;
  onSelectVolunteer: (id: string) => void;
  donations: FoodDonation[];
  onAcceptMission: (donationId: string, volunteerId: string) => void;
  onUpdateMissionStatus: (donationId: string, newStatus: any, updates?: any) => void;
  onOpenTracker: (donation: FoodDonation) => void;
}

export const VolunteerDispatch: React.FC<VolunteerDispatchProps> = ({
  volunteers,
  activeVolunteerId,
  onSelectVolunteer,
  donations,
  onAcceptMission,
  onUpdateMissionStatus,
  onOpenTracker,
}) => {
  const activeVolunteer =
    volunteers.find((v) => v.id === activeVolunteerId) || volunteers[0];

  // Quality check form state for step 2
  const [probeTemp, setProbeTemp] = useState<number>(65.0);
  const [inspectNotes, setInspectNotes] = useState<string>(
    'Tamper seals verified. Insulated Cambro temperature verified compliant with FDA code.'
  );

  // Filter donations that need volunteer dispatch:
  // 1. claimed by NGO, but no volunteer assigned yet
  const availableForDispatch = donations.filter(
    (d) => d.status === 'claimed' && !d.volunteerId
  );

  // 2. missions assigned to this volunteer
  const myMissions = donations.filter((d) => d.volunteerId === activeVolunteer.id);
  const activeMission = myMissions.find(
    (d) => d.status === 'volunteer_assigned' || d.status === 'in_transit'
  );

  const handleStartTransit = (donation: FoodDonation) => {
    const mainCategory = donation.items[0]?.category || 'cooked_hot';
    const safety = checkTemperatureSafety(mainCategory, probeTemp);

    const qualityInspection = {
      inspectorName: `${activeVolunteer.name} (Courier #${activeVolunteer.id})`,
      inspectorRole: 'volunteer' as const,
      timestamp: new Date().toISOString(),
      visualCheckPassed: true,
      odorCheckPassed: true,
      packagingSealed: true,
      measuredTempCelsius: probeTemp,
      notes: inspectNotes,
      complianceVerdict: 'APPROVED_FOR_DISTRIBUTION' as const,
      certId: `CERT-SAFE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    const transitTelemetry = {
      currentLat: donation.donorLocation.lat,
      currentLng: donation.donorLocation.lng,
      currentTempCelsius: probeTemp,
      speedKmh: 35,
      etaMinutes: 14,
      tempStatus: safety.status,
      history: [
        {
          timestamp: new Date().toLocaleTimeString(),
          tempCelsius: probeTemp,
          lat: donation.donorLocation.lat,
          lng: donation.donorLocation.lng,
        },
      ],
    };

    onUpdateMissionStatus(donation.id, 'in_transit', {
      qualityInspection,
      transitTelemetry,
    });
  };

  const handleCompleteDelivery = (donation: FoodDonation) => {
    onUpdateMissionStatus(donation.id, 'delivered', {
      distributionReport: {
        deliveredAt: new Date().toISOString(),
        receivedByNgoRep: donation.claimedByNgoName || 'Verified NGO Shelter Desk',
        targetRecipients: 'Community Dining & Family Care Shelter',
        mealsServed: donation.totalServings,
        photosVerified: true,
        digitalSignature: `Received by NGO / Handover from ${activeVolunteer.name}`,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Volunteer Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeVolunteer.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Food Safety Certified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Vehicle: <strong className="text-slate-200 capitalize">{activeVolunteer.vehicleType.replace('_', ' ')}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">Rating: <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" /><strong className="text-amber-400">{activeVolunteer.rating}</strong></span>
                <span>•</span>
                <span>Completed: <strong className="text-emerald-400">{activeVolunteer.completedMissions} missions</strong></span>
              </p>
            </div>
          </div>

          {/* Volunteer Selector */}
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400 font-medium">Switch Courier:</label>
            <select
              value={activeVolunteerId}
              onChange={(e) => onSelectVolunteer(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {volunteers.map((vol) => (
                <option key={vol.id} value={vol.id}>
                  {vol.name} ({vol.vehicleType.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Mission Interactive Stepper */}
      {activeMission ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Current Active Rescue Mission
              </span>
              <h3 className="text-xl font-black text-white mt-1">{activeMission.title}</h3>
              <p className="text-xs text-slate-400">
                Rescue ID: <span className="font-mono text-emerald-400">{activeMission.id}</span> • {activeMission.totalKg} kg (~{activeMission.totalServings} meals)
              </p>
            </div>

            <button
              onClick={() => onOpenTracker(activeMission)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition"
            >
              <Truck className="w-4 h-4" /> Open Live GPS & Sensor Tracker
            </button>
          </div>

          {/* 4-Step Interactive Mission Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-2xl border ${
                activeMission.status === 'volunteer_assigned'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400">Step 1</span>
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-white mt-1">Pickup from Donor</h4>
              <p className="text-xs text-slate-400 mt-1 truncate">{activeMission.donorName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{activeMission.donorAddress}</p>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                activeMission.status === 'volunteer_assigned'
                  ? 'bg-slate-800 border-amber-500/80 text-white ring-2 ring-amber-500/20'
                  : activeMission.status === 'in_transit'
                  ? 'bg-slate-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-400">Step 2</span>
                <Thermometer className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="font-bold text-sm text-white mt-1">Quality Inspection</h4>
              <p className="text-xs text-slate-400 mt-1">Inspect temp probe & sealed containers.</p>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                activeMission.status === 'in_transit'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white ring-2 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-blue-400">Step 3</span>
                <Truck className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="font-bold text-sm text-white mt-1">Safe In-Transit</h4>
              <p className="text-xs text-slate-400 mt-1">Live cold-chain telemetry streaming.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500">Step 4</span>
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className="font-bold text-sm text-white mt-1">NGO Reception</h4>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {activeMission.claimedByNgoName || 'Verified NGO Shelter'}
              </p>
            </div>
          </div>

          {/* Action Panel for Current Step */}
          {activeMission.status === 'volunteer_assigned' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                Step 2 Quality Gate: Log Handover Temperature & Complete Pickup
              </h4>
              <p className="text-xs text-slate-400">
                Verify packaging seals with donor and log digital thermometer reading before placing items in your transport vehicle.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Digital Probe Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={probeTemp}
                    onChange={(e) => setProbeTemp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hygienic Condition & Handover Notes
                  </label>
                  <input
                    type="text"
                    value={inspectNotes}
                    onChange={(e) => setInspectNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => handleStartTransit(activeMission)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
                >
                  <Truck className="w-4 h-4" />
                  Confirm Handover & Begin Transit to Shelter
                </button>
              </div>
            </div>
          )}

          {activeMission.status === 'in_transit' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 animate-pulse" />
                  In Transit to {activeMission.claimedByNgoName}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Destination: {activeMission.deliveryLocation?.address || 'Community Kitchen'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-emerald-400 font-mono font-semibold">
                    Temp: {activeMission.transitTelemetry?.currentTempCelsius || probeTemp}°C
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-300 font-semibold">
                    ETA: ~{activeMission.transitTelemetry?.etaMinutes || 10} minutes
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCompleteDelivery(activeMission)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Safe Arrival & Handover at NGO
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-emerald-400 mx-auto flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">You are currently Available for Dispatch</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Review the available surplus pickups below and accept a food rescue mission within your radius.
          </p>
        </div>
      )}

      {/* Available Missions Stream for Volunteers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Claimed Surplus Food Awaiting Courier Pickup ({availableForDispatch.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These surplus batches have been claimed by verified NGOs and are ready for safe transport.
            </p>
          </div>
        </div>

        {availableForDispatch.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-xs text-slate-400">
            No pending pickups at this moment. You will receive an audio & push notification when new requests are posted.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableForDispatch.map((donation) => (
              <div
                key={donation.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-xl flex flex-col justify-between space-y-4 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald-400 font-bold">
                      {donation.id}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800">
                      DISPATCH READY
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                    {donation.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    From: <strong className="text-slate-200">{donation.donorName}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    To: <strong className="text-emerald-300">{donation.claimedByNgoName}</strong>
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Food Quantity:</span>
                      <span className="font-mono text-white font-bold">
                        {donation.totalKg} kg (~{donation.totalServings} meals)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Packaging:</span>
                      <span className="text-slate-200 capitalize">
                        {donation.packagingType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Packaging Temp:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {donation.temperatureAtPackCelsius}°C
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAcceptMission(donation.id, activeVolunteer.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                >
                  <Bike className="w-4 h-4" />
                  Accept Rescue Mission
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Missions History */}
      {myMissions.filter((d) => d.status === 'delivered').length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            My Completed Rescue Deliveries ({myMissions.filter((d) => d.status === 'delivered').length})
          </h3>

          <div className="space-y-3">
            {myMissions
              .filter((d) => d.status === 'delivered')
              .map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{d.id}</span>
                      <span className="font-semibold text-white">{d.title}</span>
                    </div>
                    <p className="text-slate-400">
                      Delivered to {d.claimedByNgoName} • {d.totalServings} meals distributed
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenTracker(d)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    View Distribution Audit Certificate
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
