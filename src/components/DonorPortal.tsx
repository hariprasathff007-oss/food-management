import React, { useState } from 'react';
import {
  Plus,
  Building2,
  Utensils,
  Clock,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Truck,
  Leaf,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { FoodDonation, FoodItem, FoodCategory, DonorType } from '../types/foodRescue';
import {
  calculateEstimatedServings,
  calculateCo2AvoidedKg,
  calculateWaterSavedLitres,
  getRecommendedStorageReq,
} from '../utils/complianceRules';

interface DonorPortalProps {
  donations: FoodDonation[];
  onAddDonation: (newDonation: FoodDonation) => void;
  onOpenTracker: (donation: FoodDonation) => void;
}

export const DonorPortal: React.FC<DonorPortalProps> = ({
  donations,
  onAddDonation,
  onOpenTracker,
}) => {
  const [donorType, setDonorType] = useState<DonorType>('restaurant');
  const [donorName, setDonorName] = useState('Olive & Thyme Mediterranean Bistro');
  const [donorAddress, setDonorAddress] = useState('822 Valencia Street, Mission District');
  const [donorPhone, setDonorPhone] = useState('+1 (555) 781-3004');
  const [title, setTitle] = useState('Surplus Dinner Buffet & Fresh Bakery');
  const [description, setDescription] = useState('Freshly prepared untouched banquet entrées packed into certified food-safe containers.');

  // Food Items Builder
  const [items, setItems] = useState<FoodItem[]>([
    {
      id: 'item-' + Date.now(),
      name: 'Roasted Mediterranean Chicken & Herb Potatoes',
      category: 'cooked_hot',
      quantityKg: 20,
      estimatedServings: 57,
      allergens: [],
      dietaryTags: ['halal', 'gluten_free'],
      storageReq: 'hot_insulated',
    },
  ]);

  const [packagingType, setPackagingType] = useState<
    'sealed_food_grade_containers' | 'insulated_cambros' | 'aluminum_foil_trays' | 'vacuum_sealed'
  >('insulated_cambros');
  const [tempCelsius, setTempCelsius] = useState<number>(65.0);
  const [expiryHours, setExpiryHours] = useState<number>(4);
  const [safetySigned, setSafetySigned] = useState<boolean>(true);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Totals calculations
  const totalKg = items.reduce((acc, curr) => acc + (Number(curr.quantityKg) || 0), 0);
  const totalServings = items.reduce((acc, curr) => acc + (Number(curr.estimatedServings) || 0), 0);
  const co2Saved = calculateCo2AvoidedKg(totalKg);
  const waterSaved = calculateWaterSavedLitres(totalKg);

  const handleAddItem = () => {
    const newItem: FoodItem = {
      id: 'item-' + Date.now(),
      name: '',
      category: 'cooked_hot',
      quantityKg: 10,
      estimatedServings: 29,
      allergens: [],
      dietaryTags: ['vegetarian'],
      storageReq: 'hot_insulated',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<FoodItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (updates.quantityKg !== undefined || updates.category !== undefined) {
          updated.estimatedServings = calculateEstimatedServings(
            updated.category,
            Number(updated.quantityKg) || 0
          );
          updated.storageReq = getRecommendedStorageReq(updated.category);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetySigned) {
      alert('Please confirm the Food Safety & Good Samaritan compliance declaration.');
      return;
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + expiryHours * 3600 * 1000).toISOString();
    const pickupWindowStart = now.toISOString();
    const pickupWindowEnd = new Date(now.getTime() + Math.min(2, expiryHours) * 3600 * 1000).toISOString();

    const newDonation: FoodDonation = {
      id: `DON-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      donorId: `donor-${Date.now()}`,
      donorName,
      donorType,
      donorAddress,
      donorPhone,
      donorLocation: { lat: 37.7749 + (Math.random() - 0.5) * 0.02, lng: -122.4194 + (Math.random() - 0.5) * 0.02 },
      title,
      description,
      items,
      totalKg,
      totalServings,
      preparedAt: now.toISOString(),
      expiryTime,
      packagingType,
      temperatureAtPackCelsius: tempCelsius,
      safetyDeclarationSigned: true,
      status: 'available',
      pickupWindowStart,
      pickupWindowEnd,
      createdAt: now.toISOString(),
    };

    onAddDonation(newDonation);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 5000);

    // Reset item list
    setItems([
      {
        id: 'item-' + Date.now(),
        name: 'Fresh Bakery Surplus Assortment',
        category: 'bakery',
        quantityKg: 15,
        estimatedServings: 100,
        allergens: ['Gluten'],
        dietaryTags: ['vegetarian'],
        storageReq: 'ambient',
      },
    ]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Donor Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Food Donor Dispatch Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Turn Surplus Food into Immediate Community Relief
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Register untouched surplus from banquets, restaurants, cafeterias, and grocers. Our network instantly alerts nearby verified NGOs and volunteer couriers, logging safe temperature compliance every step of the journey.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Good Samaritan Act Protected (42 U.S. Code § 1791)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-4 h-4 text-blue-400" /> Automated Volunteer Courier Matching
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Thermometer className="w-4 h-4 text-amber-400" /> Digital Hot & Cold Chain Audit Trail
            </span>
          </div>
        </div>
      </div>

      {submittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-white flex items-center justify-between shadow-lg shadow-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Surplus Food Donation Registered Successfully!</h4>
              <p className="text-xs text-emerald-200">
                Registered NGOs and nearby volunteer couriers have been alerted. You will receive real-time updates as soon as a courier accepts pickup.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-800/80 rounded-lg text-emerald-100">
            Dispatch Broadcasted
          </span>
        </div>
      )}

      {/* Main Grid: Form + Live Impact & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Post Surplus Food Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                List Surplus Food for Rescue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide accurate food quantity, storage condition, and packing temperature.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              Step 1 of 2
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Donor Entity Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Donor Establishment Type
                </label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value as DonorType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="restaurant">Restaurant / Bistro</option>
                  <option value="event_caterer">Event Caterer / Banquet Hall</option>
                  <option value="banquet_hall">Hotel / Convention Center</option>
                  <option value="supermarket">Supermarket / Grocery Retail</option>
                  <option value="household">Household / Community Kitchen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Donor Establishment Name
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Grand Plaza Banquet Kitchen"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pickup Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 150 4th Street, Service Loading Dock"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Donor Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Donation Batch Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Wedding Banquet Evening Surplus"
                />
              </div>
            </div>

            {/* Food Items Line Items */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  Surplus Food Items ({items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Food Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        Item #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Food Description & Dishes
                        </label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g. Steamed Jasmine Rice & Vegetable Curry"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              category: e.target.value as FoodCategory,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="cooked_hot">Cooked Hot (&ge; 60°C)</option>
                          <option value="cooked_cold">Cooked Cold / Chilled</option>
                          <option value="bakery">Fresh Bakery / Bread</option>
                          <option value="fresh_produce">Fresh Produce / Fruit</option>
                          <option value="packaged_dry">Packaged Dry Goods</option>
                          <option value="dairy">Dairy / Refrigerated</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Net Weight (kg)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="2000"
                          step="0.5"
                          required
                          value={item.quantityKg}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              quantityKg: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Calculated Servings (Meals)
                        </label>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-emerald-400 font-mono text-xs font-bold flex items-center justify-between">
                          <span>~{item.estimatedServings} meal portions</span>
                          <span className="text-[10px] text-slate-500 font-normal">Standard 350g/meal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & Cold-Chain Declaration */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Packaging & Safe Storage Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Packaging Standard
                  </label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="insulated_cambros">Insulated Food Cambros</option>
                    <option value="sealed_food_grade_containers">Sealed Food-Grade Tubs</option>
                    <option value="aluminum_foil_trays">Tamper-Sealed Aluminum Trays</option>
                    <option value="vacuum_sealed">Vacuum Sealed Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Temp at Packaging (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={tempCelsius}
                    onChange={(e) => setTempCelsius(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Safe Consumption Window
                  </label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="2">2 Hours (Immediate Hot Pickup)</option>
                    <option value="4">4 Hours (Standard Safe Window)</option>
                    <option value="8">8 Hours (Chilled/Refrigerated)</option>
                    <option value="24">24 Hours (Bakery & Produce)</option>
                  </select>
                </div>
              </div>

              {/* Compliance Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetySigned}
                  onChange={(e) => setSafetySigned(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white block">
                    Regulatory Food Safety & Quality Attestation
                  </span>
                  I certify that all surplus food was handled in compliant hygienic commercial kitchens, kept above 60°C or below 4°C, packaged in food-grade materials, and is safe for human consumption under the Good Samaritan Food Donation Act.
                </div>
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              Broadcast Surplus Food & Dispatch Courier ({totalServings} Meals)
            </button>
          </form>
        </div>

        {/* Right Column: Live Environmental Impact & Active Donor Listings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant Impact Calculator Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Projected Donation Impact
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Meals</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {totalServings}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Hungry individuals fed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Food Rescued</span>
                <span className="text-2xl font-black text-white font-mono">{totalKg} kg</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Prevented from waste</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">CO2e Emissions Diverted</span>
                <span className="text-2xl font-black text-blue-400 font-mono">{co2Saved} kg</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Landfill methane avoided</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Water Conserved</span>
                <span className="text-2xl font-black text-teal-400 font-mono">{waterSaved} L</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Agricultural water footprint</span>
              </div>
            </div>
          </div>

          {/* Active Listings / Recent Rescues */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Active Rescue Shipments
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {donations.length} Active Batches
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {donations.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{d.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        d.status === 'in_transit'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : d.status === 'claimed'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : d.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    {d.donorName} • {d.totalKg} kg (~{d.totalServings} meals)
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      Temp: <strong className="text-emerald-400 font-mono">{d.temperatureAtPackCelsius}°C</strong>
                    </span>

                    {d.status === 'in_transit' && (
                      <button
                        onClick={() => onOpenTracker(d)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Truck className="w-3.5 h-3.5 animate-pulse" />
                        Live GPS & Temp ({d.transitTelemetry?.etaMinutes || 10}m ETA)
                      </button>
                    )}

                    {d.status === 'available' && (
                      <span className="text-amber-400 text-[11px] font-medium">
                        Waiting for NGO claim...
                      </span>
                    )}

                    {d.status === 'delivered' && (
                      <button
                        onClick={() => onOpenTracker(d)}
                        className="text-emerald-400 text-xs font-medium hover:underline flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> View Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
