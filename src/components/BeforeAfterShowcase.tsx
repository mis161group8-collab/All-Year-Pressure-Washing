import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BEFORE_AFTER_IMAGE, PATIO_IMAGE, SIDING_IMAGE } from '../data/initialData';
import { Sparkles, ArrowRight, ShieldCheck, Droplet, Sliders, CheckCircle } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  beforeLabel: string;
  afterLabel: string;
  badge: string;
}

const SHOWCASES: ShowcaseItem[] = [
  {
    id: 'driveway',
    title: 'Driveway & Concrete Restoration',
    subtitle: 'Dual rotary surface scrubbing lifts deep oil, moss, and 6-year black traffic film.',
    image: BEFORE_AFTER_IMAGE,
    beforeLabel: 'Grime & Moss Buildup',
    afterLabel: 'Bright Restored Concrete',
    badge: 'Dual Rotary 3500 PSI'
  },
  {
    id: 'patio',
    title: 'Interlocking Paver Patio Rejuvenation',
    subtitle: 'Clears slippery algae between pavers without displacing joint base foundation.',
    image: PATIO_IMAGE,
    beforeLabel: 'Weathered Black Mildew',
    afterLabel: 'Refreshed Natural Stone',
    badge: 'Zero Wand Striping'
  },
  {
    id: 'siding',
    title: 'Whole House Soft Washing',
    subtitle: 'Gentle low-pressure foam eradicates vinyl green mold while keeping landscaping safe.',
    image: SIDING_IMAGE,
    beforeLabel: 'Airborne Algae & Mildew',
    afterLabel: 'Spotless Exterior Finish',
    badge: '100% Plant Safe'
  }
];

export const BeforeAfterShowcase: React.FC = () => {
  const { setQuoteModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<string>('driveway');

  const activeShowcase = SHOWCASES.find((s) => s.id === activeTab) || SHOWCASES[0];

  return (
    <section className="py-16 lg:py-20 bg-[#070d15] border-b border-[#182638] text-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Eye-Catching Visual Kickers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Real Surface Transformations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              See the instant transformation.
            </h2>
            <p className="mt-2 text-slate-400 text-sm sm:text-base leading-relaxed">
              Clean visual proof—compare surfaces before and after our precision wash equipment and eco formulations.
            </p>
          </div>

          {/* Quick Segmented Switcher for surfaces */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#0b1420] rounded-full border border-[#18283a] self-start md:self-auto overflow-x-auto max-w-full">
            {SHOWCASES.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#122133]'
                }`}
              >
                {item.title.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Transformation Frame */}
        <div className="relative rounded-3xl overflow-hidden border border-[#1e324a] shadow-2xl bg-[#09121d]">
          <div className="relative aspect-[16/9] w-full select-none overflow-hidden group">
            {/* Image */}
            <img
              src={activeShowcase.image}
              alt={activeShowcase.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 bg-[#08121d]/90 backdrop-blur-md text-slate-200 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{activeShowcase.beforeLabel}</span>
            </div>

            <div className="absolute top-4 right-4 bg-sky-500/90 backdrop-blur-md text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full border border-sky-300 flex items-center gap-1.5 shadow-lg shadow-sky-500/30">
              <span className="w-2 h-2 rounded-full bg-slate-950" />
              <span>{activeShowcase.afterLabel}</span>
            </div>

            {/* Bottom floating summary strip */}
            <div className="absolute bottom-4 left-4 right-4 p-4 sm:p-5 rounded-2xl bg-[#08121d]/95 backdrop-blur-md border border-[#1b2f46] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{activeShowcase.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{activeShowcase.subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="hidden md:inline-flex text-xs font-bold px-3 py-1 rounded-full bg-[#122133] text-sky-300 border border-[#1e3a5a]">
                  {activeShowcase.badge}
                </span>

                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="btn-rounded flex-1 sm:flex-none px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Get a quote access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Quick Visual Proof Pillars (Anti-Wall-of-Text) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-5 rounded-2xl bg-[#0b1420] border border-[#18283a] shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Zero Surface Damage</h4>
              <p className="text-xs text-slate-400 mt-1">Calibrated pressure prevents pitting concrete or dislodging delicate roof shingle granules.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b1420] border border-[#18283a] shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No Zebra Wand Lines</h4>
              <p className="text-xs text-slate-400 mt-1">Commercial 20-inch rotary surface cleaners ensure perfectly uniform, streak-free concrete.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b1420] border border-[#18283a] shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Biodegradable & Plant-Safe</h4>
              <p className="text-xs text-slate-400 mt-1">Clean detergents neutralize upon contact with soil, protecting your grass, pets, and delta waterways.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
