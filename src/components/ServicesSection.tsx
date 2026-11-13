import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MAIN_SERVICE_CATEGORIES,
  BEFORE_AFTER_PROJECTS,
  ServiceCategory
} from '../data/initialData';
import { Check, ArrowRight, X, ChevronRight } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const { setQuoteModalOpen, setSelectedQuoteCategory, setSelectedQuoteSubcategories } = useApp();

  // Active modal/drawer or expanded category ID
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Selected services inside the detail view
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleOpenCategory = (cat: ServiceCategory) => {
    setActiveCategoryId(cat.id);
    setSelectedItems([]);
  };

  const handleCloseCategory = () => {
    setActiveCategoryId(null);
  };

  const toggleItem = (name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleRequestQuote = (cat: ServiceCategory) => {
    setSelectedQuoteCategory(cat.name);
    setSelectedQuoteSubcategories(selectedItems.length > 0 ? selectedItems : cat.subcategories.slice(0, 2));
    setActiveCategoryId(null);
    setQuoteModalOpen(true);
  };

  const activeCategory = MAIN_SERVICE_CATEGORIES.find((c) => c.id === activeCategoryId);

  return (
    <section id="services-section" className="py-16 lg:py-24 bg-[#F8F9F7] border-b border-[#E8EEF1] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-[#263F50] uppercase">
            Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight mt-1.5">
            Our Services
          </h2>
          <p className="mt-2.5 text-[#555555] text-sm sm:text-base leading-relaxed">
            Professional pressure washing and window cleaning tailored to each surface across Greater Sacramento.
          </p>
        </div>

        {/* Four Large Service Cards in a row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {MAIN_SERVICE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="group bg-white rounded-2xl border border-[#E8EEF1] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Large Professional Image — Strict Rule: No icons or symbols */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E8EEF1]">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#222222] group-hover:text-[#263F50] transition-colors leading-snug">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#555555] leading-relaxed line-clamp-3">
                    {category.shortDescription}
                  </p>
                </div>
              </div>

              {/* View Services Link Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => handleOpenCategory(category)}
                  className="w-full btn-rounded py-2.5 px-4 text-xs font-semibold text-[#263F50] bg-[#E8EEF1] hover:bg-[#263F50] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#D5E0E6]"
                >
                  <span>View Services</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Clean Detail Modal / Expandable View when a Service Card is clicked */}
        {activeCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8EEF1] animate-in fade-in zoom-in-95 duration-200"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Top Banner with Large Photo */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-t-3xl bg-[#E8EEF1]">
                <img
                  src={activeCategory.image}
                  alt={activeCategory.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={handleCloseCategory}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="text-xs uppercase tracking-wider text-sky-200 font-semibold">
                    Service Category
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold">{activeCategory.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl">
                    {activeCategory.shortDescription}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Individual Services with check selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[#222222] uppercase tracking-wider">
                      Included Cleaning Services
                    </h4>
                    <span className="text-xs text-[#555555]">
                      Select items to request in your quote:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCategory.detailedItems.map((item) => {
                      const isSelected = selectedItems.includes(item.name);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item.name)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#E8EEF1] border-[#263F50] text-[#222222] shadow-2xs'
                              : 'bg-[#F8F9F7] border-[#E8EEF1] text-[#222222] hover:bg-white hover:border-[#D5E0E6]'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-[#222222]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[#555555] mt-0.5 leading-snug">
                              {item.shortDescription}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? 'bg-[#263F50] border-[#263F50] text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Before & After Photo from Yelp */}
                <div className="p-4 rounded-2xl bg-[#F8F9F7] border border-[#E8EEF1] space-y-2">
                  <div className="text-xs font-bold text-[#263F50] uppercase tracking-wider">
                    Authentic Yelp Job Result
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E8EEF1]">
                        <img
                          src={BEFORE_AFTER_PROJECTS[0].beforeImage}
                          alt="Before cleaning"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full">
                          Before
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#E8EEF1]">
                        <img
                          src={BEFORE_AFTER_PROJECTS[0].afterImage}
                          alt="After cleaning"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#263F50] text-white px-2 py-0.5 rounded-full">
                          After
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#555555] italic">
                    Restoring surface brightness and removing deep grime without structural damage.
                  </p>
                </div>

                {/* Footer action: Request Quote for Price */}
                <div className="pt-4 border-t border-[#E8EEF1] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#555555]">
                    {selectedItems.length > 0 ? (
                      <span>
                        <strong className="text-[#222222]">{selectedItems.length}</strong> services selected for your quote
                      </span>
                    ) : (
                      <span>Select services above, or request a general quote for {activeCategory.name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCloseCategory}
                      className="btn-rounded px-4 py-2.5 text-xs font-semibold text-[#555555] hover:text-[#222222] bg-white border border-[#E8EEF1]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestQuote(activeCategory)}
                      className="btn-rounded flex-1 sm:flex-none px-6 py-2.5 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Request Quote for Price</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
