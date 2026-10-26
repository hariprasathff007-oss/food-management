import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Utensils,
  Filter,
  Truck,
  Award,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { FoodDonation, VerifiedNgo, FoodCategory } from '../types/foodRescue';
import { getExpiryUrgency, checkTemperatureSafety } from '../utils/complianceRules';

interface NgoDashboardProps {
  ngos: VerifiedNgo[];
  activeNgoId: string;
  onSelectNgo: (id: string) => void;
  donations: FoodDonation[];
  onClaimDonation: (donationId: string, ngoId: string) => void;
  onConfirmDelivery: (donationId: string, recipientDetails: string) => void;
  onOpenTracker: (donation: FoodDonation) => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({
  ngos,
  activeNgoId,
  onSelectNgo,
  donations,
  onClaimDonation,
  onConfirmDelivery,
  onOpenTracker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [receiveModalDonation, setReceiveModalDonation] = useState<FoodDonation | null>(null);
  const [receivingTemp, setReceivingTemp] = useState<number>(62.0);
  const [receivingBeneficiaries, setReceivingBeneficiaries] = useState<string>(
    'Community Kitchen Dining Room (85 diners) + Street Pantry Kits (35 kits)'
  );
  const [visualCheck, setVisualCheck] = useState<boolean>(true);
  const [aromaCheck, setAromaCheck] = useState<boolean>(true);
  const [packagingCheck, setPackagingCheck] = useState<boolean>(true);

  const activeNgo = ngos.find((n) => n.id === activeNgoId) || ngos[0];

  const availableDonations = donations.filter((d) => {
    if (d.status !== 'available') return false;
    if (selectedCategory !== 'all') {
      return d.items.some((i) => i.category === selectedCategory);
    }
    return true;
  });

  const claimedByThisNgo = donations.filter((d) => d.claimedByNgoId === activeNgo.id);

  const handleOpenReceiveModal = (donation: FoodDonation) => {
    setReceiveModalDonation(donation);
    setReceivingTemp(donation.transitTelemetry?.currentTempCelsius || donation.temperatureAtPackCelsius || 60);
  };

  const handleCompleteReceipt = () => {
    if (!receiveModalDonation) return;
    if (!visualCheck || !aromaCheck || !packagingCheck) {
      alert('Quality assurance checks must pass regulatory compliance before distribution.');
      return;
    }
    onConfirmDelivery(receiveModalDonation.id, receivingBeneficiaries);
    setReceiveModalDonation(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Verified NGO Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeNgo.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Non-Profit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {activeNgo.address} • Reg #{activeNgo.registrationNumber}
              </p>
            </div>
          </div>

          {/* Switch NGO selector */}
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400 font-medium">Switch NGO View:</label>
            <select
              value={activeNgoId}
              onChange={(e) => onSelectNgo(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {ngos.map((ngo) => (
                <option key={ngo.id} value={ngo.id}>
                  {ngo.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Facilities badges */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Certified Facilities:</span>
          {activeNgo.facilities.map((f, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              {f}
            </span>
          ))}
          <span className="ml-auto text-emerald-400 font-semibold">
            Daily Capacity: {activeNgo.capacityPerDay} meals
          </span>
        </div>
      </div>

      {/* Inbound & Active Shipments claimed by this NGO */}
      {claimedByThisNgo.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Active Inbound Food Rescues for {activeNgo.name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claimedByThisNgo.map((donation) => {
              const mainCat = donation.items[0]?.category || 'cooked_hot';
              const tempSafety = checkTemperatureSafety(
                mainCat,
                donation.transitTelemetry?.currentTempCelsius || donation.temperatureAtPackCelsius
              );

              return (
                <div
                  key={donation.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {donation.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          donation.status === 'in_transit'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : donation.status === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {donation.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{donation.title}</h4>
                    <p className="text-xs text-slate-400">
                      Donor: <strong className="text-slate-200">{donation.donorName}</strong>
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Volume:</span>
                        <span className="text-white font-mono font-semibold">
                          {donation.totalKg} kg (~{donation.totalServings} meals)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Live Temperature:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {donation.transitTelemetry?.currentTempCelsius || donation.temperatureAtPackCelsius}°C ({tempSafety.status})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Courier Assigned:</span>
                        <span className="text-slate-200 font-medium">
                          {donation.volunteerName || 'Matching nearby courier...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {donation.status === 'in_transit' && (
                      <>
                        <button
                          onClick={() => onOpenTracker(donation)}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Track ETA ({donation.transitTelemetry?.etaMinutes || 10}m)
                        </button>
                        <button
                          onClick={() => handleOpenReceiveModal(donation)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Receive
                        </button>
                      </>
                    )}

                    {donation.status === 'claimed' && (
                      <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> Awaiting Courier Pickup Dispatch
                      </span>
                    )}

                    {donation.status === 'delivered' && (
                      <button
                        onClick={() => onOpenTracker(donation)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        View Delivered Certificate & Audit Report
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Surplus Marketplace */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              Available Surplus Food Stream Nearby
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Claim fresh surplus batches. Volunteer couriers will automatically be dispatched for pickup.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {['all', 'cooked_hot', 'cooked_cold', 'bakery', 'fresh_produce', 'dairy'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition capitalize ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {availableDonations.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-base">All Current Surplus Has Been Claimed!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our network has matched all active surplus food batches. When food donors post new batches, alerts will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDonations.map((donation) => {
              const urgency = getExpiryUrgency(donation.expiryTime);
              return (
                <div
                  key={donation.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between space-y-4 group transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {donation.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          urgency.urgency === 'urgent'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : urgency.urgency === 'moderate'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {urgency.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                        {donation.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {donation.donorName} ({donation.donorType.replace('_', ' ')})
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{donation.description}</p>

                    {/* Food Items Breakdown */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                      {donation.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-slate-300">
                          <span className="truncate pr-2 font-medium">• {item.name}</span>
                          <span className="font-mono text-emerald-400 shrink-0">
                            {item.quantityKg}kg (~{item.estimatedServings}p)
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Pack Temp: <strong className="text-white">{donation.temperatureAtPackCelsius}°C</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Packaging: {donation.packagingType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Servings</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {donation.totalServings} Meals
                      </span>
                    </div>

                    <button
                      onClick={() => onClaimDonation(donation.id, activeNgo.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Claim for {activeNgo.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Receive Modal & Safe Inspection Gate */}
      {receiveModalDonation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receive-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <h3 id="receive-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              NGO Reception & Quality Verification Gate
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify the food condition upon arrival at {activeNgo.name} to confirm safe handover.
            </p>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <p>
                  <strong>Batch:</strong> {receiveModalDonation.title}
                </p>
                <p>
                  <strong>Courier:</strong> {receiveModalDonation.volunteerName || 'Registered Volunteer'}
                </p>
                <p>
                  <strong>Quantity:</strong> {receiveModalDonation.totalKg} kg (~
                  {receiveModalDonation.totalServings} meal servings)
                </p>
              </div>

              {/* Digital Thermometer Probe Reading */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Arrival Temperature Reading (°C)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    value={receivingTemp}
                    onChange={(e) => setReceivingTemp(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">
                    Safe range: {receivingTemp >= 60 ? 'Optimal Hot (>= 60°C)' : receivingTemp <= 4 ? 'Optimal Cold (<= 4°C)' : 'Warning / Borderline'}
                  </span>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Mandatory Regulatory Inspection Checklist
                </span>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={packagingCheck}
                    onChange={(e) => setPackagingCheck(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Tamper-evident container seals are unbroken and food-grade packaging intact.</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visualCheck}
                    onChange={(e) => setVisualCheck(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Visual inspection passed (no foreign matter, discoloration or fluid leakage).</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aromaCheck}
                    onChange={(e) => setAromaCheck(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Aroma check passed (fresh, pleasant, free from sour or foul smells).</span>
                </label>
              </div>

              {/* Target Beneficiaries */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Intended Distribution Target & Beneficiaries
                </label>
                <textarea
                  rows={2}
                  value={receivingBeneficiaries}
                  onChange={(e) => setReceivingBeneficiaries(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Resident Families (60 pax) + Evening Street Van Outreach (40 pax)"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setReceiveModalDonation(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteReceipt}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Sign & Authorize Safe Distribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
