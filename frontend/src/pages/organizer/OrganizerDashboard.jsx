import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Calendar,
  Users,
  QrCode,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [eventComparison, setEventComparison] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [analyticsRes, eventsRes] = await Promise.all([
          api.get('/analytics/organizer'),
          api.get('/events/my/organized'),
        ]);

        if (analyticsRes.data.success) {
          setStats(analyticsRes.data.stats);
          setEventComparison(analyticsRes.data.eventComparison || []);
        }

        if (eventsRes.data.success) {
          setMyEvents(eventsRes.data.events || []);
        }
      } catch (err) {
        console.error('Failed to load organizer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const COLORS = ['#5146E5', '#8B5CF6', '#10B981', '#F59E0B', '#64748B'];

  return (
    <DashboardLayout title="Organizer Dashboard">
      <div className="space-y-8">
        {/* Welcome & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-subtle">
          <div>
            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
              Host Operations
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Welcome, {user?.name || 'Organizer'}
            </h2>
            <p className="text-xs text-slate-500">
              Manage your campus events, monitor registration capacities, and scan attendee tickets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/organizer/scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4 text-brand-600" />
              <span>QR Scanner</span>
            </Link>
            <Link
              to="/organizer/events/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          </div>
        </div>

        {/* KPI Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Events"
              value={stats?.totalEvents ?? myEvents.length}
              icon={Calendar}
              subtitle="Organized on EventX"
              color="brand"
            />
            <StatCard
              title="Registrations"
              value={stats?.totalRegistrations ?? 0}
              icon={Users}
              subtitle="Total seats claimed"
              color="violet"
            />
            <StatCard
              title="Attendance Rate"
              value={`${stats?.attendanceRate ?? 0}%`}
              icon={CheckCircle}
              subtitle={`${stats?.totalCheckedIn ?? 0} attendees checked in`}
              color="emerald"
            />
            <StatCard
              title="Waitlisted Peers"
              value={stats?.totalWaitlisted ?? 0}
              icon={Clock}
              subtitle="Queued for full events"
              color="amber"
            />
          </div>
        )}

        {/* Analytics Chart & Managed Events Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Registration Breakdown Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Event Registrations</h3>
                <p className="text-xs text-slate-500">Capacities vs active participants</p>
              </div>
              <Link
                to="/organizer/analytics"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>Deep dive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="w-full h-64">
              {eventComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 14)}...` : val)}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="registered" fill="#5146E5" name="Registered" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" fill="#E2E8F0" name="Capacity" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  Create events to see registration volume comparison.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Status Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Event Status Summary</h3>
              <p className="text-xs text-slate-500">Overview of your catalog state</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Approved & Live</span>
                <span className="text-sm font-bold text-emerald-700">
                  {myEvents.filter((e) => e.status === 'approved').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Pending Admin Approval</span>
                <span className="text-sm font-bold text-amber-700">
                  {myEvents.filter((e) => e.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Drafts / In Progress</span>
                <span className="text-sm font-bold text-slate-900">
                  {myEvents.filter((e) => e.status === 'draft').length}
                </span>
              </div>
            </div>

            <Link
              to="/organizer/events"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors block"
            >
              Manage All Events
            </Link>
          </div>
        </div>

        {/* Managed Events Table Preview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Organized Events</h3>
              <p className="text-xs text-slate-500">Live roster and fast participant management</p>
            </div>
            <Link
              to="/organizer/events"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View all ({myEvents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="h-40 bg-slate-50 rounded-2xl animate-pulse" />
          ) : myEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Event</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Capacity</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {myEvents.slice(0, 5).map((evt) => (
                    <tr key={evt._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link to={`/events/${evt._id}`} className="hover:text-brand-600">
                          {evt.title}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(evt.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            evt.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : evt.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {evt.registeredCount}/{evt.capacity}
                        {evt.waitlistCount > 0 && (
                          <span className="text-[10px] text-amber-600 ml-1">
                            ({evt.waitlistCount} waitlist)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/organizer/events/${evt._id}/participants`}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100"
                          >
                            Participants
                          </Link>
                          <Link
                            to={`/organizer/events/${evt._id}/edit`}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No events organized yet.{' '}
              <Link to="/organizer/events/new" className="text-brand-600 font-bold hover:underline">
                Create your first event
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

