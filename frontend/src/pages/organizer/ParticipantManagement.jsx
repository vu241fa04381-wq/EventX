import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  CheckCircle,
  Download,
  ArrowLeft,
  QrCode,
  Clock,
  Ticket,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const ParticipantManagement = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingInId, setCheckingInId] = useState(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/registrations/event/${id}`);
      if (res.data.success) {
        setEventData(res.data.event);
        setParticipants(res.data.participants || []);
      }
    } catch (err) {
      toast.error('Failed to load participants for this event.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [id]);

  // Fast manual check-in from organizer roster
  const handleManualCheckIn = async (participant) => {
    if (!participant.ticket) {
      toast.error('No ticket found for this registration.');
      return;
    }
    try {
      setCheckingInId(participant._id);
      const res = await api.post('/tickets/checkin', {
        token: participant.ticket.qrToken || participant.ticket.ticketId,
        eventId: id,
      });
      if (res.data.success) {
        toast.success(`Check-in verified for ${participant.user?.name}!`);
        fetchParticipants();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setCheckingInId(null);
    }
  };

  // Export roster to CSV
  const handleExportCSV = () => {
    if (participants.length === 0) return;
    const headers = ['Name', 'Email', 'College', 'Department', 'Phone', 'Status', 'Ticket ID', 'Registered At'];
    const rows = participants.map((p) => [
      p.user?.name || '',
      p.user?.email || '',
      p.user?.college || '',
      p.user?.department || '',
      p.user?.phone || '',
      p.status,
      p.ticket?.ticketId || 'N/A',
      new Date(p.registeredAt).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Roster-${eventData?.title || 'Event'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Roster CSV downloaded.');
  };

  const filtered = participants.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      (p.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ticket?.ticketId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout title="Participant Management">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
            </Link>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {eventData?.title || 'Attendee Roster'}
            </h2>
            <p className="text-xs text-slate-500">
              {participants.length} total participants registered • Capacity: {eventData?.capacity}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/organizer/scanner?eventId=${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch QR Scanner</span>
            </Link>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or ticket ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'confirmed', 'attended', 'waitlisted', 'cancelled'].map((st) => (
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

        {/* Table of Participants */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Attendee</th>
                    <th className="py-3.5 px-4">College & Dept</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Ticket ID</th>
                    <th className="py-3.5 px-4">Registered</th>
                    <th className="py-3.5 px-4 text-right">Check-in Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.user?.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.user?.name || 'User'
                              )}&background=5146E5&color=fff`
                            }
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.user?.name}</p>
                            <p className="text-[11px] text-slate-400">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold text-slate-800">{item.user?.college || 'Apex Tech'}</p>
                        <p className="text-[11px] text-slate-400">{item.user?.department || 'N/A'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border ${
                            item.status === 'attended'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'waitlisted'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.status === 'waitlisted'
                            ? `Waitlist #${item.waitlistPosition}`
                            : item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {item.ticket?.ticketId || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(item.registeredAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {item.status === 'confirmed' && (
                          <button
                            onClick={() => handleManualCheckIn(item)}
                            disabled={checkingInId === item._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{checkingInId === item._id ? 'Verifying...' : 'Check In'}</span>
                          </button>
                        )}
                        {item.status === 'attended' && (
                          <span className="text-emerald-600 font-semibold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                        {item.status === 'waitlisted' && (
                          <span className="text-slate-400 text-[11px]">Awaiting seat</span>
                        )}
                        {item.status === 'cancelled' && (
                          <span className="text-rose-500 text-[11px]">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No attendees found"
            description="No participants match the selected filter or search terms."
          />
        )}
      </div>
    </DashboardLayout>
  );
};

