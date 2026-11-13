import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertTriangle, Droplets, Leaf, Sparkles, Filter, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { CleaningSupply } from '../types';

export const CleaningSuppliesSection: React.FC = () => {
  const { cleaningSupplies } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSupply, setActiveSupply] = useState<CleaningSupply>(cleaningSupplies[0]);

  const categories = ['All', 'Eco Oxidizer', 'Surfactant', 'Alkaline Degreaser', 'Plant Neutralizer', 'Wood Brightener', 'Reclaim System'];

  const filtered = cleaningSupplies.filter((s) => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  return (
    <section id="cleaning-supplies" className="py-16 bg-[#060b11] border-b border-[#182638] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chemical Transparency & Eco SOP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Our Wash Supplies & Safety
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Full disclosure of our certified detergents, plant neutralizers, and vacuum recovery systems protecting Sacramento waterways.
          </p>
        </div>

        {/* Environmental Contrast Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Hazardous conventional washing */}
          <div className="bg-[#1c1218] rounded-2xl p-4 border border-[#3b1e2c]">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Standard Uncontrolled Washing</span>
            </div>
            <ul className="space-y-1.5 text-xs text-rose-200">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Washes oil, brake dust, and grease straight into municipal storm drains.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Harsh unbuffered chemicals damage plants, landscaping, and lawns.</span>
              </li>
            </ul>
          </div>

          {/* All Year Pressure Washing Safe Eco Protocol */}
          <div className="bg-[#0b1b24] rounded-2xl p-4 border border-[#183a4c]">
            <div className="flex items-center gap-2 text-sky-300 font-extrabold text-xs mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All Year Closed-Loop Protocol</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Vacuum berms capture runoff for compliant off-site treatment.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Botanical neutralizer shields flower beds and delicate Sacramento roses.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-rounded px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-[#0f1b29] hover:bg-[#152538] text-slate-300 border border-[#1b2f46]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Supplies Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((supply) => {
            const isSelected = activeSupply.id === supply.id;
            return (
              <div
                key={supply.id}
                onClick={() => setActiveSupply(supply)}
                className={`bg-[#0b1420] rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-xl shadow-sky-500/10'
                    : 'border-[#18283a] hover:border-sky-500/50 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#122133] text-sky-300 border border-[#1e3a5a]">
                      {supply.category}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                      {supply.ecoSafetyRating.split('/')[0].split('(')[0].trim()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white">{supply.name}</h3>
                    {supply.chemicalFormula && (
                      <div className="text-[11px] font-mono text-sky-300 bg-[#070d15] px-2.5 py-1 rounded-md mt-1 border border-[#1a2d42] inline-block">
                        {supply.chemicalFormula}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{supply.purpose}</p>
                </div>

                <div className="pt-3 border-t border-[#18283a] space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400">Dilution: </span>
                    <span className="text-slate-200">{supply.dilutionRatio}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Pet & Plant Safety: </span>
                    <span className="text-slate-200">{supply.petAndPlantSafety}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic bg-[#08101a] p-2.5 rounded-xl border border-[#132030]">
                    {supply.environmentalNotes}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
