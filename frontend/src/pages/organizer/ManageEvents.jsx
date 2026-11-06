import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Calendar,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  Bell,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';

export const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Announcement Modal State
  const [announcementEvent, setAnnouncementEvent] = useState(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState('normal');
  const [broadcasting, setBroadcasting] = useState(false);

  // Delete Modal State
  const [deleteEventTarget, setDeleteEventTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/my/organized');
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to load organized events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annMessage || !announcementEvent) return;

    try {
      setBroadcasting(true);
      const res = await api.post(`/events/${announcementEvent._id}/announcements`, {
        title: annTitle,
        message: annMessage,
        priority: annPriority,
      });

      if (res.data.success) {
        toast.success('Announcement broadcasted to participants!');
        setAnnouncementEvent(null);
        setAnnTitle('');
        setAnnMessage('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send announcement.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventTarget) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/events/${deleteEventTarget._id}`);
      if (res.data.success) {
        toast.success('Event deleted successfully.');
        setDeleteEventTarget(null);
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = events.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout title="Manage Events">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Event Catalog</h2>
            <p className="text-xs text-slate-500">
              Track event lifecycles, inspect rosters, and broadcast real-time announcements.
            </p>
          </div>
          <Link
            to="/organizer/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'approved', 'pending', 'draft', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Events Table / Card list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((evt) => {
              const percentFilled = Math.min(
                100,
                Math.round((evt.registeredCount / (evt.capacity || 1)) * 100)
              );
              return (
                <div
                  key={evt._id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        evt.image ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={evt.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {evt.category}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                            evt.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : evt.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {evt.status}
                        </span>
                        {evt.isFeatured && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Featured
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{evt.title}</h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(evt.startDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          Capacity: <strong>{evt.registeredCount}/{evt.capacity}</strong> ({percentFilled}%)
                        </span>
                        {evt.waitlistCount > 0 && (
                          <span className="text-amber-600 font-semibold">
                            {evt.waitlistCount} on waitlist
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                    <Link
                      to={`/organizer/events/${evt._id}/participants`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                      title="Manage Attendees & Check-ins"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Participants</span>
                    </Link>

                    <button
                      onClick={() => setAnnouncementEvent(evt)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                      title="Send Announcement"
                    >
                      <Bell className="w-3.5 h-3.5 text-violet-600" />
                      <span>Announce</span>
                    </button>

                    <Link
                      to={`/organizer/events/${evt._id}/edit`}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setDeleteEventTarget(evt)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No events matching criteria"
            description="You don't have any events organized under the selected filter."
            actionLabel="Create an Event"
            onAction={() => (window.location.href = '/organizer/events/new')}
          />
        )}

        {/* Broadcast Announcement Modal */}
        {announcementEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Broadcast Announcement</h3>
                  <p className="text-xs text-slate-500 truncate">{announcementEvent.title}</p>
                </div>
                <button
                  onClick={() => setAnnouncementEvent(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Announcement Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. Schedule update for afternoon keynote"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="normal">Normal Announcement</option>
                    <option value="urgent">Urgent / Important Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="Enter message for all registered attendees..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncementEvent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{broadcasting ? 'Broadcasting...' : 'Send Broadcast'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteEventTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Event?</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  "{deleteEventTarget.title}" and its associated tickets and records will be removed.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteEventTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

