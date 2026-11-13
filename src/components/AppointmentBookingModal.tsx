import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, User, LogIn } from 'lucide-react';
import { Appointment } from '../types';

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:30 AM - 12:30 PM',
  '01:00 PM - 03:00 PM',
  '03:30 PM - 05:30 PM',
  '06:00 PM - 08:00 PM'
];

export const AppointmentBookingModal: React.FC = () => {
  const {
    firebaseUser,
    signInWithGoogle,
    bookingModalOpen,
    setBookingModalOpen,
    services,
    preselectedServiceForBooking,
    setPreselectedServiceForBooking,
    currentUser,
    bookAppointment,
    isSlotAvailable,
    blockedSlots,
    appointments,
    setActiveView
  } = useApp();

  const [serviceId, setServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [serviceAddress, setServiceAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (bookingModalOpen) {
      if (preselectedServiceForBooking) {
        setServiceId(preselectedServiceForBooking);
      } else if (services.length > 0 && !serviceId) {
        setServiceId(services[0].id);
      }

      if (currentUser) {
        setCustomerName(currentUser.name || '');
        setCustomerEmail(currentUser.email || '');
        setCustomerPhone(currentUser.phone || '');
        setServiceAddress(currentUser.address || '');
      }
      setBookingError(null);
      setConfirmedAppointment(null);
      setIsSubmitting(false);
    }
  }, [bookingModalOpen, preselectedServiceForBooking, currentUser, services]);

  // Keep selectedTime valid whenever selectedDate, blockedSlots, or appointments change
  useEffect(() => {
    if (!bookingModalOpen) return;
    if (selectedTime && isSlotAvailable(selectedDate, selectedTime).available) {
      return;
    }
    const firstAvailable = TIME_SLOTS.find((slot) => isSlotAvailable(selectedDate, slot).available);
    setSelectedTime(firstAvailable || '');
  }, [bookingModalOpen, selectedDate, blockedSlots, appointments]);

  if (!bookingModalOpen) return null;

  const handleClose = () => {
    setBookingModalOpen(false);
    setPreselectedServiceForBooking(null);
    setConfirmedAppointment(null);
    setBookingError(null);
  };

  // Generate next 14 days for date selection
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    const dateString = d.toISOString().split('T')[0];
    const allDayBlock = blockedSlots.find((b) => b.date === dateString && b.timeSlot === 'All Day');
    const allSlotsUnavailable = TIME_SLOTS.every((slot) => !isSlotAvailable(dateString, slot).available);
    const isBlocked = Boolean(allDayBlock || allSlotsUnavailable);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateString, dayName, monthDay, isBlocked, reason: allDayBlock?.reason };
  });

  const selectedDateAllDayBlock = blockedSlots.find(
    (b) => b.date === selectedDate && b.timeSlot === 'All Day'
  );

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!firebaseUser) {
      setBookingError('Please sign in with Google above to confirm and save your appointment.');
      return;
    }

    if (!selectedTime) {
      setBookingError('No available arrival windows on the selected date. Please pick another date.');
      return;
    }

    const slotCheck = isSlotAvailable(selectedDate, selectedTime);
    if (!slotCheck.available) {
      setBookingError(slotCheck.conflictReason || 'This slot is unavailable. Please select another time or date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bookAppointment({
        serviceId,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        serviceAddress,
        customerName,
        customerEmail,
        customerPhone,
        notes
      });

      if (result.success && result.appointment) {
        setConfirmedAppointment(result.appointment);
      } else {
        setBookingError(result.error || 'This slot could not be booked. Please select another time or date.');
      }
    } catch {
      setBookingError('Unable to complete booking right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white text-[#222222] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8EEF1] overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#F8F9F7] border-b border-[#E8EEF1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#222222]">Book Online Appointment</h3>
              <p className="text-xs text-[#555555]">Open 8:00 AM – 8:00 PM All 7 Days · Sacramento, California</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[#E8EEF1] transition-colors text-[#555555] hover:text-[#222222] cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {confirmedAppointment ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center shadow-xs border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#222222]">Appointment Confirmed!</h4>
                <p className="text-sm text-[#555555] mt-1">
                  We look forward to serving you, <span className="font-bold text-[#222222]">{confirmedAppointment.customerName}</span>.
                </p>
              </div>

              {/* Reference Details Box */}
              <div className="bg-[#F8F9F7] rounded-2xl p-5 border border-[#E8EEF1] text-left space-y-2.5 text-xs text-[#555555]">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8EEF1]">
                  <span className="font-semibold text-[#777777]">Confirmation Number:</span>
                  <span className="font-mono font-bold text-[#263F50] bg-[#E8EEF1] px-2.5 py-0.5 rounded-full">
                    {confirmedAppointment.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Service:</span>
                  <span className="font-semibold text-[#222222]">{confirmedAppointment.serviceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Scheduled Window:</span>
                  <span className="font-semibold text-[#222222]">{confirmedAppointment.scheduledDate} ({confirmedAppointment.scheduledTime})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Service Address:</span>
                  <span className="font-semibold text-[#222222]">{confirmedAppointment.serviceAddress}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#E8EEF1]">
                  <span className="font-bold text-[#222222]">On-Site Assessment Fee:</span>
                  <span className="font-bold text-[#263F50] bg-[#E8EEF1] px-2 py-0.5 rounded-md">
                    $0 (100% Free, No-Obligation)
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    handleClose();
                    setActiveView('customer_portal');
                  }}
                  className="w-full btn-rounded py-3 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>View in Customer Portal</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-5">
              {bookingError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Slot Unavailable</div>
                    <div>{bookingError}</div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1.5">
                  1. Select Exterior Cleaning Service *
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8EEF1] focus:outline-none focus:border-[#263F50] text-xs font-semibold bg-[#F8F9F7] text-[#222222]"
                  required
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.basePrice}) · {s.durationMinutes} mins
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Appointment Dates */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider">
                    2. Choose Service Date *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#777777]">Or pick date:</span>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setBookingError(null);
                      }}
                      aria-label="Choose custom service date"
                      className="px-2.5 py-1 rounded-xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs font-semibold text-[#222222] focus:outline-none focus:border-[#263F50]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {upcomingDates.map((item) => {
                    const isSelected = selectedDate === item.dateString;
                    return (
                      <button
                        key={item.dateString}
                        type="button"
                        disabled={item.isBlocked}
                        title={item.isBlocked ? item.reason || 'Date unavailable' : item.dateString}
                        onClick={() => {
                          setSelectedDate(item.dateString);
                          setBookingError(null);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          item.isBlocked
                            ? 'opacity-45 bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 line-through'
                            : isSelected
                            ? 'bg-[#263F50] text-white border-[#263F50] font-bold shadow-xs cursor-pointer'
                            : 'bg-[#F8F9F7] hover:bg-white text-[#222222] border-[#E8EEF1] cursor-pointer'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold">{item.dayName}</div>
                        <div className="text-xs font-semibold mt-0.5">{item.monthDay}</div>
                        {item.isBlocked && (
                          <div className="text-[9px] font-bold text-rose-500 no-underline mt-0.5">Blocked</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDateAllDayBlock && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>{selectedDate}</strong> is unavailable: {selectedDateAllDayBlock.reason}
                    </span>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
                  3. Select Arrival Window *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const slotCheck = isSlotAvailable(selectedDate, slot);
                    const available = slotCheck.available;
                    const isSelected = available && selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!available}
                        title={!available ? slotCheck.conflictReason || 'Unavailable' : slot}
                        onClick={() => {
                          setSelectedTime(slot);
                          setBookingError(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                          !available
                            ? 'opacity-45 bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                            : isSelected
                            ? 'bg-[#E8EEF1] border-[#263F50] text-[#222222] shadow-2xs cursor-pointer'
                            : 'bg-[#F8F9F7] hover:bg-white text-[#555555] border-[#E8EEF1] cursor-pointer'
                        }`}
                      >
                        <span className={`flex items-center gap-1.5 ${!available ? 'line-through' : ''}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot}</span>
                        </span>
                        {!available ? (
                          <span className="text-[10px] font-bold text-rose-500">Blocked</span>
                        ) : (
                          isSelected && <span className="w-2 h-2 rounded-full bg-[#263F50]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="pt-2 border-t border-[#E8EEF1] space-y-3">
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider">
                  4. Your Contact &amp; Property Information
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#555555] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g., Alex Johnson"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#555555] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g., alex@example.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#555555] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g., (916) 555-0199"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#555555] mb-1">Service Street Address *</label>
                  <input
                    type="text"
                    required
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    placeholder="e.g., 2450 J Street, Sacramento, CA 95816"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#555555] mb-1">Special Access Notes / Gate Code (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Side gate unlocked, water spigot located near driveway..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                  />
                </div>
              </div>

              {!firebaseUser && (
                <div className="p-3.5 rounded-2xl bg-[#E8EEF1] border border-[#D5E0E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#222222]">
                    <span className="font-bold">Sign in to confirm &amp; save booking:</span> Connect your Google account so this appointment saves to your Customer Portal.
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

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-rounded px-4 py-2.5 text-xs font-semibold text-[#555555] hover:text-[#222222] bg-white border border-[#E8EEF1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-rounded px-6 py-2.5 text-xs font-semibold text-white bg-[#263F50] hover:bg-[#1A2E3D] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
