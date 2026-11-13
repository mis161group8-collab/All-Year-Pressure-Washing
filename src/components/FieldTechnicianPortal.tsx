import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wrench, MapPin, Phone, Clock, Navigation, AlertCircle, Check, FileCheck, MessageSquare, Leaf, LogIn } from 'lucide-react';
import { Appointment } from '../types';

export const FieldTechnicianPortal: React.FC = () => {
  const {
    firebaseUser,
    isAdminAuthorized,
    signInWithGoogle,
    technicians,
    selectedTechnicianId,
    setSelectedTechnicianId,
    appointments,
    updateTechnicianJobStatus,
    setDialogueDrawerOpen,
    setActiveDialogueThreadId
  } = useApp();

  const currentTech = technicians.find((t) => t.id === selectedTechnicianId) || technicians[0];
  const [completionModalAppt, setCompletionModalAppt] = useState<Appointment | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Assigned jobs for this technician
  const assignedJobs = appointments.filter((a) => a.technicianId === currentTech.id);
  const activeJobs = assignedJobs.filter((a) => a.status !== 'completed' && a.status !== 'cancelled');
  const completedToday = assignedJobs.filter((a) => a.status === 'completed');

  const handleStatusChange = async (appt: Appointment, newStatus: Appointment['status']) => {
    if (newStatus === 'completed') {
      setCompletionModalAppt(appt);
      setCompletionNotes(appt.technicianNotes || 'Surface cleaned thoroughly, rinsed perimeter, and tested water drainage.');
    } else {
      await updateTechnicianJobStatus(appt.id, newStatus);
    }
  };

  const submitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionModalAppt) return;
    await updateTechnicianJobStatus(completionModalAppt.id, 'completed', completionNotes);
    setCompletionModalAppt(null);
    setCompletionNotes('');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#222222]">
      {(!firebaseUser || !isAdminAuthorized) && (
        <div className="mb-6 p-4 rounded-2xl bg-[#E8EEF1] border border-[#D5E0E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#222222]">
            <strong>Dispatch Authentication Required for Full Crew Routes:</strong> Sign in with an Administrator account to manage all live field routes from the database.
          </div>
          <button
            type="button"
            onClick={() => void signInWithGoogle('admin')}
            className="btn-rounded px-4 py-2 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In as Dispatch</span>
          </button>
        </div>
      )}

      {/* Header and Technician Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E8EEF1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8EEF1] text-[#263F50] border border-[#d2dce2]">
              Technical View · Field Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-1">
            Field Technician Console
          </h1>
          <p className="text-sm text-[#555555]">
            Assigned mobile service routes, 8:00am – 8:00pm daily dispatch, address navigation, and live status reporting.
          </p>
        </div>

        {/* Technician Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8EEF1] shadow-xs">
          <label className="text-xs font-semibold text-[#555555] pl-2">Active Tech:</label>
          <select
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-[#E8EEF1] text-xs font-bold bg-[#F8F9F7] text-[#263F50] focus:outline-none"
          >
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.vehicle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tech Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs text-[#555555] font-semibold uppercase tracking-wider">Assigned Truck Unit</div>
          <div className="text-base font-black text-[#222222] mt-1">{currentTech.vehicle}</div>
          <div className="text-xs text-[#263F50] font-semibold mt-1">Direct: {currentTech.phone}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs text-[#555555] font-semibold uppercase tracking-wider">Active Jobs Pending</div>
          <div className="text-2xl font-black text-[#263F50] mt-1 tabular-nums">{activeJobs.length}</div>
          <div className="text-xs text-[#555555] mt-1">Scheduled or currently in-route</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8EEF1] shadow-xs">
          <div className="text-xs text-[#555555] font-semibold uppercase tracking-wider">Completed Jobs</div>
          <div className="text-2xl font-black text-[#222222] mt-1 tabular-nums">{completedToday.length}</div>
          <div className="text-xs text-[#555555] mt-1">Recorded in service history</div>
        </div>
      </div>

      {/* Van Rig Chemical Inventory & EPA Reclaim Checklist */}
      <div className="bg-[#F8F9F7] rounded-3xl p-6 border border-[#E8EEF1] mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#263F50]" />
            <h3 className="font-extrabold text-[#222222] text-sm">Truck Rig Equipment & Care Checklist</h3>
          </div>
          <span className="text-[11px] font-bold text-[#263F50] bg-[#E8EEF1] px-2.5 py-0.5 rounded-full border border-[#d2dce2]">
            Sacramento Clean Water & Storm Drain Protection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-[#E8EEF1]">
            <div className="font-bold text-[#222222]">1. Outdoor Bleach Dilution</div>
            <div className="text-[#555555] text-[11px]">Outdoor bleach diluted with water for heavy buildup only; water-only for light surfaces</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#E8EEF1]">
            <div className="font-bold text-[#222222]">2. Plant & Grass Pre/Post Watering</div>
            <div className="text-[#555555] text-[11px]">Water surrounding plants and grass thoroughly before and after cleaning to dilute runoff</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#E8EEF1]">
            <div className="font-bold text-[#222222]">3. Storm Drain Protection</div>
            <div className="text-[#555555] text-[11px]">Take extra care around storm drains and environmental runoff pathways</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#E8EEF1]">
            <div className="font-bold text-[#222222]">4. Equipment & Safety Check</div>
            <div className="text-[#555555] text-[11px]">Wands, nozzles, safety gear, and vehicle inspection verified for 8am–8pm dispatch</div>
          </div>
        </div>
      </div>

      {/* Assigned Route / Jobs (Stories 44, 45, 46, 47) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Assigned Jobs & Dispatch Route</h2>
          <span className="text-xs text-slate-500">{assignedJobs.length} total assigned</span>
        </div>

        {assignedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-sky-100 text-center space-y-3">
            <Wrench className="w-10 h-10 text-sky-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No jobs assigned right now</h3>
            <p className="text-xs text-slate-500">All current wash appointments have been completed or assigned to other rigs.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignedJobs.map((job) => {
              const isDone = job.status === 'completed';
              const isCancelled = job.status === 'cancelled';

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-sm transition-all ${
                    job.status === 'in_progress'
                      ? 'border-sky-400 ring-2 ring-sky-100'
                      : isDone
                      ? 'border-slate-200 opacity-90'
                      : 'border-sky-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                          {job.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          job.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                            : job.status === 'en_route'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">{job.serviceName}</h3>
                    </div>

                    {/* Quick navigation and call triggers (Stories 45 & 46) */}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(job.serviceAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-rounded px-3.5 py-2 text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-600" />
                        <span>Directions / GPS</span>
                      </a>
                      <a
                        href={`tel:${job.customerPhone.replace(/[^0-9]/g, '')}`}
                        className="btn-rounded px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-sky-500" />
                        <span>Call Customer</span>
                      </a>

                      <button
                        onClick={() => {
                          setActiveDialogueThreadId(job.customerId);
                          setDialogueDrawerOpen(true);
                        }}
                        className="btn-rounded px-3.5 py-2 text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Client Dialogue</span>
                      </button>
                    </div>
                  </div>

                  {/* Appointment Details Grid (Stories 45 & 46) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
                    <div className="bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100/60">
                      <span className="text-slate-400 block font-medium">Scheduled Time & Date:</span>
                      <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span>{job.scheduledDate}</span>
                      </div>
                      <div className="text-sky-700 font-semibold">{job.scheduledTime}</div>
                    </div>

                    <div className="bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100/60">
                      <span className="text-slate-400 block font-medium">Property Address:</span>
                      <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{job.serviceAddress}</span>
                      </div>
                    </div>

                    <div className="bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100/60">
                      <span className="text-slate-400 block font-medium">Customer Details:</span>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">{job.customerName}</div>
                      <div className="text-slate-500">{job.customerPhone}</div>
                    </div>
                  </div>

                  {/* Access & Job Notes */}
                  {job.notes && (
                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Customer Notes:</span> {job.notes}
                      </div>
                    </div>
                  )}

                  {/* Technician Completion Notes */}
                  {job.technicianNotes && (
                    <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-200 text-xs text-slate-700">
                      <span className="font-bold text-sky-900">Your Completion Notes:</span> {job.technicianNotes}
                    </div>
                  )}

                  {/* Job Status Stepper / Updater (Story 47) */}
                  {!isCancelled && (
                    <div className="pt-3 border-t border-sky-50 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Update Job Status:
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(job, 'scheduled')}
                          disabled={isDone}
                          className={`btn-rounded px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            job.status === 'scheduled'
                              ? 'bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Scheduled
                        </button>

                        <button
                          onClick={() => handleStatusChange(job, 'en_route')}
                          disabled={isDone}
                          className={`btn-rounded px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            job.status === 'en_route'
                              ? 'bg-sky-500 text-white shadow-xs'
                              : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          En Route
                        </button>

                        <button
                          onClick={() => handleStatusChange(job, 'in_progress')}
                          disabled={isDone}
                          className={`btn-rounded px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                            job.status === 'in_progress'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          In Progress
                        </button>

                        <button
                          onClick={() => handleStatusChange(job, 'completed')}
                          className={`btn-rounded px-4 py-1.5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Completed' : 'Mark Completed'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {completionModalAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center gap-2.5 text-sky-600">
              <FileCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Complete Job & Record Notes</h3>
            </div>
            <p className="text-xs text-slate-500">
              Finishing {completionModalAppt.serviceName} at {completionModalAppt.serviceAddress}.
            </p>

            <form onSubmit={submitCompletion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Notes & Completion Report (Story 47)
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Note surfaces washed, chemical ratio used, rinse checks, customer walk-through..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-sky-200 text-xs focus:ring-2 focus:ring-sky-400 bg-sky-50/20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-rounded flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Submit & Complete Job
                </button>
                <button
                  type="button"
                  onClick={() => setCompletionModalAppt(null)}
                  className="btn-rounded px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
