import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Lock,
  Plus,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Ban,
  ArrowRight,
  Check,
  CreditCard,
  KeyRound,
  MessageSquare,
  Download,
  Copy,
  Bell,
  Mail,
  Search,
  History,
  X,
  LogOut,
  ShieldAlert,
  AlertCircle,
  UserPlus,
  Building2
} from 'lucide-react';
import { Appointment, QuoteRequest, UserProfile } from '../types';
import { TIME_SLOTS } from '../data/initialData';
import { AuthCard, EmailVerificationBanner } from './AuthCard';

export const AdminDashboard: React.FC = () => {
  const {
    firebaseUser,
    authReady,
    isEmailVerified,
    isAdminAuthorized,
    firestoreError,
    clearFirestoreError,
    signOutUser,
    setActiveView,
    staffAccounts,
    grantStaffAccess,
    revokeStaffAccess,
    businessInfo,
    updateBusinessInfo,
    todayLA,
    tomorrowLA,
    quotes,
    updateQuoteStatus,
    convertQuoteToAppointment,
    appointments,
    addManualAppointment,
    modifyAppointment,
    cancelAppointment,
    markAppointmentCompleted,
    blockedSlots,
    blockSlot,
    unblockSlot,
    customers,
    updateCustomerRecordByAdmin,
    payments,
    recordPayment,
    updatePaymentStatus,
    technicians,
    services,
    dialogueMessages,
    sendDialogueMessage,
    downloadDialogueTranscript,
    copyDialogueTranscript,
    visitFeePolicy,
    adminNotifications,
    markNotificationRead,
    clearNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'quotes' | 'schedule' | 'customers' | 'payments' | 'security' | 'dialogue' | 'notifications'>('notifications');
  const [staffUidInput, setStaffUidInput] = useState('');
  const [staffNameInput, setStaffNameInput] = useState('');
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffPhoneInput, setStaffPhoneInput] = useState('');
  const [staffVehicleInput, setStaffVehicleInput] = useState('Sacramento Mobile Service Rig');
  const [staffError, setStaffError] = useState<string | null>(null);
  const [savingStaff, setSavingStaff] = useState(false);

  // Editable Business Info state
  const [bizCompanyName, setBizCompanyName] = useState(businessInfo.companyName);
  const [bizPhone, setBizPhone] = useState(businessInfo.phone);
  const [bizEmail, setBizEmail] = useState(businessInfo.email);
  const [bizAddress, setBizAddress] = useState(businessInfo.address);
  const [bizDaysOpen, setBizDaysOpen] = useState(businessInfo.daysOpen);
  const [bizDailyHours, setBizDailyHours] = useState(businessInfo.dailyHours);
  const [bizHoursSummary, setBizHoursSummary] = useState(businessInfo.hoursSummary);
  const [bizHoursNote, setBizHoursNote] = useState(businessInfo.hoursNote);
  const [bizCrewCapacity, setBizCrewCapacity] = useState(businessInfo.crewCapacity);
  const [bizError, setBizError] = useState<string | null>(null);
  const [savingBiz, setSavingBiz] = useState(false);

  const [selectedDialogueThread, setSelectedDialogueThread] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminPriceQuote, setAdminPriceQuote] = useState<string>('');
  const [copiedAdminTranscript, setCopiedAdminTranscript] = useState(false);

  // Quotes filter
  const [quoteFilter, setQuoteFilter] = useState<'all' | 'new' | 'reviewed' | 'quoted' | 'accepted'>('all');
  const [editingQuote, setEditingQuote] = useState<QuoteRequest | null>(null);
  const [quotePriceEstimate, setQuotePriceEstimate] = useState<number>(250);
  const [quoteAdminNote, setQuoteAdminNote] = useState('');
  const [convertingQuote, setConvertingQuote] = useState<QuoteRequest | null>(null);
  const [convertDate, setConvertDate] = useState(tomorrowLA);
  const [convertTime, setConvertTime] = useState(TIME_SLOTS[0]);
  const [convertTech, setConvertTech] = useState(technicians[0]?.id || '');

  // Schedule modal states
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [manualCustName, setManualCustName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || 'house-wash');
  const [manualDate, setManualDate] = useState(tomorrowLA);
  const [manualTime, setManualTime] = useState(TIME_SLOTS[0]);
  const [manualTechId, setManualTechId] = useState(technicians[0]?.id || '');
  const [manualNotes, setManualNotes] = useState('');
  const [manualPrice, setManualPrice] = useState(250);
  const [manualError, setManualError] = useState<string | null>(null);

  // Block slot form state
  const [blockDate, setBlockDate] = useState(todayLA);
  const [blockTimeSlot, setBlockTimeSlot] = useState('All Day');
  const [blockReason, setBlockReason] = useState('');
  const [blockError, setBlockError] = useState<string | null>(null);

  // Modify appointment state
  const [modifyingAppt, setModifyingAppt] = useState<Appointment | null>(null);
  const [modDate, setModDate] = useState('');
  const [modTime, setModTime] = useState('');
  const [modTechId, setModTechId] = useState('');
  const [modError, setModError] = useState<string | null>(null);

  // Customer CRM search, edit, and service history modal
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [viewingHistoryCustomer, setViewingHistoryCustomer] = useState<UserProfile | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<UserProfile | null>(null);
  const [custEditName, setCustEditName] = useState('');
  const [custEditEmail, setCustEditEmail] = useState('');
  const [custEditPhone, setCustEditPhone] = useState('');
  const [custEditAddress, setCustEditAddress] = useState('');
  const [custEditNotes, setCustEditNotes] = useState('');
  const [custEditError, setCustEditError] = useState<string | null>(null);

  // Payment record modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payApptId, setPayApptId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(250);
  const [payMethod, setPayMethod] = useState<'Credit Card' | 'Check' | 'Cash' | 'Bank Transfer' | 'Online'>('Credit Card');
  const [payNotes, setPayNotes] = useState('');

  // Keep technician selectors aligned with loaded Firestore /staff
  useEffect(() => {
    if (technicians.length === 0) {
      setConvertTech('');
      setManualTechId('');
      return;
    }
    if (!convertTech || !technicians.some((t) => t.id === convertTech)) {
      setConvertTech(technicians[0].id);
    }
    if (!manualTechId || !technicians.some((t) => t.id === manualTechId)) {
      setManualTechId(technicians[0].id);
    }
  }, [technicians, convertTech, manualTechId]);

  // Sync editable business info form when Firestore config updates
  useEffect(() => {
    setBizCompanyName(businessInfo.companyName);
    setBizPhone(businessInfo.phone);
    setBizEmail(businessInfo.email);
    setBizAddress(businessInfo.address);
    setBizDaysOpen(businessInfo.daysOpen);
    setBizDailyHours(businessInfo.dailyHours);
    setBizHoursSummary(businessInfo.hoursSummary);
    setBizHoursNote(businessInfo.hoursNote);
    setBizCrewCapacity(businessInfo.crewCapacity);
  }, [businessInfo]);

  // Keep selected dialogue thread synced with loaded Firestore customers or message threads
  useEffect(() => {
    const validIds = new Set<string>([
      ...customers.map((c) => c.id),
      ...dialogueMessages.map((m) => m.threadId)
    ]);
    if (!selectedDialogueThread || !validIds.has(selectedDialogueThread)) {
      setSelectedDialogueThread(customers[0]?.id || dialogueMessages[0]?.threadId || '');
    }
  }, [customers, dialogueMessages, selectedDialogueThread]);

  // Metrics
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  // Filtered quotes
  const filteredQuotes = quotes.filter((q) => {
    if (quoteFilter === 'all') return true;
    return q.status === quoteFilter;
  });

  const handleOpenEditQuote = (quote: QuoteRequest) => {
    setEditingQuote(quote);
    setQuotePriceEstimate(quote.estimatedPrice ?? 250);
    setQuoteAdminNote(quote.adminNotes || '');
  };

  const handleSaveQuoteStatus = async (status: QuoteRequest['status']) => {
    if (!editingQuote) return;
    await updateQuoteStatus(editingQuote.id, status, quotePriceEstimate, quoteAdminNote);
    setEditingQuote(null);
  };

  const handleConvertQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingQuote) return;
    const created = await convertQuoteToAppointment(convertingQuote.id, convertDate, convertTime, convertTech);
    if (created) {
      setConvertingQuote(null);
    }
  };

  const handleCreateManualAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    const srv = services.find((s) => s.id === manualServiceId);
    const tech = technicians.find((t) => t.id === manualTechId) || technicians[0];
    if (!tech) {
      setManualError('No authorized field technician available. Add a technician under Security & Settings first.');
      return;
    }

    const result = await addManualAppointment({
      customerId: `cust-manual-${Date.now()}`,
      customerName: manualCustName,
      customerEmail: manualEmail || 'phone.customer@example.com',
      customerPhone: manualPhone,
      serviceId: manualServiceId,
      serviceName: srv ? srv.name : 'Custom Pressure Washing',
      serviceAddress: manualAddress,
      scheduledDate: manualDate,
      scheduledTime: manualTime,
      technicianId: tech.id,
      technicianName: tech.name,
      technicianEmail: tech.email || undefined,
      notes: manualNotes,
      price: manualPrice
    });

    if (result.success) {
      setManualModalOpen(false);
      setManualCustName('');
      setManualEmail('');
      setManualPhone('');
      setManualAddress('');
      setManualNotes('');
    } else {
      setManualError(result.error || 'Failed to add manual appointment');
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError(null);
    if (!blockDate || !blockReason) return;
    const res = await blockSlot(blockDate, blockTimeSlot, blockReason);
    if (res.success) {
      setBlockModalOpen(false);
      setBlockReason('');
    } else {
      setBlockError(res.error || 'Unable to block slot.');
    }
  };

  const handleStartModifyAppt = (appt: Appointment) => {
    setModifyingAppt(appt);
    setModDate(appt.scheduledDate);
    setModTime(appt.scheduledTime);
    setModTechId(appt.technicianId || technicians[0]?.id || '');
    setModError(null);
  };

  const handleSaveModifyAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingAppt) return;
    const res = await modifyAppointment(modifyingAppt.id, modDate, modTime, modTechId);
    if (res.success) {
      setModifyingAppt(null);
    } else {
      setModError(res.error || 'Conflict detected');
    }
  };

  const handleOpenEditCustomer = (cust: UserProfile) => {
    setEditingCustomer(cust);
    setCustEditName(cust.name);
    setCustEditEmail(cust.email);
    setCustEditPhone(cust.phone);
    setCustEditAddress(cust.address);
    setCustEditNotes(cust.notes || '');
    setCustEditError(null);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setCustEditError(null);
    const res = await updateCustomerRecordByAdmin(editingCustomer.id, {
      name: custEditName,
      email: custEditEmail,
      phone: custEditPhone,
      address: custEditAddress,
      notes: custEditNotes
    });
    if (res.success) {
      setEditingCustomer(null);
    } else {
      setCustEditError(res.error || 'Could not save customer record.');
    }
  };

  const handleOpenPaymentModal = (appt?: Appointment) => {
    if (appt) {
      setPayApptId(appt.id);
      setPayAmount(appt.price);
    } else if (appointments.length > 0) {
      const unpaid = appointments.find((a) => a.paymentStatus !== 'paid') || appointments[0];
      setPayApptId(unpaid.id);
      setPayAmount(unpaid.price);
    }
    setPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payApptId || payAmount <= 0) return;
    await recordPayment({
      appointmentId: payApptId,
      amount: payAmount,
      method: payMethod,
      notes: payNotes
    });
    setPaymentModalOpen(false);
    setPayNotes('');
  };

  if (!authReady) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center text-xs text-[#555555]">
        Checking administrator authentication...
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <AuthCard
        portalType="admin"
        badgeText="Admin Operations Console"
        title="Administrator Sign In"
        description="Sign in with the verified business owner account (mis161group8@gmail.com) to manage quotes, schedules, CRM records, and payments."
        googleButtonLabel="Sign In with Google"
        onBackHome={() => setActiveView('home')}
      />
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="py-12 max-w-xl mx-auto px-4 sm:px-6 text-[#222222] space-y-4">
        <EmailVerificationBanner />
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="btn-rounded px-4 py-2 bg-white border border-[#E8EEF1] text-xs font-semibold text-[#555555] hover:text-rose-700 cursor-pointer"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={() => setActiveView('home')}
            className="btn-rounded px-4 py-2 bg-[#E8EEF1] text-xs font-semibold text-[#263F50] cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAdminAuthorized) {
    return (
      <div className="py-12 max-w-lg mx-auto px-4 sm:px-6 text-[#222222]">
        <div className="bg-white rounded-3xl p-8 border border-[#E8EEF1] shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#222222]">Administrator Access Restricted</h2>
          <p className="text-xs text-[#555555] leading-relaxed">
            Signed in as <strong>{firebaseUser.email}</strong>. Only the verified business owner account (<code className="font-mono font-semibold text-[#263F50]">mis161group8@gmail.com</code>) or an authorized administrator can open the Admin Operations Console.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveView('customer_portal')}
              className="btn-rounded px-4 py-2 bg-[#263F50] text-white text-xs font-semibold cursor-pointer"
            >
              Go to Customer Portal
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="btn-rounded px-4 py-2 bg-white border border-[#E8EEF1] text-[#555555] hover:text-rose-700 text-xs font-semibold cursor-pointer"
            >
              Sign Out &amp; Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#222222]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E8EEF1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8EEF1] text-[#263F50] border border-[#d2dce2]">
              Admin Operations Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-1">
            Dispatch &amp; Operations Command Center
          </h1>
          <p className="text-sm text-[#555555]">
            Real-time management for quotes, technicians, {businessInfo.dailyHours} schedules, payments, and security controls.
          </p>
        </div>

        {/* Signed-In Admin Badge & Sign Out */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#E8EEF1] text-xs font-semibold text-[#555555] shadow-xs">
            Admin: <strong className="text-[#263F50]">{firebaseUser.email}</strong>
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

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs font-bold text-[#555555] uppercase tracking-wider">Total Revenue Collected</div>
          <div className="text-2xl font-black text-[#222222] mt-1 tabular-nums">${totalRevenue}</div>
          <div className="text-xs text-[#263F50] font-semibold mt-1">{payments.length} completed transactions</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs font-bold text-[#555555] uppercase tracking-wider">Scheduled Bookings</div>
          <div className="text-2xl font-black text-[#263F50] mt-1 tabular-nums">
            {appointments.filter((a) => a.status !== 'cancelled').length}
          </div>
          <div className="text-xs text-[#555555] mt-1">Active customer jobs</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs font-bold text-[#555555] uppercase tracking-wider">Quote Inquiries</div>
          <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">{quotes.length}</div>
          <div className="text-xs text-[#555555] mt-1">
            {quotes.filter((q) => q.status === 'new').length} awaiting review
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs font-bold text-[#555555] uppercase tracking-wider">Blocked Time Slots</div>
          <div className="text-2xl font-black text-[#222222] mt-1 tabular-nums">{blockedSlots.length}</div>
          <div className="text-xs text-[#555555] mt-1">Prevents customer booking</div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 pb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Quote Access Alerts ({adminNotifications.length})</span>
          {adminNotifications.filter((n) => !n.read).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
              {adminNotifications.filter((n) => !n.read).length} NEW
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Master Schedule & Dispatch ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'quotes'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Quote Requests ({quotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'customers'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customer Records CRM ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Payment Management ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security &amp; Settings (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('dialogue')}
          className={`btn-rounded px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dialogue'
              ? 'bg-[#263F50] text-white font-bold shadow-xs'
              : 'bg-white hover:bg-[#E8EEF1] text-[#555555] border border-[#E8EEF1]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Dialogue Archives & Quotes ({dialogueMessages.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 0: QUOTE ACCESS ALERTS (Real-Time Notifications & Email) */}
      {/* ============================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Bell className="w-3.5 h-3.5 text-cyan-700" />
                <span>Admin Notification Center</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Incoming Quote Access Requests</h2>
              <p className="text-xs text-slate-500">
                Customers requesting instant direct price access send real-time alerts and email dispatches to admin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
                <Mail className="w-3.5 h-3.5 text-cyan-600" />
                <span>Email Target: <strong className="text-slate-900">mis161group8@gmail.com</strong></span>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {adminNotifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
                No quote access notifications at this time.
              </div>
            ) : (
              adminNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    !notif.read ? 'border-cyan-300 shadow-sm bg-cyan-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          !notif.read ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {!notif.read ? 'New Request' : 'Processed'}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">{notif.title}</h4>
                        <span className="text-xs text-slate-400">· {notif.timestamp}</span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        <span><strong>Customer:</strong> {notif.customerName}</span>
                        <span><strong>Phone:</strong> {notif.customerPhone}</span>
                        <span><strong>Email:</strong> {notif.customerEmail}</span>
                        <span><strong>Location:</strong> {notif.propertyAddress}</span>
                        {typeof notif.squareFootage === 'number' && <span><strong>Size:</strong> {notif.squareFootage} sq ft</span>}
                        {typeof notif.estimatedPrice === 'number' && (
                          <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                            Direct Price: ${notif.estimatedPrice}
                          </span>
                        )}
                      </div>

                      {notif.notes && (
                        <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 pt-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{notif.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="btn-rounded px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          markNotificationRead(notif.id);
                          setActiveTab('quotes');
                        }}
                        className="btn-rounded px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Review Quote
                      </button>
                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: MASTER SCHEDULE (Feature 5, Stories 30-35 & Story 39) */}
      {/* ============================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Administrative Schedule & Dispatch</h2>
              <p className="text-xs text-slate-500">
                View all scheduled jobs, add manual phone bookings, block dates, and prevent overlaps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBlockModalOpen(true)}
                className="btn-rounded px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Block Unavailable Dates (Story 34)</span>
              </button>

              <button
                onClick={() => setManualModalOpen(true)}
                className="btn-rounded px-4 py-2 text-xs font-semibold bg-sky-500 text-white hover:bg-sky-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Phone Appointment (Story 31)</span>
              </button>
            </div>
          </div>

          {/* Active Blocked Slots Notification Bar (Story 34) */}
          {blockedSlots.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-amber-600" />
                <span>Currently Blocked Windows (Customers cannot book online):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blockedSlots.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-amber-200 text-xs text-slate-700 shadow-xs"
                  >
                    <span className="font-bold text-amber-800">{b.date} ({b.timeSlot})</span>
                    <span className="text-slate-500">· {b.reason}</span>
                    <button
                      onClick={() => unblockSlot(b.id)}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs"
                      title="Unblock this slot"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Appointments Table / List (Stories 30, 32, 33, 39) */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50/70 text-slate-600 font-bold uppercase tracking-wider border-b border-sky-100">
                  <tr>
                    <th className="py-3.5 px-4">Job ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Date & Window</th>
                    <th className="py-3.5 px-4">Technician</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50 text-slate-700">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 px-4 text-center text-xs text-slate-400">
                        No scheduled appointments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => {
                      const isCancelled = appt.status === 'cancelled';
                      const isDone = appt.status === 'completed';

                      return (
                        <tr key={appt.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-sky-800">{appt.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{appt.customerName}</div>
                            <div className="text-[11px] text-slate-400">{appt.customerPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{appt.serviceName}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{appt.serviceAddress}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{appt.scheduledDate}</div>
                            <div className="text-sky-700">{appt.scheduledTime}</div>
                          </td>
                          <td className="py-3 px-4 font-medium">{appt.technicianName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              appt.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'en_route'
                                ? 'bg-sky-100 text-sky-800'
                                : appt.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {appt.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                appt.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : appt.paymentStatus === 'overdue'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-800'
                              }`}>
                                ${appt.price}
                              </span>
                              <select
                                value={appt.paymentStatus}
                                onChange={(e) =>
                                  void updatePaymentStatus(
                                    appt.id,
                                    e.target.value as Appointment['paymentStatus']
                                  )
                                }
                                aria-label={`Payment status for ${appt.id}`}
                                className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-700 capitalize focus:outline-none"
                              >
                                <option value="pending">pending</option>
                                <option value="invoiced">invoiced</option>
                                <option value="paid">paid</option>
                                <option value="overdue">overdue</option>
                                <option value="refunded">refunded</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isDone && !isCancelled && (
                                <>
                                  <button
                                    onClick={() => void markAppointmentCompleted(appt.id)}
                                    className="btn-rounded p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    title="Mark as Completed (Story 39)"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleStartModifyAppt(appt)}
                                    className="btn-rounded p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                    title="Modify / Reassign (Story 32)"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => void cancelAppointment(appt.id, 'Cancelled by Admin dispatch')}
                                    className="btn-rounded p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    title="Cancel Appointment (Story 33)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {appt.paymentStatus !== 'paid' && !isCancelled && (
                                <button
                                  onClick={() => handleOpenPaymentModal(appt)}
                                  className="btn-rounded px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold"
                                  title="Record Payment (Story 40)"
                                >
                                  Record $
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: QUOTE REQUESTS (Feature 2, Stories 14 & 15) */}
      {/* ============================================================== */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Submitted Quote Requests</h2>
              <p className="text-xs text-slate-500">
                Review incoming requests, attach pricing estimates, and convert directly to bookings.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-sky-100 text-xs">
              {(['all', 'new', 'reviewed', 'quoted', 'accepted'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setQuoteFilter(st)}
                  className={`btn-rounded px-3 py-1 font-semibold capitalize transition-colors ${
                    quoteFilter === st
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-sky-100 text-xs text-slate-400">
              No quote requests match this filter yet.
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      {q.id}
                    </span>
                    <span className="text-xs text-slate-400">· {q.createdAt}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                    q.status === 'new'
                      ? 'bg-sky-100 text-sky-800'
                      : q.status === 'reviewed'
                      ? 'bg-amber-100 text-amber-800'
                      : q.status === 'quoted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{q.serviceName}</h3>
                  <div className="text-xs text-slate-600 font-medium mt-1">
                    Customer: <span className="text-slate-900 font-bold">{q.customerName}</span> ({q.phone})
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>{q.propertyAddress}</span>
                  </div>
                </div>

                <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100/60 text-xs space-y-2">
                  {q.subcategories && q.subcategories.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Specific Areas: </span>
                      <span className="text-slate-800 font-medium">{q.subcategories.join(', ')}</span>
                    </div>
                  )}
                  {q.removalNeeds && q.removalNeeds.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Substances to Remove: </span>
                      <span className="text-slate-800">{q.removalNeeds.join(', ')} {q.otherRemovalDetails ? `(${q.otherRemovalDetails})` : ''}</span>
                    </div>
                  )}
                  {q.timingPreference && (
                    <div>
                      <span className="font-semibold text-slate-700">Preferred Timing: </span>
                      <span className="text-slate-800">
                        {q.timingPreference === 'asap'
                          ? 'As Soon As Possible'
                          : q.timingPreference === 'flexible'
                          ? "Flexible"
                          : `Specific Date: ${q.preferredDate || 'Not specified'}`}
                      </span>
                    </div>
                  )}
                  {q.areaDescription && (
                    <div>
                      <span className="font-semibold text-slate-700">Notes: </span>
                      <span className="text-slate-600">{q.areaDescription}</span>
                    </div>
                  )}
                  {typeof q.squareFootage === 'number' && (
                    <div className="text-[11px] text-slate-500">
                      Approximate Area: <span className="font-semibold">{q.squareFootage} sq ft</span>
                    </div>
                  )}
                  {typeof q.estimatedPrice === 'number' ? (
                    <div className="pt-1 border-t border-sky-100 font-bold text-sky-800 flex justify-between">
                      <span>Quoted Price:</span>
                      <span>${q.estimatedPrice}</span>
                    </div>
                  ) : (
                    <div className="pt-1 border-t border-sky-100 text-slate-500 italic flex justify-between">
                      <span>Quoted Price:</span>
                      <span>Not quoted yet (click Edit Status &amp; Pricing)</span>
                    </div>
                  )}
                  {q.adminNotes && (
                    <div className="text-[11px] text-slate-500 italic">
                      Admin Note: {q.adminNotes}
                    </div>
                  )}
                </div>

                {/* Attached photos (Story 12) */}
                {q.photos && q.photos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Customer Uploaded Photos:
                    </span>
                    <div className="flex gap-2">
                      {q.photos.map((p, idx) => (
                        <img
                          key={idx}
                          src={p}
                          alt="Quote area"
                          className="w-16 h-16 rounded-xl object-cover border border-sky-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions: Update status & Convert to appointment */}
                <div className="flex items-center gap-2 pt-2 border-t border-sky-50">
                  <button
                    onClick={() => handleOpenEditQuote(q)}
                    className="btn-rounded flex-1 py-2 text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors text-center cursor-pointer"
                  >
                    Edit Status & Pricing
                  </button>

                  {q.status !== 'accepted' && (
                    <button
                      onClick={() => setConvertingQuote(q)}
                      className="btn-rounded px-3.5 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Book Job</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER CRM (Feature 3, Stories 20, 21 & Story 38) */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (() => {
        const normalizedQuery = customerSearchQuery.trim().toLowerCase();
        const queryDigits = customerSearchQuery.replace(/\D/g, '');
        const filteredCustomers = customers.filter((cust) => {
          if (!normalizedQuery) return true;
          const matchesName = cust.name.toLowerCase().includes(normalizedQuery);
          const matchesEmail = cust.email.toLowerCase().includes(normalizedQuery);
          const matchesPhoneText = cust.phone.toLowerCase().includes(normalizedQuery);
          const matchesPhoneDigits =
            queryDigits.length > 0 && cust.phone.replace(/\D/g, '').includes(queryDigits);
          return matchesName || matchesEmail || matchesPhoneText || matchesPhoneDigits;
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#222222]">Customer Profiles &amp; CRM Records</h2>
                <p className="text-xs text-[#555555]">
                  Search customers, update contact records, and review individual service histories.
                </p>
              </div>

              {/* Customer Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#555555] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  aria-label="Search customers by name, email, or phone"
                  className="w-full pl-10 pr-9 py-2 rounded-full bg-white border border-[#E8EEF1] text-xs text-[#222222] placeholder-[#888888] focus:outline-none focus:border-[#263F50] shadow-2xs"
                />
                {customerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCustomerSearchQuery('')}
                    aria-label="Clear customer search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#777777] hover:text-[#222222] hover:bg-[#E8EEF1] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-[#E8EEF1] text-center space-y-3 shadow-xs">
                <Users className="w-10 h-10 text-[#9FB2BE] mx-auto" />
                <h3 className="text-base font-bold text-[#222222]">No customers found.</h3>
                {customerSearchQuery.trim() ? (
                  <>
                    <p className="text-xs text-[#555555]">
                      No customer records matched &ldquo;{customerSearchQuery}&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCustomerSearchQuery('')}
                      className="btn-rounded px-4 py-2 text-xs font-semibold bg-[#E8EEF1] hover:bg-[#DCE5EA] text-[#263F50] cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-[#555555]">
                    Customer profiles created by signed-in users will appear here automatically.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCustomers.map((cust) => {
                  const custAppointments = appointments.filter(
                    (a) => a.customerId === cust.id || a.customerEmail.toLowerCase() === cust.email.toLowerCase()
                  );
                  const totalSpent = custAppointments
                    .filter((a) => a.paymentStatus === 'paid')
                    .reduce((acc, a) => acc + a.price, 0);

                  return (
                    <div
                      key={cust.id}
                      className="bg-white rounded-3xl p-6 border border-[#E8EEF1] shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-[#222222]">{cust.name}</h3>
                            <span className="text-[11px] font-mono font-semibold text-[#263F50] bg-[#E8EEF1] px-2 py-0.5 rounded-full">
                              {cust.id}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenEditCustomer(cust)}
                            className="btn-rounded p-1.5 text-[#263F50] hover:bg-[#E8EEF1] transition-colors cursor-pointer"
                            title="Edit Customer Record (Story 21)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2 text-xs text-[#555555]">
                          <div className="flex justify-between gap-2">
                            <span className="text-[#777777] shrink-0">Email:</span>
                            <span className="font-semibold text-[#222222] truncate">{cust.email}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[#777777] shrink-0">Phone:</span>
                            <span className="font-semibold text-[#222222]">{cust.phone}</span>
                          </div>
                          <div>
                            <span className="text-[#777777] block">Address:</span>
                            <span className="font-semibold text-[#222222]">{cust.address}</span>
                          </div>
                          {cust.notes && (
                            <div className="p-2.5 bg-[#F8F9F7] border border-[#E8EEF1] rounded-xl text-[11px] text-[#555555] italic">
                              Preferences: {cust.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#E8EEF1]">
                        {/* Customer History Stats (Story 38) */}
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#555555]">History: {custAppointments.length} jobs</span>
                          <span className="text-[#263F50]">Total Paid: ${totalSpent}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewingHistoryCustomer(cust)}
                          className="btn-rounded w-full py-2 px-3 bg-[#F8F9F7] hover:bg-[#E8EEF1] text-[#263F50] border border-[#E8EEF1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>View Service History</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* TAB 4: PAYMENT MANAGEMENT (Feature 7, Stories 40-43) */}
      {/* ============================================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Payment & Revenue Management</h2>
              <p className="text-xs text-slate-500">
                Track payments received, log transactions, and associate payments with completed wash jobs.
              </p>
            </div>

            <button
              onClick={() => handleOpenPaymentModal()}
              className="btn-rounded px-4 py-2 text-xs font-semibold bg-sky-500 text-white hover:bg-sky-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record New Payment (Story 40)</span>
            </button>
          </div>

          {/* Transaction Log Table */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-sky-50 flex justify-between items-center bg-sky-50/30">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Transaction Records Log ({payments.length})
              </span>
              <span className="text-xs text-sky-700 font-bold">Total Collected: ${totalRevenue}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50/50 text-slate-600 font-bold uppercase tracking-wider border-b border-sky-100">
                  <tr>
                    <th className="py-3 px-4">Txn ID</th>
                    <th className="py-3 px-4">Appointment</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50 text-slate-700">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 px-4 text-center text-xs text-slate-400">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-sky-800">{p.transactionRef}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600">{p.appointmentId}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.customerName}</td>
                        <td className="py-3 px-4">{p.method}</td>
                        <td className="py-3 px-4 text-slate-500">{p.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                          ${p.amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointment Billing & Invoice Statuses */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-sky-50 flex justify-between items-center bg-sky-50/30">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Appointment Billing &amp; Payment Statuses ({appointments.filter((a) => a.status !== 'cancelled').length})
              </span>
              <span className="text-[11px] text-slate-500">Update billing status directly or record payment</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50/50 text-slate-600 font-bold uppercase tracking-wider border-b border-sky-100">
                  <tr>
                    <th className="py-3 px-4">Appointment</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50 text-slate-700">
                  {appointments.filter((a) => a.status !== 'cancelled').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-4 text-center text-xs text-slate-400">
                        No active appointments to bill right now.
                      </td>
                    </tr>
                  ) : (
                    appointments
                      .filter((a) => a.status !== 'cancelled')
                      .map((appt) => (
                        <tr key={appt.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-sky-800">{appt.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{appt.customerName}</td>
                          <td className="py-3 px-4">{appt.serviceName}</td>
                          <td className="py-3 px-4 font-bold tabular-nums">${appt.price}</td>
                          <td className="py-3 px-4">
                            <select
                              value={appt.paymentStatus}
                              onChange={(e) =>
                                void updatePaymentStatus(
                                  appt.id,
                                  e.target.value as Appointment['paymentStatus']
                                )
                              }
                              className="px-2.5 py-1 rounded-xl border border-sky-200 bg-white text-xs font-semibold text-slate-800 capitalize focus:outline-none"
                            >
                              <option value="pending">pending</option>
                              <option value="invoiced">invoiced</option>
                              <option value="paid">paid</option>
                              <option value="overdue">overdue</option>
                              <option value="refunded">refunded</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {appt.paymentStatus !== 'paid' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPaymentModal(appt)}
                                className="btn-rounded px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Record Payment
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                Paid {appt.paidAt ? `(${appt.paidAt})` : ''}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SECURITY, STAFF & BUSINESS SETTINGS */}
      {/* ============================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Security, Roles &amp; Business Settings</h2>
            <p className="text-xs text-slate-500">
              Firebase Authentication security posture, field technician permissions, and live website contact/hours settings.
            </p>
          </div>

          {/* Honest Firebase Auth & Security Enforcement Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Firebase Authentication &amp; Multi-Factor Status</h3>
                <p className="text-xs text-slate-500">
                  Real Firebase Email Verification + Eight Pillars Firestore Security Rules active
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-sky-50/50 p-4 rounded-2xl border border-sky-100 space-y-2 leading-relaxed">
              <div>
                <strong>Active Protection:</strong> Administrative access is enforced server-side in Cloud Firestore Rules using verified Firebase ID tokens (<code className="font-mono text-[#263F50]">email_verified == true</code>) and the <code className="font-mono text-[#263F50]">/admins</code> / <code className="font-mono text-[#263F50]">/staff</code> authorization lists.
              </div>
              <div>
                <strong>Multi-Factor Authentication (MFA):</strong> Real SMS/TOTP 2FA enrollment in Firebase (<code className="font-mono text-[#263F50]">multiFactor(user)</code>) requires upgrading the Firebase project from the free Spark tier to Google Cloud Identity Platform (Blaze billing linked). No simulated or client-side passcode modal is used.
              </div>
            </div>
          </div>

          {/* Role-Based Access Control Matrix */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
                <p className="text-xs text-slate-500">Permissions enforced strictly by Firestore Security Rules</p>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-sky-50 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">System Area</th>
                    <th className="py-2.5 px-3 text-center">Customer</th>
                    <th className="py-2.5 px-3 text-center">Field Tech</th>
                    <th className="py-2.5 px-3 text-center">Admin / Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Request Quotes &amp; Book Online</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">View Personal History &amp; Reschedule</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">View Assigned Route &amp; Update Status</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Block Schedule &amp; Prevent Double Book</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Financial Records &amp; Payment Tracking</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">No</td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Field Technician Staff Authorization (/staff) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EEF1] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#222222]">Authorized Field Technicians</h3>
                <p className="text-xs text-[#555555]">
                  Grant a verified user&apos;s Firebase UID access to the Technical Portal, dispatch roster, and their assigned jobs.
                </p>
              </div>
            </div>

            {staffError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {staffError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStaffError(null);
                setSavingStaff(true);
                try {
                  const res = await grantStaffAccess({
                    uid: staffUidInput,
                    email: staffEmailInput,
                    name: staffNameInput,
                    phone: staffPhoneInput || undefined,
                    vehicle: staffVehicleInput || undefined
                  });
                  if (res.success) {
                    setStaffUidInput('');
                    setStaffNameInput('');
                    setStaffEmailInput('');
                    setStaffPhoneInput('');
                    setStaffVehicleInput('Sacramento Mobile Service Rig');
                  } else {
                    setStaffError(res.error || 'Could not save staff authorization.');
                  }
                } finally {
                  setSavingStaff(false);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <input
                type="text"
                required
                value={staffUidInput}
                onChange={(e) => setStaffUidInput(e.target.value)}
                placeholder="Firebase User UID *"
                className="px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs focus:outline-none focus:border-[#263F50]"
              />
              <input
                type="email"
                required
                value={staffEmailInput}
                onChange={(e) => setStaffEmailInput(e.target.value)}
                placeholder="Technician Email *"
                className="px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs focus:outline-none focus:border-[#263F50]"
              />
              <input
                type="text"
                required
                value={staffNameInput}
                onChange={(e) => setStaffNameInput(e.target.value)}
                placeholder="Full Name *"
                className="px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs focus:outline-none focus:border-[#263F50]"
              />
              <input
                type="tel"
                value={staffPhoneInput}
                onChange={(e) => setStaffPhoneInput(e.target.value)}
                placeholder="Direct Phone (optional)"
                className="px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs focus:outline-none focus:border-[#263F50]"
              />
              <input
                type="text"
                value={staffVehicleInput}
                onChange={(e) => setStaffVehicleInput(e.target.value)}
                placeholder="Assigned Truck / Rig (e.g. Truck #01)"
                className="sm:col-span-2 px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs focus:outline-none focus:border-[#263F50]"
              />
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="btn-rounded px-4 py-2 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {savingStaff ? 'Saving...' : 'Authorize Technician Account'}
                </button>
              </div>
            </form>

            {staffAccounts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8EEF1]">
                {staffAccounts.map((st) => (
                  <div
                    key={st.uid}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#222222]">
                        {st.name} {st.vehicle ? `· ${st.vehicle}` : ''}
                      </div>
                      <div className="text-[#555555]">
                        {st.email} {st.phone ? `· ${st.phone}` : ''} · <span className="font-mono text-[11px]">{st.uid}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void revokeStaffAccess(st.uid)}
                      className="btn-rounded px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editable Business Contact & Operating Hours (/siteConfig/business) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EEF1] shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8EEF1] text-[#263F50] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#222222]">Business Contact &amp; Operating Hours</h3>
                <p className="text-xs text-[#555555]">
                  Updates contact details, service hours, and crew capacity live across the website and scheduler.
                </p>
              </div>
            </div>

            {bizError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {bizError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBizError(null);
                setSavingBiz(true);
                try {
                  const res = await updateBusinessInfo({
                    companyName: bizCompanyName,
                    phone: bizPhone,
                    email: bizEmail,
                    address: bizAddress,
                    daysOpen: bizDaysOpen,
                    dailyHours: bizDailyHours,
                    hoursSummary: bizHoursSummary,
                    hoursNote: bizHoursNote,
                    crewCapacity: Number(bizCrewCapacity) || 1
                  });
                  if (!res.success) {
                    setBizError(res.error || 'Could not update business details.');
                  }
                } finally {
                  setSavingBiz(false);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={bizCompanyName}
                  onChange={(e) => setBizCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Business Phone</label>
                <input
                  type="tel"
                  required
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Public Email</label>
                <input
                  type="email"
                  required
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Service Region / Address</label>
                <input
                  type="text"
                  required
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Days Open</label>
                <input
                  type="text"
                  required
                  value={bizDaysOpen}
                  onChange={(e) => setBizDaysOpen(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Daily Hours</label>
                <input
                  type="text"
                  required
                  value={bizDailyHours}
                  onChange={(e) => setBizDailyHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Top Bar Hours Summary</label>
                <input
                  type="text"
                  required
                  value={bizHoursSummary}
                  onChange={(e) => setBizHoursSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#222222] mb-1">Concurrent Crew Capacity per Slot</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={bizCrewCapacity}
                  onChange={(e) => setBizCrewCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#222222] mb-1">Scheduling Note</label>
                <textarea
                  rows={2}
                  value={bizHoursNote}
                  onChange={(e) => setBizHoursNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] focus:outline-none focus:border-[#263F50]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={savingBiz}
                  className="btn-rounded px-5 py-2.5 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {savingBiz ? 'Saving Settings...' : 'Save Business Contact & Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: DIALOGUE ARCHIVES & DIRECT QUOTES */}
      {/* ============================================================== */}
      {activeTab === 'dialogue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Customer Dialogue Archives</h2>
              <p className="text-xs text-slate-500">
                Audited transcripts of all customer inquiries, direct price locks, and dispatch communication.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const ok = await copyDialogueTranscript(selectedDialogueThread);
                  if (ok) {
                    setCopiedAdminTranscript(true);
                    setTimeout(() => setCopiedAdminTranscript(false), 2000);
                  }
                }}
                className="btn-rounded px-3.5 py-2 text-xs font-bold bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAdminTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-cyan-600" />}
                <span>{copiedAdminTranscript ? 'Copied' : 'Copy Thread'}</span>
              </button>

              <button
                onClick={() => downloadDialogueTranscript(selectedDialogueThread)}
                className="btn-rounded px-3.5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Transcript (.txt)</span>
              </button>
            </div>
          </div>

          {/* Sacramento Visit Fee Policy Notice */}
          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-cyan-900">
              <DollarSign className="w-4 h-4 text-cyan-700 shrink-0" />
              <span>
                <strong>Sacramento Visit Fee Policy:</strong> {visitFeePolicy.policyDescription}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
              $0 Core Zone Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Customer Thread Selector (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-cyan-100 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Customer Conversation:
              </div>

              <div className="space-y-2">
                {(() => {
                  const threadMap = new Map<string, { id: string; name: string; address: string }>();
                  customers.forEach((c) => {
                    threadMap.set(c.id, { id: c.id, name: c.name, address: c.address });
                  });
                  dialogueMessages.forEach((m) => {
                    if (m.threadId && !threadMap.has(m.threadId)) {
                      threadMap.set(m.threadId, {
                        id: m.threadId,
                        name: m.customerName || 'Customer',
                        address: 'Sacramento, CA'
                      });
                    }
                  });
                  const threads = Array.from(threadMap.values());
                  if (threads.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No customer conversations yet.
                      </div>
                    );
                  }
                  return threads.map((c) => {
                    const msgs = dialogueMessages.filter((m) => m.threadId === c.id);
                    const isSelected = selectedDialogueThread === c.id;

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedDialogueThread(c.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-50 border-cyan-400 ring-1 ring-cyan-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{c.name}</span>
                          <span className="text-[10px] text-cyan-700 font-bold bg-cyan-100/70 px-2 py-0.5 rounded-full">
                            {msgs.length} msgs
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{c.address || 'Sacramento, CA'}</div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Conversation Log & Reply (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-cyan-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-100 text-xs">
                <div>
                  <span className="text-slate-400">Viewing Thread for: </span>
                  <strong className="text-slate-900">
                    {customers.find((c) => c.id === selectedDialogueThread)?.name || 'Sacramento Homeowner'}
                  </strong>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Thread ID: {selectedDialogueThread}</span>
              </div>

              {/* Message scroll list */}
              <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                {dialogueMessages
                  .filter((m) => m.threadId === selectedDialogueThread)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        msg.senderRole === 'admin'
                          ? 'bg-cyan-600 text-white ml-8 shadow-xs'
                          : msg.senderRole === 'technician'
                          ? 'bg-teal-700 text-white ml-8 shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 mr-8 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold opacity-90">
                        <span>{msg.senderName}</span>
                        <span className="font-normal opacity-75">{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.message}</p>
                      {typeof msg.directPrice === 'number' && (
                        <div className="pt-1.5 mt-1 border-t border-white/20 font-black flex items-center justify-between text-[11px]">
                          <span>Direct Locked Price:</span>
                          <span className="bg-white/20 px-2 py-0.5 rounded-md">${msg.directPrice}</span>
                        </div>
                      )}
                    </div>
                  ))}

                {dialogueMessages.filter((m) => m.threadId === selectedDialogueThread).length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No dialogue messages recorded for this thread yet. Send a response below to initiate.
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!adminReplyText.trim() || !selectedDialogueThread) return;

                  const custObj = customers.find((c) => c.id === selectedDialogueThread);
                  const priceVal = adminPriceQuote ? Number(adminPriceQuote) : undefined;

                  await sendDialogueMessage(
                    selectedDialogueThread,
                    custObj ? custObj.name : 'Customer',
                    'admin',
                    'Marcus Ray (Sacramento Dispatch)',
                    adminReplyText.trim(),
                    priceVal
                  );

                  setAdminReplyText('');
                  setAdminPriceQuote('');
                }}
                className="space-y-3 pt-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Dispatch Response:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Lock Direct Price ($):</span>
                    <input
                      type="number"
                      value={adminPriceQuote}
                      onChange={(e) => setAdminPriceQuote(e.target.value)}
                      placeholder="e.g. 240"
                      className="w-20 px-2 py-1 text-xs border border-cyan-200 rounded-xl text-cyan-900 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type dispatch response, appointment update, or chemical note..."
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-cyan-200 text-xs focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                  <button
                    type="submit"
                    className="btn-rounded px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Send to Thread
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: Edit Quote, Convert Quote, Manual Appt, Block, etc. */}
      {/* ============================================================== */}

      {/* Edit Quote Modal */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Review & Update Quote #{editingQuote.id}</h3>
            <p className="text-xs text-slate-500">Customer: {editingQuote.customerName} · {editingQuote.serviceName}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimate Amount ($)</label>
                <input
                  type="number"
                  value={quotePriceEstimate}
                  onChange={(e) => setQuotePriceEstimate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Notes / Scope</label>
                <input
                  type="text"
                  value={quoteAdminNote}
                  onChange={(e) => setQuoteAdminNote(e.target.value)}
                  placeholder="e.g. Free gutter rinse included"
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="pt-2">
                <span className="block text-xs font-bold text-slate-700 mb-2">Set Status:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveQuoteStatus('reviewed')}
                    className="btn-rounded py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800"
                  >
                    Reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuoteStatus('quoted')}
                    className="btn-rounded py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    Send Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuoteStatus('declined')}
                    className="btn-rounded py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Quote To Appointment Modal */}
      {convertingQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Book Appointment from Quote #{convertingQuote.id}</h3>
            <p className="text-xs text-slate-500">Service: {convertingQuote.serviceName} for {convertingQuote.customerName}</p>

            <form onSubmit={handleConvertQuoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Date</label>
                <input
                  type="date"
                  min={todayLA}
                  value={convertDate}
                  onChange={(e) => setConvertDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={convertTime}
                  onChange={(e) => setConvertTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Technician</label>
                {technicians.length === 0 ? (
                  <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No authorized field technicians yet. Add a technician under Security &amp; Settings first.
                  </div>
                ) : (
                  <select
                    value={convertTech}
                    onChange={(e) => setConvertTech(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.vehicle})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={technicians.length === 0}
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  Confirm & Schedule Job
                </button>
                <button
                  type="button"
                  onClick={() => setConvertingQuote(null)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Appointment Modal (Story 31) */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Add Phone / Manual Appointment (Story 31)</h3>
            <p className="text-xs text-slate-500">Quickly schedule customers who contact the business via telephone.</p>

            {manualError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
                {manualError}
              </div>
            )}

            <form onSubmit={handleCreateManualAppt} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={manualCustName}
                    onChange={(e) => setManualCustName(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Address *</label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs focus:ring-2 focus:ring-sky-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service</label>
                  <select
                    value={manualServiceId}
                    onChange={(e) => setManualServiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    min={todayLA}
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Field Technician</label>
                {technicians.length === 0 ? (
                  <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No authorized field technicians yet. Add a technician under Security &amp; Settings first.
                  </div>
                ) : (
                  <select
                    value={manualTechId}
                    onChange={(e) => setManualTechId(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.vehicle})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Called in regarding front walkway wash"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={technicians.length === 0}
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Manual Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Unavailable Dates Modal (Story 34) */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <Ban className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Block Dates / Times (Story 34)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Customers will not be allowed to book appointments during these blocked intervals.
            </p>

            {blockError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
                {blockError}
              </div>
            )}

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  min={todayLA}
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm focus:ring-2 focus:ring-sky-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot To Block</label>
                <select
                  value={blockTimeSlot}
                  onChange={(e) => setBlockTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm"
                >
                  <option value="All Day">All Day (Whole Day Block)</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason (Visible in schedule)</label>
                <input
                  type="text"
                  placeholder="e.g. Equipment inspection, holiday, severe frost"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-rounded flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Block This Slot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBlockModalOpen(false);
                    setBlockError(null);
                  }}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Appointment Modal (Story 32) */}
      {modifyingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Modify Appointment #{modifyingAppt.id}</h3>
            <p className="text-xs text-slate-500">Customer: {modifyingAppt.customerName}</p>

            {modError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
                {modError}
              </div>
            )}

            <form onSubmit={handleSaveModifyAppt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  min={todayLA}
                  value={modDate}
                  onChange={(e) => setModDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={modTime}
                  onChange={(e) => setModTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Technician</label>
                {technicians.length === 0 ? (
                  <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No authorized field technicians yet. Add a technician under Security &amp; Settings first.
                  </div>
                ) : (
                  <select
                    value={modTechId}
                    onChange={(e) => setModTechId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-sm"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.vehicle})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Save Modifications
                </button>
                <button
                  type="button"
                  onClick={() => setModifyingAppt(null)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal (Story 21) */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Update Customer Record #{editingCustomer.id}</h3>

            {custEditError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
                {custEditError}
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={custEditName}
                  onChange={(e) => setCustEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={custEditEmail}
                  onChange={(e) => setCustEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={custEditPhone}
                  onChange={(e) => setCustEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address <span className="font-normal text-slate-400">(optional)</span></label>
                <input
                  type="text"
                  value={custEditAddress}
                  onChange={(e) => setCustEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={custEditNotes}
                  onChange={(e) => setCustEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Save Record
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal (Story 40) */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center gap-2 text-sky-600">
              <DollarSign className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Record Customer Payment (Story 40 & 43)</h3>
            </div>
            <p className="text-xs text-slate-500">Link received payment to a scheduled appointment record.</p>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Appointment *</label>
                <select
                  value={payApptId}
                  onChange={(e) => {
                    setPayApptId(e.target.value);
                    const found = appointments.find((a) => a.id === e.target.value);
                    if (found) setPayAmount(found.price);
                  }}
                  className="w-full px-3.5 py-2 rounded-2xl border border-sky-200 text-xs"
                  required
                >
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} · {a.customerName} - {a.serviceName} (${a.price} · {a.paymentStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Check">Check</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / ACH</option>
                    <option value="Online">Online Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Reference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Check #4029 received on site"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-sky-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Confirm & Record Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Customer Service History Modal */}
      {viewingHistoryCustomer && (() => {
        const customerJobs = appointments
          .filter(
            (a) =>
              a.customerId === viewingHistoryCustomer.id ||
              (viewingHistoryCustomer.email &&
                a.customerEmail.toLowerCase() === viewingHistoryCustomer.email.toLowerCase())
          )
          .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-[#222222] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8EEF1] overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-6 py-5 bg-[#F8F9F7] border-b border-[#E8EEF1] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#263F50] bg-[#E8EEF1] px-2.5 py-0.5 rounded-full">
                    {viewingHistoryCustomer.id}
                  </span>
                  <h3 className="text-lg font-bold text-[#222222] mt-1">
                    Service History · {viewingHistoryCustomer.name}
                  </h3>
                  <p className="text-xs text-[#555555]">
                    {viewingHistoryCustomer.email} · {viewingHistoryCustomer.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingHistoryCustomer(null)}
                  aria-label="Close service history"
                  className="p-2 rounded-full hover:bg-[#E8EEF1] text-[#555555] hover:text-[#222222] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {customerJobs.length === 0 ? (
                  <div className="bg-[#F8F9F7] rounded-2xl p-8 border border-[#E8EEF1] text-center space-y-2">
                    <History className="w-9 h-9 text-[#9FB2BE] mx-auto" />
                    <h4 className="text-sm font-bold text-[#222222]">No previous service history.</h4>
                    <p className="text-xs text-[#555555]">
                      No appointment or completed wash records exist for this customer yet.
                    </p>
                  </div>
                ) : (
                  customerJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-[#F8F9F7] rounded-2xl p-5 border border-[#E8EEF1] space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E8EEF1]">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[#263F50] bg-white px-2 py-0.5 rounded-md border border-[#E8EEF1]">
                              {job.id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                job.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : job.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-[#E8EEF1] text-[#263F50]'
                              }`}
                            >
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#222222] mt-1">{job.serviceName}</h4>
                        </div>

                        <div className="sm:text-right">
                          <div className="text-sm font-extrabold text-[#222222]">${job.price}</div>
                          <span
                            className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              job.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            Payment: {job.paymentStatus}
                            {job.paymentMethod ? ` (${job.paymentMethod})` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#555555]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#263F50] shrink-0" />
                          <span>
                            <strong>Date:</strong> {job.scheduledDate} · {job.scheduledTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#263F50] shrink-0" />
                          <span className="truncate">
                            <strong>Address:</strong> {job.serviceAddress}
                          </span>
                        </div>
                      </div>

                      {(job.technicianNotes || job.notes || job.completedAt) && (
                        <div className="bg-white rounded-xl p-3 border border-[#E8EEF1] space-y-1 text-[11px] text-[#555555]">
                          {job.completedAt && (
                            <div>
                              <strong className="text-[#222222]">Completed:</strong> {job.completedAt}
                            </div>
                          )}
                          {job.technicianNotes && (
                            <div>
                              <strong className="text-[#222222]">Completed Job Notes:</strong> {job.technicianNotes}
                            </div>
                          )}
                          {job.notes && (
                            <div>
                              <strong className="text-[#222222]">Appointment Notes:</strong> {job.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-4 bg-[#F8F9F7] border-t border-[#E8EEF1] text-right">
                <button
                  type="button"
                  onClick={() => setViewingHistoryCustomer(null)}
                  className="btn-rounded px-5 py-2 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
