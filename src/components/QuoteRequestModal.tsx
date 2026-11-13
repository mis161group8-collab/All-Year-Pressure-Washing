import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Upload, LogIn } from 'lucide-react';
import { MAIN_SERVICE_CATEGORIES, REMOVAL_NEEDS_OPTIONS, TIMING_OPTIONS } from '../data/initialData';
import { QuoteRequest } from '../types';

export const QuoteRequestModal: React.FC = () => {
  const {
    firebaseUser,
    signInWithGoogle,
    quoteModalOpen,
    setQuoteModalOpen,
    currentUser,
    submitQuoteRequest,
    selectedQuoteCategory,
    setSelectedQuoteCategory,
    selectedQuoteSubcategories,
    setSelectedQuoteSubcategories,
    switchToDedicatedView
  } = useApp();

  // Step 1 to 6, then 7 is 'review'
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalQuestions = 6;

  // Form states
  const [selectedMainCat, setSelectedMainCat] = useState<string>('Driveways & Outdoor Surfaces');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [removalNeeds, setRemovalNeeds] = useState<string[]>([]);
  const [otherRemovalText, setOtherRemovalText] = useState('');
  const [approxSqFt, setApproxSqFt] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  
  // Timing preference
  const [timingPreference, setTimingPreference] = useState<'asap' | 'flexible' | 'specific_date'>('asap');
  const [calendarDate, setCalendarDate] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Location
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Sacramento');
  const [state] = useState('CA');
  const [zipCode, setZipCode] = useState('');

  // Contact
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize or pre-fill from context/user when modal opens
  useEffect(() => {
    if (quoteModalOpen) {
      if (selectedQuoteCategory) {
        const matched = MAIN_SERVICE_CATEGORIES.find(
          (c) => c.name.toLowerCase() === selectedQuoteCategory.toLowerCase()
        );
        if (matched) {
          setSelectedMainCat(matched.name);
        } else {
          setSelectedMainCat(selectedQuoteCategory);
        }
      } else {
        setSelectedMainCat('Driveways & Outdoor Surfaces');
      }

      if (selectedQuoteSubcategories && selectedQuoteSubcategories.length > 0) {
        setSelectedSubs(selectedQuoteSubcategories);
      } else {
        setSelectedSubs([]);
      }

      setCurrentStep(1);
      setSubmittedQuote(null);
      setErrorMessage('');
    }
  }, [quoteModalOpen, selectedQuoteCategory, selectedQuoteSubcategories]);

  // Auto-populate customer profile details into quote form
  useEffect(() => {
    if (quoteModalOpen && currentUser) {
      if (currentUser.name) setFullName(currentUser.name);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.address) {
        const parts = currentUser.address.split(',');
        if (parts[0]) setStreetAddress(parts[0].trim());
        if (parts[1]) setCity(parts[1].trim());
      }
    }
  }, [quoteModalOpen, currentUser]);

  if (!quoteModalOpen) return null;

  const handleClose = () => {
    setQuoteModalOpen(false);
    setSelectedQuoteCategory(null);
    setSelectedQuoteSubcategories([]);
    setSubmittedQuote(null);
  };

  // Subcategories according to selected category
  const activeCategoryConfig = MAIN_SERVICE_CATEGORIES.find((c) => c.name === selectedMainCat) || MAIN_SERVICE_CATEGORIES[0];
  const availableSubcategories = activeCategoryConfig ? activeCategoryConfig.subcategories : [];

  // Toggle subcategory selection
  const toggleSubcategory = (item: string) => {
    setSelectedSubs((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Toggle removal needs selection
  const toggleRemovalNeed = (id: string) => {
    setRemovalNeeds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Photo upload handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Validation
  const canContinue = () => {
    if (currentStep === 1) {
      return Boolean(selectedMainCat);
    }
    if (currentStep === 2) {
      if (selectedSubs.length === 0) {
        setErrorMessage('Please select at least one item or surface to clean.');
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (removalNeeds.length === 0) {
        setErrorMessage('Please select at least one condition that applies.');
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      if (timingPreference === 'specific_date' && !calendarDate) {
        setErrorMessage('Please select a preferred date on the calendar.');
        return false;
      }
      return true;
    }
    if (currentStep === 5) {
      if (!streetAddress.trim()) {
        setErrorMessage('Please provide your street address.');
        return false;
      }
      if (!city.trim()) {
        setErrorMessage('Please provide your city.');
        return false;
      }
      return true;
    }
    if (currentStep === 6) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please provide a valid email address.');
        return false;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
        setErrorMessage('Please provide a valid phone number.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (canContinue()) {
      setErrorMessage('');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Submit Quote Request
  const handleSubmit = async () => {
    setErrorMessage('');
    if (!firebaseUser) {
      setErrorMessage('Please sign in with Google below so your quote request is saved to your customer account.');
      return;
    }

    setIsSubmitting(true);

    const fullPropertyAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`.trim();
    const serviceId = activeCategoryConfig?.id || 'exterior-cleaning';

    try {
      const created = await submitQuoteRequest({
        customerId: firebaseUser.uid,
        customerName: fullName,
        email,
        phone,
        serviceId,
        serviceName: selectedMainCat,
        propertyAddress: fullPropertyAddress,
        streetAddress,
        city,
        state,
        zipCode,
        mainCategory: selectedMainCat,
        subcategories: selectedSubs,
        removalNeeds,
        otherRemovalDetails: otherRemovalText,
        timingPreference,
        preferredDate: timingPreference === 'specific_date' ? calendarDate : undefined,
        areaDescription: jobDescription,
        squareFootage: approxSqFt ? parseInt(approxSqFt, 10) : undefined,
        photos: uploadedPhotos
      });

      setIsSubmitting(false);
      if (created) {
        setSubmittedQuote(created);
      } else {
        setErrorMessage('Please sign in to submit and save your quote request.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('There was an issue saving your request. Please try again.');
    }
  };

  // Calendar Helpers for Question 4
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const currentDayDate = new Date(year, month, day);
      const isPast = currentDayDate < today;
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = calendarDate === dateString;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          onClick={() => setCalendarDate(dateString)}
          className={`h-8 w-8 mx-auto text-xs rounded-full font-medium transition-all flex items-center justify-center cursor-pointer ${
            isSelected
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : isPast
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-[#222222] hover:bg-[#E8EEF1]'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-[#F8F9F7] p-4 rounded-2xl border border-[#E8EEF1] mt-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-[#E8EEF1] text-[#555555] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#222222]">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-[#E8EEF1] text-[#555555] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#888888] mb-1">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {days}
        </div>

        {calendarDate && (
          <div className="mt-3 pt-2.5 border-t border-[#E8EEF1] text-center text-xs text-[#222222] font-medium">
            Requested Date: <span className="font-bold text-[#263F50]">{calendarDate}</span>
          </div>
        )}
      </div>
    );
  };

  // Progress percentage
  const progressPercent = currentStep <= totalQuestions ? (currentStep / totalQuestions) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white text-[#222222] rounded-3xl max-w-xl w-full shadow-2xl border border-[#E8EEF1] overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="px-6 py-4.5 bg-[#F8F9F7] border-b border-[#E8EEF1] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#222222]">Request a Free Quote</h3>
            {currentStep <= totalQuestions && !submittedQuote && (
              <p className="text-xs text-[#555555]">
                Step {currentStep} of {totalQuestions} · Free On-Site Assessment
              </p>
            )}
            {currentStep === 7 && !submittedQuote && (
              <p className="text-xs text-[#263F50] font-semibold">
                Review your quote request
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-[#E8EEF1] text-[#555555] hover:text-[#222222] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {!submittedQuote && (
          <div className="w-full bg-[#E8EEF1] h-1.5 overflow-hidden">
            <div
              className="bg-[#263F50] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {submittedQuote ? (
            /* Submission Success Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center shadow-xs border border-emerald-200">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-[#222222]">Quote Request Received!</h4>
                <p className="text-xs sm:text-sm text-[#555555] mt-1.5 max-w-md mx-auto">
                  Thank you, {submittedQuote.customerName}. We have received your request. The business owner will review your location and service requirements, arrange an on-site visit or review your photos, and provide a personalized quote.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#F8F9F7] p-5 rounded-2xl border border-[#E8EEF1] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                  <span className="text-[#777777]">Request Reference:</span>
                  <span className="font-mono font-bold text-[#222222]">#{submittedQuote.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                  <span className="text-[#777777]">Category:</span>
                  <span className="font-semibold text-[#222222]">{submittedQuote.mainCategory}</span>
                </div>
                <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                  <span className="text-[#777777]">Selected Items:</span>
                  <span className="font-semibold text-[#222222] text-right truncate max-w-[200px]">
                    {submittedQuote.subcategories?.join(', ') || 'General Request'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                  <span className="text-[#777777]">Timing Preference:</span>
                  <span className="font-semibold text-[#222222] capitalize">
                    {(submittedQuote.timingPreference || 'asap').replace('_', ' ')}
                    {submittedQuote.preferredDate ? ` (${submittedQuote.preferredDate})` : ''}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                  <span className="text-[#777777]">Property Address:</span>
                  <span className="font-semibold text-[#222222] text-right truncate max-w-[200px]">
                    {submittedQuote.propertyAddress}
                  </span>
                </div>
                {submittedQuote.photos && submittedQuote.photos.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Attached Photos:</span>
                    <span className="font-semibold text-[#263F50]">
                      {submittedQuote.photos.length} photograph{submittedQuote.photos.length > 1 ? 's' : ''} uploaded
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-rounded w-full sm:w-auto px-6 py-2.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    switchToDedicatedView('client');
                  }}
                  className="btn-rounded w-full sm:w-auto px-5 py-2.5 bg-[#E8EEF1] hover:bg-[#DCE5EA] text-[#263F50] text-xs font-semibold cursor-pointer"
                >
                  View in Client Portal
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* QUESTION 1: What service do you need? */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-[#222222]">
                      What service do you need?
                    </h4>
                    <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                      "Tell us about your pressure-washing project and provide your property location. We can arrange an on-site assessment or review photographs for a preliminary estimate when an in-person visit is not practical. Once we understand the work required, we'll provide a personalized quote."
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {MAIN_SERVICE_CATEGORIES.map((cat) => {
                      const isSelected = selectedMainCat === cat.name;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedMainCat(cat.name);
                            setSelectedSubs([]);
                          }}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#E8EEF1] border-[#263F50] text-[#222222] shadow-2xs'
                              : 'bg-[#F8F9F7] border-[#E8EEF1] hover:bg-white text-[#222222]'
                          }`}
                        >
                          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-gray-100">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-[#222222]">{cat.name}</div>
                          <p className="text-[11px] text-[#555555] mt-1 line-clamp-2">
                            {cat.shortDescription}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 2: What specifically needs cleaning? */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-[#222222]">
                        What specifically needs cleaning?
                      </h4>
                      <p className="text-xs text-[#555555] mt-0.5">
                        Category: <strong className="text-[#263F50]">{selectedMainCat}</strong> (Select all that apply)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {availableSubcategories.map((item) => {
                      const isSelected = selectedSubs.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleSubcategory(item)}
                          className={`text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#E8EEF1] border-[#263F50] text-[#222222] shadow-2xs'
                              : 'bg-[#F8F9F7] border-[#E8EEF1] text-[#222222] hover:bg-white'
                          }`}
                        >
                          <span>{item}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#263F50] border-[#263F50] text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION 3: What needs to be removed? */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-[#222222]">
                    What needs to be removed?
                  </h4>
                  <p className="text-xs text-[#555555]">
                    Select any surface stains or build-up that require attention:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {REMOVAL_NEEDS_OPTIONS.map((item) => {
                      const isSelected = removalNeeds.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleRemovalNeed(item)}
                          className={`text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#E8EEF1] border-[#263F50] text-[#222222] shadow-2xs'
                              : 'bg-[#F8F9F7] border-[#E8EEF1] text-[#222222] hover:bg-white'
                          }`}
                        >
                          <span>{item}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#263F50] border-[#263F50] text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional fields: approx sq ft & job description */}
                  <div className="pt-4 border-t border-[#E8EEF1] space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">
                        Approximate Square Footage <span className="text-[#888888] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 600 sq ft"
                        value={approxSqFt}
                        onChange={(e) => setApproxSqFt(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">
                        Job Description / Notes <span className="text-[#888888] font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any specifics, access notes, or questions..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>

                    {/* Project Photographs Upload (Story 7 requirement) */}
                    <div className="pt-2 border-t border-[#E8EEF1]">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-[#222222]">
                          Upload Project Photographs <span className="text-[#888888] font-normal">(Optional)</span>
                        </label>
                        <span className="text-[10px] text-[#263F50] font-semibold">Max 5 photos</span>
                      </div>
                      <p className="text-[11px] text-[#555555] mb-2.5 leading-relaxed">
                        If your property is far away or an in-person visit is not practical, you can upload project photographs. Estimates based on photographs are preliminary and subject to owner review.
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="btn-rounded px-3.5 py-1.5 bg-[#E8EEF1] hover:bg-[#DCE5EA] text-[#263F50] text-xs font-semibold border border-[#D5E0E6] cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Photographs</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadedPhotos.length > 0 && (
                          <span className="text-xs text-[#555555]">
                            {uploadedPhotos.length} photo{uploadedPhotos.length > 1 ? 's' : ''} attached
                          </span>
                        )}
                      </div>

                      {uploadedPhotos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {uploadedPhotos.map((photo, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#D5E0E6] shadow-2xs group">
                              <img src={photo} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 text-white flex items-center justify-center text-[10px] cursor-pointer hover:bg-black"
                                title="Remove photo"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QUESTION 4: When would you prefer the cleaning? */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-[#222222]">
                    When would you prefer the cleaning?
                  </h4>
                  <p className="text-xs text-[#555555]">
                    Select your scheduling preference:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {TIMING_OPTIONS.map((opt) => {
                      const isSelected = timingPreference === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTimingPreference(opt.id as any)}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#E8EEF1] border-[#263F50] text-[#222222] shadow-2xs font-semibold'
                              : 'bg-[#F8F9F7] border-[#E8EEF1] text-[#555555] hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#222222]">{opt.label}</div>
                          <div className="text-[10px] text-[#777777] mt-1">{opt.description}</div>
                        </button>
                      );
                    })}
                  </div>

                  {timingPreference === 'specific_date' && (
                    <div className="pt-2">
                      <div className="text-xs font-semibold text-[#222222] mb-1">
                        Select Preferred Date <span className="text-[#777777] font-normal">(Subject to availability)</span>:
                      </div>
                      {renderCalendar()}
                    </div>
                  )}
                </div>
              )}

              {/* QUESTION 5: Where do you need the cleaning? */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-[#222222]">
                    Where do you need the cleaning?
                  </h4>
                  <p className="text-xs text-[#555555]">
                    We dispatch trucks on-site throughout Greater Sacramento.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 1420 K Street"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#222222] mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#222222] mb-1">State</label>
                        <input
                          type="text"
                          readOnly
                          value={state}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#E8EEF1] border border-[#D5E0E6] text-xs text-[#555555]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">ZIP Code</label>
                      <input
                        type="text"
                        placeholder="e.g., 95814"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* QUESTION 6: Where should we send your quote? */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-[#222222]">
                    Where should we send your quote?
                  </h4>
                  <p className="text-xs text-[#555555]">
                    Provide your contact details so we can deliver your free quote:
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Alex Johnson"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g., alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#222222] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g., (916) 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Review & Final Confirmation */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-[#222222]">
                    Review Your Information
                  </h4>
                  <p className="text-xs text-[#555555]">
                    Please verify your details before submitting:
                  </p>

                  <div className="bg-[#F8F9F7] rounded-2xl p-4 border border-[#E8EEF1] space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                      <span className="text-[#777777]">Category:</span>
                      <span className="font-semibold text-[#222222]">{selectedMainCat}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                      <span className="text-[#777777]">Selected Items:</span>
                      <span className="font-semibold text-[#222222] text-right truncate max-w-[200px]">
                        {selectedSubs.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                      <span className="text-[#777777]">Removals:</span>
                      <span className="font-semibold text-[#222222] text-right truncate max-w-[200px]">
                        {removalNeeds.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                      <span className="text-[#777777]">Property:</span>
                      <span className="font-semibold text-[#222222] text-right truncate max-w-[200px]">
                        {streetAddress}, {city}, {state} {zipCode}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                      <span className="text-[#777777]">Contact:</span>
                      <span className="font-semibold text-[#222222]">{fullName} · {phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E8EEF1] pb-1.5">
                      <span className="text-[#777777]">Timing:</span>
                      <span className="font-semibold text-[#222222] capitalize">
                        {timingPreference.replace('_', ' ')}
                        {calendarDate ? ` (${calendarDate})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Project Photos:</span>
                      <span className="font-semibold text-[#263F50]">
                        {uploadedPhotos.length > 0 ? `${uploadedPhotos.length} photo(s) attached` : 'None attached (On-site assessment)'}
                      </span>
                    </div>
                  </div>

                  {/* Free Quote Policy & Pricing Disclaimer */}
                  <div className="p-3 bg-white rounded-xl border border-[#E8EEF1] text-[11px] text-[#555555] space-y-1">
                    <div className="font-bold text-[#263F50]">Free, No-Obligation Quotes</div>
                    <p className="leading-relaxed">
                      "We offer free quotes for all pressure-washing projects, including on-site assessments. Services start at $250. Pricing varies depending on the type of service and the specific needs of your property. All quotes are all-inclusive, covering fuel, travel expenses, and applicable taxes. Estimates based on photographs are preliminary and subject to owner review."
                    </p>
                  </div>

                  {!firebaseUser && (
                    <div className="p-3.5 rounded-2xl bg-[#E8EEF1] border border-[#D5E0E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#222222]">
                        <span className="font-bold">Sign in to save your quote:</span> Sign in with Google so your quote request is saved to your customer account.
                      </div>
                      <button
                        type="button"
                        onClick={() => void signInWithGoogle('customer')}
                        className="btn-rounded px-4 py-2 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In with Google</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Controls / Footer */}
        {!submittedQuote && (
          <div className="px-6 py-4 bg-[#F8F9F7] border-t border-[#E8EEF1] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn-rounded px-4 py-2 text-xs font-semibold text-[#555555] hover:text-[#222222] bg-white border border-[#E8EEF1] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-rounded px-6 py-2.5 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="btn-rounded px-6 py-2.5 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Quote Request'}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
