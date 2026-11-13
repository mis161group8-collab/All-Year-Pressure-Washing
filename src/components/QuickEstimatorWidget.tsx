import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Sparkles, Check, ArrowRight, ShieldCheck, Clock, DollarSign, Sliders, MapPin } from 'lucide-react';

export const QuickEstimatorWidget: React.FC = () => {
  const {
    services,
    calculateDirectPrice,
    setQuoteModalOpen,
    setBookingModalOpen,
    setPreselectedServiceForQuote,
    setPreselectedServiceForBooking,
    visitFeePolicy
  } = useApp();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[1]?.id || 'driveway-wash');
  const [squareFootage, setSquareFootage] = useState<number>(850);
  const [zipOrCity, setZipOrCity] = useState<string>('95811');

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const priceBreakdown = calculateDirectPrice(currentService.id, squareFootage, zipOrCity);

  const handleBookDirectPrice = () => {
    setPreselectedServiceForBooking(currentService.id);
    setBookingModalOpen(true);
  };

  const handleFormalQuote = () => {
    setPreselectedServiceForQuote(currentService.id);
    setQuoteModalOpen(true);
  };

  return (
    <section id="direct-pricing-calculator" className="py-16 bg-[#080e16] border-b border-[#182638] text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b1420] rounded-3xl p-6 sm:p-8 border border-[#18283a] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            {/* Header - concise and easy to read */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                <Calculator className="w-3.5 h-3.5 text-sky-400" />
                <span>Price by Area Size</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Instant Price Calculator
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your area square footage for a direct locked price with $0 visit fee across the Sacramento core.
              </p>
            </div>

            {/* Interactive Step 1: Select Service */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  1. Select Cleaning Service:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {services.map((item) => {
                    const isSelected = item.id === selectedServiceId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedServiceId(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md shadow-sky-500/20'
                            : 'bg-[#0f1b29] hover:bg-[#152538] border-[#1b2f46] text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold truncate block">{item.name}</span>
                        <div className="flex items-center justify-between text-[11px] opacity-90 font-mono">
                          <span>Base: ${item.basePrice}</span>
                          {item.pricePerSqFt && <span>${item.pricePerSqFt}/sqft</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Input Exact Size (Sq Ft) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0e1926] p-5 rounded-2xl border border-[#1b324b]">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      2. Area Size to Clean (Square Feet):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={100}
                        max={10000}
                        step={25}
                        value={squareFootage}
                        onChange={(e) => setSquareFootage(Math.max(50, Number(e.target.value)))}
                        className="w-24 px-2.5 py-1 text-right font-black text-sm text-sky-300 bg-[#070d15] border border-[#234262] rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">sq ft</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={50}
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>200 sq ft (Walkway / Patio)</span>
                    <span>1,500 sq ft (Avg Driveway)</span>
                    <span>3,500+ sq ft (Large Home / Plaza)</span>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-[#1a2d42] pt-3 md:pt-0 md:pl-5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Sacramento Location / Zip:
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-sky-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={zipOrCity}
                      onChange={(e) => setZipOrCity(e.target.value)}
                      placeholder="e.g. 95814 or Sacramento"
                      className="w-full pl-8 pr-3 py-1.5 bg-[#070d15] border border-[#1e334a] rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    />
                  </div>
                  <div className="text-[10px] text-sky-300 font-bold flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3 text-sky-400" />
                    <span>Sacramento Core: $0 On-Site Assessment</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Direct Price Result Card */}
              <div className="mt-4 p-6 rounded-3xl bg-[#0f1b29] border border-[#1b344e] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Locked Direct Price
                    </span>
                    <span className="text-[10px] font-black bg-sky-950/80 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-800">
                      Visit Fee: $0 Waived
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tabular-nums">
                      ${priceBreakdown.totalDirectPrice}
                    </span>
                    <span className="text-xs text-sky-400 font-semibold">direct price</span>
                  </div>

                  {/* Cost breakdown items */}
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono">
                    <span>Base: ${priceBreakdown.basePrice}</span>
                    <span>·</span>
                    <span>
                      Area: {priceBreakdown.sqFt} sq ft (${priceBreakdown.sqFtRate}/sq ft)
                    </span>
                    <span>·</span>
                    <span className="text-sky-300 font-bold">
                      Visit Fee: $0
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleBookDirectPrice}
                    className="w-full sm:w-auto btn-rounded px-6 py-3.5 bg-[#122133] hover:bg-[#1a2e44] text-white font-bold text-xs border border-[#1e3a5a] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-4 h-4 text-sky-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleFormalQuote}
                    className="w-full sm:w-auto btn-rounded px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Get a quote access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
