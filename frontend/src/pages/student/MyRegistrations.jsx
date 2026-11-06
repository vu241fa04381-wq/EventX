import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Award,
  AlertTriangle,
  XCircle,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // all, confirmed, waitlisted, attended, cancelled
  const [selectedToCancel, setSelectedToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my');
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async () => {
    if (!selectedToCancel) return;
    try {
      setCancelling(true);
      const res = await api.put(`/registrations/${selectedToCancel._id}/cancel`, {
        reason: cancelReason,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Registration cancelled.');
        setSelectedToCancel(null);
        setCancelReason('');
        fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const statusBadges = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    waitlisted: 'bg-amber-50 text-amber-700 border-amber-200',
    attended: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <DashboardLayout title="My Registrations">
      <div className="space-y-6">
        {/* Header Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Registered Events</h2>
            <p className="text-xs text-slate-500">
              Track your confirmed spots, waitlist positions, and attendance records.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs self-start sm:self-auto"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Discover More Events</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'all', label: `All (${registrations.length})` },
            { id: 'confirmed', label: `Confirmed (${registrations.filter((r) => r.status === 'confirmed').length})` },
            { id: 'waitlisted', label: `Waitlisted (${registrations.filter((r) => r.status === 'waitlisted').length})` },
            { id: 'attended', label: `Attended (${registrations.filter((r) => r.status === 'attended').length})` },
            { id: 'cancelled', label: `Cancelled (${registrations.filter((r) => r.status === 'cancelled').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Registration Cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((reg) => (
              <div
                key={reg._id}
                className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      reg.event?.image ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={reg.event?.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {reg.event?.category || 'Event'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                          statusBadges[reg.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </div>

                    <Link
                      to={`/events/${reg.event?._id}`}
                      className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1 block"
                    >
                      {reg.event?.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(reg.event?.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reg.event?.isOnline ? 'Online Stream' : reg.event?.venue}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Waitlist Position Notice */}
                    {reg.status === 'waitlisted' && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          You are <strong>#{reg.waitlistPosition}</strong> on the waitlist. Seats
                          are automatically offered as cancellations happen!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                  {reg.status === 'confirmed' && (
                    <>
                      <Link
                        to="/my-tickets"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Digital Ticket</span>
                      </Link>
                      <button
                        onClick={() => setSelectedToCancel(reg)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        Cancel Seat
                      </button>
                    </>
                  )}

                  {reg.status === 'attended' && (
                    <Link
                      to="/my-certificates"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Download Certificate</span>
                    </Link>
                  )}

                  {reg.status === 'waitlisted' && (
                    <button
                      onClick={() => setSelectedToCancel(reg)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      Leave Waitlist
                    </button>
                  )}

                  <Link
                    to={`/events/${reg.event?._id}`}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                    title="View Event Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No registrations found"
            description="You don't have any event registrations in this category."
            actionLabel="Discover Campus Events"
            onAction={() => (window.location.href = '/events')}
          />
        )}

        {/* Cancellation Confirmation Modal */}
        {selectedToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cancel Registration?</h3>
                  <p className="text-xs text-slate-500">{selectedToCancel.event?.title}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Please note:</p>
                <p>
                  Your seat will be released immediately and offered automatically to the next
                  waiting student on the waitlist.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Cancellation (Optional)
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule clash with examinations"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedToCancel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Keep Registration
                </button>
                <button
                  type="button"
                  onClick={handleCancelRegistration}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                >
                  {cancelling ? 'Releasing Seat...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

