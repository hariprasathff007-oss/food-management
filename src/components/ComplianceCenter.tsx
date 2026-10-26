import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Thermometer,
  Lock,
  Scale,
  Award,
  BookOpen,
  Search,
  ExternalLink,
} from 'lucide-react';
import { FoodDonation, FoodCategory } from '../types/foodRescue';
import { verifyRegulatoryCompliance, checkTemperatureSafety } from '../utils/complianceRules';

interface ComplianceCenterProps {
  donations: FoodDonation[];
  onOpenTracker: (donation: FoodDonation) => void;
}

export const ComplianceCenter: React.FC<ComplianceCenterProps> = ({
  donations,
  onOpenTracker,
}) => {
  // Interactive Verification Playground
  const [testCategory, setTestCategory] = useState<FoodCategory>('cooked_hot');
  const [testTemp, setTestTemp] = useState<number>(63.5);
  const [visualCheck, setVisualCheck] = useState<boolean>(true);
  const [odorCheck, setOdorCheck] = useState<boolean>(true);
  const [packagingCheck, setPackagingCheck] = useState<boolean>(true);

  const testResult = verifyRegulatoryCompliance({
    visualCheckPassed: visualCheck,
    odorCheckPassed: odorCheck,
    packagingSealed: packagingCheck,
    measuredTempCelsius: testTemp,
    category: testCategory,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Regulatory Compliance & Food Safety Assurance
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Strict Food Safety Standards for Dignified Distribution
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Every rescued surplus meal is protected by end-to-end cold-chain telematics, digital organoleptic verification, and regulatory adherence to the Bill Emerson Good Samaritan Food Act and HACCP standards.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Scale className="w-4 h-4" />
              Good Samaritan Protection
            </div>
            <p className="text-slate-400">
              42 U.S. Code § 1791 shields good-faith donors, food recovery networks, and shelters from civil/criminal liability.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Thermometer className="w-4 h-4" />
              Thermal Danger Zone Control
            </div>
            <p className="text-slate-400">
              Strict avoidance of 5°C to 57°C (41°F - 135°F) with active digital probe telemetry on all hot and cold transits.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Lock className="w-4 h-4" />
              Tamper-Evident Chain of Custody
            </div>
            <p className="text-slate-400">
              Double-verified digital signatures at donor pickup and NGO reception with immutable audit trail.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Compliance Audit Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Live Food Safety Inspection Gate Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test temperature and organoleptic parameters against international food code rules.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs rounded-lg font-mono bg-slate-800 text-slate-300">
              HACCP / FDA Audit Mode
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Food Category
                </label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value as FoodCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="cooked_hot">Cooked Hot Entrée (Req: &gt;= 60°C)</option>
                  <option value="cooked_cold">Cooked Cold / Chilled (Req: &lt;= 4°C)</option>
                  <option value="dairy">Dairy / Yogurt / Milk (Req: &lt;= 4°C)</option>
                  <option value="bakery">Bakery & Breads (Ambient 15-24°C)</option>
                  <option value="fresh_produce">Fresh Produce (Cellar 4-14°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Measured Core Probe Temp (°C)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={testTemp}
                    onChange={(e) => setTestTemp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    ({((testTemp * 9) / 5 + 32).toFixed(1)}°F)
                  </span>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Sensory & Packaging Checks
              </span>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visualCheck}
                  onChange={(e) => setVisualCheck(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300">
                  Visual Examination: Clean appearance, no discoloration, condensation or separation.
                </span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={odorCheck}
                  onChange={(e) => setOdorCheck(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300">
                  Olfactory Examination: Normal aroma characteristic of food; zero sour or off-notes.
                </span>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packagingCheck}
                  onChange={(e) => setPackagingCheck(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-300">
                  Packaging Integrity: Food-grade container with unbroken tamper-evident seal.
                </span>
              </label>
            </div>
          </div>

          {/* Real-time Verdict Output Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              testResult.approved
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testResult.approved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm">
                  {testResult.approved
                    ? 'REGULATORY VERDICT: APPROVED FOR DISTRIBUTION'
                    : 'REGULATORY VERDICT: REJECTED - UNSAFE'}
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-black/40">
                {testResult.complianceCode}
              </span>
            </div>

            {testResult.violations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-rose-800/80 space-y-1 text-xs text-rose-300">
                <span className="font-semibold block">Identified Non-Compliances:</span>
                {testResult.violations.map((v, i) => (
                  <div key={i}>• {v}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Regulatory Guidelines Reference Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Standard Operating Procedures (SOP)
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Hot Food Holding Window (2-Hour / 4-Hour Rule)
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  Cooked meals must remain above 60°C. If temperature drifts between 55-60°C, transit must be completed within 120 minutes or discarded.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Perishable Cold Chain Enforcement
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  Chilled entrées, cooked poultry, and dairy must be kept at or below 4°C (39°F) during all phases using insulated cambros and active eutectic cooling plates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Mandatory Allergen & Ingredient Tagging
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  All donations must explicitly declare top 9 food allergens (dairy, egg, peanut, tree nut, fish, shellfish, wheat, soy, sesame) for recipient safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Audit Trail Across Active & Past Batches */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Verified Compliance Audit Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable digital certificates and quality gate records generated across all surplus food batches.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {donations.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{d.id}</span>
                  <span className="font-bold text-white">{d.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-400">
                  Donor: {d.donorName} • Packaging: {d.packagingType.replace(/_/g, ' ')} • Pack Temp: {d.temperatureAtPackCelsius}°C
                </p>
                {d.qualityInspection && (
                  <p className="text-emerald-400 text-[11px]">
                    Cert #{d.qualityInspection.certId} • Inspected by {d.qualityInspection.inspectorName} ({d.qualityInspection.measuredTempCelsius}°C)
                  </p>
                )}
              </div>

              <button
                onClick={() => onOpenTracker(d)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                View Full Audit Certificate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
