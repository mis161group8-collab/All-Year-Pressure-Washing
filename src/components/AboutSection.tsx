import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BEFORE_AFTER_PROJECTS, CONTACT_INFO } from '../data/initialData';
import { ChevronLeft, ChevronRight, FileText, Phone, Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { setQuoteModalOpen } = useApp();

  // Active project index for pagination (changes page/project)
  const [projectIndex, setProjectIndex] = useState<number>(0);

  // Slider position (0 - 100%) for comparing Before and After
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const activeProject = BEFORE_AFTER_PROJECTS[projectIndex];

  const handleNextProject = () => {
    setProjectIndex((prev) => (prev + 1) % BEFORE_AFTER_PROJECTS.length);
  };

  const handlePrevProject = () => {
    setProjectIndex((prev) => (prev - 1 + BEFORE_AFTER_PROJECTS.length) % BEFORE_AFTER_PROJECTS.length);
  };

  return (
    <section id="about-section" className="py-16 lg:py-24 bg-white border-b border-[#E8EEF1] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading Badge */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-[#263F50] uppercase">
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight mt-1.5">
            About All Year Pressure Washing
          </h2>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Interactive Before & After Image Comparison with Slider & Page Buttons */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="bg-[#F8F9F7] rounded-3xl p-4 sm:p-5 border border-[#E8EEF1] shadow-xs space-y-4">
              
              {/* Top Bar: Project title & Pagination Buttons */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#E8EEF1]">
                <div>
                  <h4 className="text-sm font-bold text-[#222222]">
                    {activeProject.title}
                  </h4>
                  <span className="text-[11px] text-[#555555]">
                    {activeProject.location} · Yelp Verified Project
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold text-[#555555] mr-1">
                    {projectIndex + 1} / {BEFORE_AFTER_PROJECTS.length}
                  </span>
                  <button
                    onClick={handlePrevProject}
                    aria-label="Previous Project"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8EEF1] hover:bg-[#E8EEF1] flex items-center justify-center text-[#263F50] transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextProject}
                    aria-label="Next Project"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8EEF1] hover:bg-[#E8EEF1] flex items-center justify-center text-[#263F50] transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Split-Image Comparison Box */}
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden select-none border border-[#E8EEF1] bg-gray-100 shadow-inner">
                {/* AFTER Image (Full background) */}
                <img
                  src={activeProject.afterImage}
                  alt={`After: ${activeProject.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-3 right-3 text-[11px] font-bold bg-[#263F50] text-white px-2.5 py-1 rounded-full shadow-md z-10 pointer-events-none">
                  After
                </span>

                {/* BEFORE Image (Clipped by slider position) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={activeProject.beforeImage}
                    alt={`Before: ${activeProject.title}`}
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-3 left-3 text-[11px] font-bold bg-black/75 text-white px-2.5 py-1 rounded-full shadow-md z-10 pointer-events-none">
                    Before
                  </span>
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-20"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Circular Slider Thumb Indicator */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl border border-gray-300 flex items-center justify-center text-[#263F50]">
                    <div className="flex items-center gap-0.5">
                      <ChevronLeft className="w-3 h-3 -mr-1" />
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Native Range Input covering the image */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Drag slider to compare before and after photos"
                />
              </div>

              {/* Slider instruction & project description */}
              <div className="flex items-center justify-between text-xs text-[#555555] pt-1">
                <span>◀ Slide left or right to compare results ▶</span>
                <button
                  onClick={handleNextProject}
                  className="text-[#263F50] font-semibold hover:underline cursor-pointer"
                >
                  Next Project &rarr;
                </button>
              </div>

              <p className="text-xs text-[#555555] leading-relaxed italic bg-white p-3 rounded-xl border border-[#E8EEF1]">
                "{activeProject.description}"
              </p>
            </div>

          </div>

          {/* Right Column: About Us Text & Environmental Care Section */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* About Text */}
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight">
                About All Year Pressure Washing
              </h3>
              
              <p className="text-base sm:text-lg text-[#333333] leading-relaxed">
                All Year Pressure Washing is a family-owned business serving the Greater Sacramento area. We help homeowners and businesses maintain clean, welcoming outdoor spaces.
              </p>

              <p className="text-sm text-[#555555] leading-relaxed">
                We believe in straightforward service, careful craftsmanship, and honest communication from the initial quote through to project completion. Whether reviving weathered concrete driveways, soft-washing exterior siding, or cleaning multi-story windows, we treat every property as if it were our own.
              </p>
            </div>

            {/* Environmental Care Section: Cleaning With Care */}
            <div className="bg-[#F8F9F7] rounded-2xl p-6 border border-[#E8EEF1] space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-[#263F50]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#222222]">
                    What cleaning products do you use?
                  </h4>
                  <span className="text-[11px] text-[#555555]">Cleaning With Care</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                "Depending on the condition of your property, some cleaning projects require only water. For surfaces with heavier buildup, we may use diluted outdoor bleach when necessary. We take precautions to protect surrounding plants and grass and help prevent cleaning chemicals from entering storm drains."
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-[#555555] pt-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#263F50] mt-2 shrink-0" />
                  <span><strong>Surrounding Plants &amp; Grass:</strong> Nearby plants and grass are watered before and after chemical applications to reduce potential damage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#263F50] mt-2 shrink-0" />
                  <span><strong>Storm Drain Protection:</strong> Careful measures are taken during washing to keep cleaning chemical runoff out of local storm drains.</span>
                </li>
              </ul>
            </div>

            {/* Service Pricing & Free Quote Policy */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] space-y-3 shadow-2xs">
              <div>
                <h4 className="text-sm font-bold text-[#222222]">
                  Service Pricing
                </h4>
                <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                  "Our pressure-washing services start at $250. Pricing varies depending on the type of service and the specific needs of your property. All quotes are all-inclusive, covering fuel, travel expenses, and applicable taxes, so you know the quoted price before work begins."
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8EEF1]">
                <h5 className="text-xs font-bold text-[#263F50]">
                  Free, No-Obligation Quotes
                </h5>
                <p className="text-[11px] text-[#555555] mt-0.5 leading-relaxed">
                  "We offer free quotes for all pressure-washing projects, including on-site assessments. Contact us to discuss your cleaning needs and receive a personalized estimate."
                </p>
              </div>
            </div>

            {/* Direct Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="btn-rounded px-6 py-3 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Request a Free Quote</span>
              </button>

              <a
                href={`tel:${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`}
                className="btn-rounded px-5 py-3 text-xs font-semibold text-[#263F50] bg-[#E8EEF1] hover:bg-[#DCE5EA] border border-[#D5E0E6] transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>{CONTACT_INFO.phone}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
