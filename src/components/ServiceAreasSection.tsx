import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BUSINESS_HOURS, CONTACT_INFO } from '../data/initialData';
import { MapPin, Search, CheckCircle2, XCircle, Clock, Phone, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export const ServiceAreasSection: React.FC = () => {
  const { serviceAreas, setQuoteModalOpen } = useApp();
  const [zipInput, setZipInput] = useState('');
  const [zipResult, setZipResult] = useState<{ checked: boolean; covered: boolean; areaName?: string; visitFeePolicy?: string } | null>(null);

  const handleZipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanZip = zipInput.trim();
    if (!cleanZip) return;

    const matchedArea = serviceAreas.find((area) =>
      area.zipCodes.some((code) => code === cleanZip)
    );

    if (matchedArea) {
      setZipResult({
        checked: true,
        covered: true,
        areaName: matchedArea.name,
        visitFeePolicy: matchedArea.visitFeePolicy
      });
    } else {
      setZipResult({ checked: true, covered: false });
    }
  };

  return (
    <section id="service-areas" className="py-16 bg-[#080e16] border-t border-b border-[#182638] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Interactive Service Areas & Zip Code Verification */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Coverage & Dispatch Radii</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Our Guaranteed Service Coverage Areas
              </h2>
              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                All Year Pressure Washing operates mobile wash rigs servicing the greater Sacramento metropolitan area, Solano corridor, Yolo county, and surrounding foothills.
              </p>
            </div>

            {/* Interactive Zip Code Checker */}
            <div className="bg-[#0b1420] rounded-3xl p-6 border border-[#18283a] shadow-xl space-y-4">
              <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Check Your Zip Code For Instant Coverage</span>
              </div>

              <form onSubmit={handleZipCheck} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter 5-digit zip code (e.g. 95814, 95758, 95661, 95616)"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[#1e3248] focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm bg-[#060b12] text-white placeholder-slate-500"
                  maxLength={5}
                />
                <button
                  type="submit"
                  className="btn-rounded px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition-colors cursor-pointer shrink-0 shadow-lg shadow-sky-500/20"
                >
                  Verify Coverage
                </button>
              </form>

              {zipResult && zipResult.checked && (
                <div
                  className={`p-4 rounded-2xl border text-sm flex items-start gap-3 transition-all ${
                    zipResult.covered
                      ? 'bg-sky-950/60 border-sky-800 text-sky-200'
                      : 'bg-amber-950/60 border-amber-800 text-amber-200'
                  }`}
                >
                  {zipResult.covered ? (
                    <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      {zipResult.covered
                        ? `Covered: ${zipResult.areaName}`
                        : 'Custom Dispatch Scheduling Required'}
                    </div>
                    <div className="text-xs text-slate-300">
                      {zipResult.covered
                        ? `${zipResult.visitFeePolicy} · Fast Sacramento crew dispatch.`
                        : 'Your zip is just outside our standard daily route. We service extended regions by special request!'}
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => setQuoteModalOpen(true)}
                        className="text-xs font-bold text-sky-300 hover:text-white underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Get a quote access</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Area Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceAreas.map((area) => (
                <div
                  key={area.id}
                  className="bg-[#0b1420] rounded-2xl p-4 border border-[#18283a] hover:border-sky-500/50 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-sm">{area.name}</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#122133] text-sky-300 border border-[#1e3a5a] whitespace-nowrap">
                      {area.visitFeePolicy.includes('$0') ? '$0 Fee' : 'Credited'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{area.responseTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 font-mono">
                    Key Zips: {area.zipCodes.slice(0, 4).join(', ')}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Business Operating Hours & Direct Contact Hub */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Business Operating Hours Card */}
            <div className="bg-[#0b1420] rounded-3xl p-6 sm:p-8 border border-[#18283a] shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Business Operating Hours</h3>
                  <p className="text-xs text-sky-400 font-semibold">8:00am to 8:00pm all days of the week</p>
                </div>
              </div>

              {/* Operating Hours Table */}
              <div className="divide-y divide-[#18283a] text-sm">
                {BUSINESS_HOURS.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{item.days}</div>
                      <div className="text-xs text-slate-400">{item.status}</div>
                    </div>
                    <div className="font-extrabold text-sky-300 bg-[#122133] px-3 py-1 rounded-full text-xs border border-[#1e3a5a]">
                      {item.hours}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-[#0e1926] rounded-2xl border border-[#1b324b] text-xs text-slate-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Operating Monday through Sunday: 8:00 AM – 8:00 PM. Emergency closed-loop spill containment on-call 24/7.</span>
              </div>
            </div>

            {/* Direct Contact Information */}
            <div className="bg-[#0b1420] rounded-3xl p-6 sm:p-8 border border-[#18283a] shadow-xl space-y-4">
              <h3 className="text-lg font-black text-white">Direct Contact Information</h3>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Direct Office & Scheduling</div>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`} className="font-extrabold text-white hover:text-sky-400 transition-colors">
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Email Inquiries & Estimates</div>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="font-extrabold text-white hover:text-sky-400 transition-colors">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#122133] border border-[#1e3a5a] text-sky-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Main Facility & Equipment Hub</div>
                    <div className="font-extrabold text-white">{CONTACT_INFO.headquarters}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="w-full btn-rounded py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition-colors text-center cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  Get a quote access
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
