import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Calendar,
  History,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
  Edit3,
  Save,
  AlertTriangle,
  MessageSquare,
  Download,
  Copy,
  Check,
  DollarSign,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../types';
import { TIME_SLOTS } from '../data/initialData';
import { AuthCard, EmailVerificationBanner } from './AuthCard';

export const CustomerPortal: React.FC = () => {
  const {
    firebaseUser,
    authReady,
    isEmailVerified,
    customerProfileExists,
    profileLoading,
    firestoreError,
    clearFirestoreError,
    signOutUser,
    setActiveView,
    currentUser,
    updateCustomerProfile,
    appointments,
    quotes,
    modifyAppointment,
    cancelAppointment,
    setBookingModalOpen,
    setQuoteModalOpen,
    dialogueMessages,
    sendDialogueMessage,
    downloadDialogueTranscript,
    copyDialogueTranscript,
    isSlotAvailable,
    todayLA
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'upcoming' | 'history' | 'quotes' | 'dialogue'>('upcoming');
  const [dialogueInput, setDialogueInput] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Profile form state
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser.address || '');
  const [profileNotes, setProfileNotes] = useState(currentUser.notes || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Reschedule / Modify appointment state
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM - 10:00 AM');
  const [modifyError, setModifyError] = useState<string | null>(null);

  // Cancel appointment state
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Sync profile fields whenever Firestore user profile or auth state updates
  useEffect(() => {
    setProfileName(currentUser.name || firebaseUser?.displayName || '');
    setProfileEmail(currentUser.email || firebaseUser?.email || '');
    setProfilePhone(currentUser.phone || '');
    setProfileAddress(currentUser.address || '');
    setProfileNotes(currentUser.notes || '');
    if (!profileLoading && firebaseUser && !customerProfileExists) {
      setIsEditingProfile(true);
    }
  }, [currentUser, firebaseUser, profileLoading, customerProfileExists]);

  if (!authReady) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center text-xs text-[#555555]">
        Checking authentication status...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <AuthCard
        portalType="customer"
        badgeText="Customer Portal · Sacramento Core"
        title="Sign In or Create Account"
        description="Access your quotes, scheduled pressure-washing appointments, service history, and dispatch messages."
        googleButtonLabel="Continue with Google"
        onBackHome={() => setActiveView('home')}
      />
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      const res = await updateCustomerProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        address: profileAddress,
        notes: profileNotes
      });
      if (res.success) {
        setIsEditingProfile(false);
      } else {
        setProfileError(res.error || 'Could not save customer profile.');
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save customer profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const myAppointments = appointments.filter(
    (a) =>
      a.customerId === firebaseUser.uid ||
      (Boolean(firebaseUser.email) && a.customerEmail.toLowerCase() === firebaseUser.email!.toLowerCase())
  );

  const upcomingAppointments = myAppointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'en_route' || a.status === 'in_progress'
  );

  const historyAppointments = myAppointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  const myQuotes = quotes.filter(
    (q) =>
      q.customerId === firebaseUser.uid ||
      (Boolean(firebaseUser.email) && q.email.toLowerCase() === firebaseUser.email!.toLowerCase())
  );

  const handleStartReschedule = (appt: Appointment) => {
    setReschedulingAppt(appt);
    setNewDate(appt.scheduledDate);
    setNewTime(appt.scheduledTime);
    setModifyError(null);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt) return;

    const res = await modifyAppointment(reschedulingAppt.id, newDate, newTime);
    if (res.success) {
      setReschedulingAppt(null);
    } else {
      setModifyError(res.error || 'Failed to modify appointment');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppt) return;
    await cancelAppointment(cancellingAppt.id, cancelReason || 'Cancelled by customer');
    setCancellingAppt(null);
    setCancelReason('');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#222222]">
      {/* Top Header & Signed-in Account Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E8EEF1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8EEF1] text-[#263F50] border border-[#D5E0E6]">
              Customer Portal · Sacramento Core
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1.5">
            Welcome, {currentUser.name || firebaseUser.displayName || 'Valued Customer'}
          </h1>
          <p className="text-sm text-[#555555]">
            Manage your exterior cleaning appointments, quote estimates, and service history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8EEF1] text-xs font-semibold text-[#555555] shadow-xs">
            Signed in as <strong className="text-[#263F50]">{firebaseUser.email}</strong>
          </div>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="btn-rounded px-3.5 py-1.5 bg-white hover:bg-rose-50 text-[#555555] hover:text-rose-700 border border-[#E8EEF1] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <EmailVerificationBanner />

      {firestoreError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{firestoreError}</span>
          </div>
          <button
            type="button"
            onClick={clearFirestoreError}
            className="text-[11px] font-bold text-rose-700 hover:underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!profileLoading && !customerProfileExists && isEmailVerified && (
        <div className="mt-4 p-4 rounded-2xl bg-[#E8EEF1] border border-[#D5E0E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#263F50]">
          <div>
            <strong>Complete Your Customer Profile:</strong> Save your phone number and Sacramento property address once so future quote requests and bookings auto-fill.
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditingProfile(true);
              setActiveTab('profile');
            }}
            className="btn-rounded px-4 py-1.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-semibold text-[11px] shrink-0 cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 py-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-[#263F50] text-white shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Active Bookings ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#263F50] text-white shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Service History ({historyAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'quotes'
              ? 'bg-[#263F50] text-white shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Quotes ({myQuotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dialogue')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dialogue'
              ? 'bg-[#263F50] text-white shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Dialogue &amp; Transcript</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[#263F50] text-white shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile &amp; Preferences</span>
        </button>
      </div>

      {/* Tab 1: Active Upcoming Bookings (Feature 4: Stories 28 & 29) */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#222222]">Scheduled Appointments</h2>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="btn-rounded px-4 py-2 text-xs font-semibold bg-[#263F50] text-white hover:bg-[#1A2E3D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book New Service</span>
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-sky-100 text-center space-y-3">
              <Calendar className="w-10 h-10 text-sky-400 mx-auto" />
              <h3 className="font-bold text-slate-800">No active appointments scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready to clean your driveway, patio, or home siding? Schedule an appointment in minutes.
              </p>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn-rounded px-5 py-2.5 bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600"
              >
                Book Appointment Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                        {appt.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{appt.serviceName}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 capitalize">
                      {appt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {appt.scheduledDate} · {appt.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{appt.serviceAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>Technician: {appt.technicianName}</span>
                    </div>
                    {appt.notes && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-sky-100">
                        Notes: {appt.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions: Modify & Cancel (Stories 28 & 29) */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleStartReschedule(appt)}
                      className="btn-rounded flex-1 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors text-center cursor-pointer"
                    >
                      Reschedule Date / Time
                    </button>
                    <button
                      onClick={() => setCancellingAppt(appt)}
                      className="btn-rounded py-2 px-3.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Service History (Stories 36 & 37) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service History & Past Invoices</h2>
              <p className="text-xs text-slate-500">Record of completed jobs and historical wash notes</p>
            </div>
          </div>

          {historyAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-sky-100 text-center space-y-3">
              <History className="w-10 h-10 text-sky-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No past services on record yet</h3>
              <p className="text-xs text-slate-500">Once your scheduled jobs are finished, detailed completion logs will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        appt.status === 'completed' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {appt.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">{appt.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            appt.status === 'completed' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{appt.serviceName}</h3>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-base font-extrabold text-slate-900">${appt.price}</div>
                      <span className="text-[11px] font-semibold text-sky-700 capitalize">
                        Payment: {appt.paymentStatus} {appt.paymentMethod ? `(${appt.paymentMethod})` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Service details (Story 37) */}
                  <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100/60 text-xs text-slate-700 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Completed On:</span>
                        <span className="font-semibold">{appt.completedAt || appt.scheduledDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Field Technician:</span>
                        <span className="font-semibold">{appt.technicianName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Service Location:</span>
                        <span className="font-semibold truncate block">{appt.serviceAddress}</span>
                      </div>
                    </div>

                    {appt.technicianNotes && (
                      <div className="pt-2 border-t border-sky-100">
                        <span className="font-bold text-slate-800">Technician Job Notes:</span>
                        <p className="italic text-slate-600 mt-0.5">{appt.technicianNotes}</p>
                      </div>
                    )}

                    {appt.cancellationReason && (
                      <div className="pt-2 border-t border-rose-100 text-rose-700">
                        <span className="font-bold">Cancellation Reason:</span> {appt.cancellationReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Quote Requests */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Quote Requests</h2>
            <button
              onClick={() => setQuoteModalOpen(true)}
              className="btn-rounded px-4 py-2 text-xs font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit Another Quote</span>
            </button>
          </div>

          {myQuotes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-sky-100 text-center space-y-3">
              <FileText className="w-10 h-10 text-sky-400 mx-auto" />
              <h3 className="font-bold text-slate-800">No quote requests found</h3>
              <p className="text-xs text-slate-500">Need an estimate? Submit project photos and details online.</p>
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="btn-rounded px-5 py-2.5 bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-600 cursor-pointer"
              >
                Get a quote access
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myQuotes.map((q) => (
                <div key={q.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        {q.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{q.serviceName}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      q.status === 'quoted'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : q.status === 'reviewed'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{q.areaDescription}</p>

                  <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submitted:</span>
                      <span className="font-semibold text-slate-700">{q.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">{q.propertyAddress}</span>
                    </div>
                    {typeof q.estimatedPrice === 'number' ? (
                      <div className="flex justify-between pt-1 border-t border-sky-100 font-bold text-sky-800">
                        <span>Estimate Amount:</span>
                        <span>${q.estimatedPrice}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between pt-1 border-t border-sky-100 text-slate-500 italic">
                        <span>Estimate Amount:</span>
                        <span>Pending Owner Review</span>
                      </div>
                    )}
                    {q.adminNotes && (
                      <div className="pt-1 text-[11px] text-slate-500">
                        Note: {q.adminNotes}
                      </div>
                    )}
                  </div>

                  {q.photos && q.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Uploaded Photos ({q.photos.length}):</span>
                      <div className="flex flex-wrap gap-2">
                        {q.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Quote attachment ${idx + 1}`}
                            className="w-14 h-14 rounded-xl object-cover border border-sky-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Dialogue & Persistent Transcript */}
      {activeTab === 'dialogue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Dialogue Record</h2>
              <p className="text-xs text-slate-500">
                Persistent log of quotes, schedule confirmations, and customer-dispatch messages. Never lost.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const ok = await copyDialogueTranscript(firebaseUser.uid);
                  if (ok) {
                    setCopiedTranscript(true);
                    setTimeout(() => setCopiedTranscript(false), 2000);
                  }
                }}
                className="btn-rounded px-3.5 py-2 text-xs font-bold bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-cyan-600" />}
                <span>{copiedTranscript ? 'Copied!' : 'Copy Transcript'}</span>
              </button>

              <button
                onClick={() => downloadDialogueTranscript(firebaseUser.uid)}
                className="btn-rounded px-3.5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Transcript (.txt)</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl">
              {dialogueMessages
                .filter((m) => m.threadId === firebaseUser.uid)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      msg.senderRole === 'client'
                        ? 'bg-cyan-50 border border-cyan-200 text-slate-800 ml-6'
                        : 'bg-white border border-slate-200 text-slate-800 mr-6 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>{msg.senderName}</span>
                      <span className="font-normal text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                    {typeof msg.directPrice === 'number' && (
                      <div className="pt-1 mt-1 border-t border-cyan-100 font-extrabold text-cyan-700 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Locked Direct Price: ${msg.directPrice} ($0 Sacramento Core Visit Fee)</span>
                      </div>
                    )}
                  </div>
                ))}

              {dialogueMessages.filter((m) => m.threadId === firebaseUser.uid).length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No dialogue messages found for {currentUser.name || firebaseUser.email}. Start a conversation with dispatch below.
                </div>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!dialogueInput.trim()) return;
                const displayName = currentUser.name || firebaseUser.displayName || 'Customer';
                await sendDialogueMessage(
                  firebaseUser.uid,
                  displayName,
                  'client',
                  `${displayName} (Client)`,
                  dialogueInput.trim()
                );
                setDialogueInput('');
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={dialogueInput}
                onChange={(e) => setDialogueInput(e.target.value)}
                placeholder="Ask dispatch a question or request a direct price review..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-cyan-200 text-xs focus:ring-2 focus:ring-cyan-400"
                required
              />
              <button
                type="submit"
                className="btn-rounded px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Edit Customer Profile & Preferences */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EEF1] shadow-sm max-w-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-[#E8EEF1]">
            <div>
              <h2 className="text-lg font-bold text-[#222222]">
                Customer Profile &amp; Contact Information
              </h2>
              <p className="text-xs text-[#555555]">
                Keep your contact details and property preferences saved for automatic reuse in quotes and bookings.
              </p>
            </div>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => {
                  setProfileError(null);
                  setIsEditingProfile(true);
                }}
                className="btn-rounded px-4 py-2 text-xs font-semibold text-[#263F50] bg-[#E8EEF1] hover:bg-[#DCE5EA] border border-[#D5E0E6] flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#263F50]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {profileError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-6">
            <div>
              <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                disabled={!isEditingProfile}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-colors ${
                  isEditingProfile
                    ? 'border-[#D5E0E6] bg-white focus:outline-none focus:border-[#263F50]'
                    : 'border-[#E8EEF1] bg-[#F8F9F7] text-[#555555]'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  disabled={!isEditingProfile}
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-colors ${
                    isEditingProfile
                      ? 'border-[#D5E0E6] bg-white focus:outline-none focus:border-[#263F50]'
                      : 'border-[#E8EEF1] bg-[#F8F9F7] text-[#555555]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  disabled={!isEditingProfile}
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. (916) 555-0199"
                  className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-colors ${
                    isEditingProfile
                      ? 'border-[#D5E0E6] bg-white focus:outline-none focus:border-[#263F50]'
                      : 'border-[#E8EEF1] bg-[#F8F9F7] text-[#555555]'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                Default Service Address <span className="font-normal text-[#777777] lowercase">(optional)</span>
              </label>
              <input
                type="text"
                disabled={!isEditingProfile}
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="e.g. 2450 J Street, Sacramento, CA 95816"
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-colors ${
                  isEditingProfile
                    ? 'border-[#D5E0E6] bg-white focus:outline-none focus:border-[#263F50]'
                    : 'border-[#E8EEF1] bg-[#F8F9F7] text-[#555555]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                Property / Access Notes <span className="font-normal text-[#777777] lowercase">(optional)</span>
              </label>
              <textarea
                rows={2}
                disabled={!isEditingProfile}
                value={profileNotes}
                onChange={(e) => setProfileNotes(e.target.value)}
                placeholder="e.g. Side gate code, pets inside, hose spigot location."
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm transition-colors ${
                  isEditingProfile
                    ? 'border-[#D5E0E6] bg-white focus:outline-none focus:border-[#263F50]'
                    : 'border-[#E8EEF1] bg-[#F8F9F7] text-[#555555]'
                }`}
              />
            </div>

            {isEditingProfile && (
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-rounded px-6 py-2.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileError(null);
                  }}
                  className="btn-rounded px-4 py-2.5 bg-[#F8F9F7] hover:bg-[#E8EEF1] text-[#555555] font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Reschedule Modal (Story 28) */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Modify Appointment Schedule</h3>
            <p className="text-xs text-slate-500">
              Rescheduling {reschedulingAppt.serviceName} ({reschedulingAppt.id})
            </p>

            {modifyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
                {modifyError}
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  min={todayLA}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time Window</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                >
                  {TIME_SLOTS.map((slot) => {
                    const check = isSlotAvailable(newDate, slot, reschedulingAppt.id);
                    return (
                      <option key={slot} value={slot} disabled={!check.available}>
                        {slot} {!check.available ? '(Unavailable / Blocked)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Confirm Change
                </button>
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal (Story 29) */}
      {cancellingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel {cancellingAppt.serviceName} on {cancellingAppt.scheduledDate}?
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
              <input
                type="text"
                placeholder="e.g. Schedule conflict, weather concern, postponed"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="btn-rounded flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
              >
                Yes, Cancel Appointment
              </button>
              <button
                type="button"
                onClick={() => setCancellingAppt(null)}
                className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
