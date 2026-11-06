import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  Users,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';

export const EventApproval = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Reject Modal State
  const [rejectingEvent, setRejectingEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/events/pending');
      if (res.data.success) {
        setPendingEvents(res.data.events || []);
      }
    } catch (err) {
      toast.error('Failed to load pending events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (eventId) => {
    try {
      setProcessing(true);
      const res = await api.put(`/admin/events/${eventId}/approve`);
      if (res.data.success) {
        toast.success('Event approved and published to public catalog!');
        fetchPendingEvents();
        if (selectedEvent?._id === eventId) setSelectedEvent(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve event.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingEvent) return;

    try {
      setProcessing(true);
      const res = await api.put(`/admin/events/${rejectingEvent._id}/reject`, {
        reason: rejectionReason,
      });
      if (res.data.success) {
        toast.success('Event submission rejected.');
        setRejectingEvent(null);
        setRejectionReason('');
        fetchPendingEvents();
        if (selectedEvent?._id === rejectingEvent._id) setSelectedEvent(null);
      }
    } catch (err) {
      toast.error('Failed to reject event.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout title="Event Approvals">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pending Submissions</h2>
          <p className="text-xs text-slate-500">
            Review incoming event requests, verify venue allocations, and publish to the campus catalog.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : pendingEvents.length > 0 ? (
          <div className="space-y-4">
            {pendingEvents.map((evt) => (
              <div
                key={evt._id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      evt.image ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={evt.title}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {evt.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                        Needs Approval
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Host: <strong>{evt.organizer?.name || 'Organizer'}</strong> (
                        {evt.organizer?.department || 'Faculty'})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(evt.startDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.isOnline ? 'Online Stream' : evt.venue}
                      </span>
                      <span>•</span>
                      <span>Capacity: {evt.capacity} seats</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectingEvent(evt);
                      setRejectionReason('');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(evt._id)}
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="All clear! No pending submissions"
            description="All submitted events have been reviewed. New organizer submissions will appear here automatically."
          />
        )}

        {/* Inspect Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                    {selectedEvent.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedEvent.image && (
                <div className="aspect-[21/9] rounded-2xl overflow-hidden max-h-48">
                  <img
                    src={selectedEvent.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Description
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Organizer</span>
                  <p className="font-bold text-slate-800">{selectedEvent.organizer?.name}</p>
                  <p className="text-slate-500">{selectedEvent.organizer?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Venue & Capacity</span>
                  <p className="font-bold text-slate-800">{selectedEvent.venue}</p>
                  <p className="text-slate-500">{selectedEvent.capacity} participants max</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingEvent(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedEvent._id)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  Approve & Publish Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {rejectingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reject Event Submission</h3>
                  <p className="text-xs text-slate-500 truncate">{rejectingEvent.title}</p>
                </div>
                <button
                  onClick={() => setRejectingEvent(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Feedback / Rejection Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Venue is reserved for university convocations on this date."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRejectingEvent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                  >
                    {processing ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

