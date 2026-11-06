import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
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

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/events/pending'),
        api.get('/analytics/admin'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (pendingRes.data.success) {
        setPendingEvents(pendingRes.data.events || []);
      }
      if (analyticsRes.data.success) {
        setMonthlyGrowth(analyticsRes.data.monthlyGrowth || []);
        setCategoryData(analyticsRes.data.categoryData || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickApprove = async (eventId) => {
    try {
      const res = await api.put(`/admin/events/${eventId}/approve`);
      if (res.data.success) {
        toast.success('Event approved and published!');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to approve event.');
    }
  };

  const COLORS = ['#5146E5', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

  return (
    <DashboardLayout title="Platform Administration">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Health & Metrics</h2>
          <p className="text-xs text-slate-500">
            Real-time control over university users, approval queues, and catalog activity.
          </p>
        </div>

        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              subtitle={`${stats?.totalStudents ?? 0} students • ${stats?.totalOrganizers ?? 0} hosts`}
              color="brand"
            />
            <StatCard
              title="Total Events"
              value={stats?.totalEvents ?? 0}
              icon={Calendar}
              subtitle={`${stats?.approvedEvents ?? 0} active & published`}
              color="violet"
            />
            <StatCard
              title="Pending Approvals"
              value={stats?.pendingEvents ?? 0}
              icon={ShieldCheck}
              subtitle="Requires admin review"
              color={stats?.pendingEvents > 0 ? 'amber' : 'emerald'}
            />
            <StatCard
              title="Total Check-Ins"
              value={stats?.totalCheckedIn ?? 0}
              icon={CheckCircle}
              subtitle={`${stats?.attendanceRate ?? 0}% overall conversion`}
              color="emerald"
            />
          </div>
        )}

        {/* Pending Approvals & Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Pending Event Approvals Alert Queue */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Event Approval Queue</h3>
                <p className="text-xs text-slate-500">Submissions awaiting publishing</p>
              </div>
              <Link
                to="/admin/approvals"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>Full queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : pendingEvents.length > 0 ? (
              <div className="space-y-3">
                {pendingEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt._id}
                    className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{evt.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          By {evt.organizer?.name || 'Organizer'} • {evt.category}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/40">
                      <Link
                        to="/admin/approvals"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
                      >
                        Review
                      </Link>
                      <button
                        onClick={() => handleQuickApprove(evt._id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>Approval queue is clear! All events are reviewed.</span>
              </div>
            )}
          </div>

          {/* Right 2 Columns: Monthly Registration Velocity */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Registration Growth</h3>
              <p className="text-xs text-slate-500">Student enrollment momentum over past 6 months</p>
            </div>

            <div className="w-full h-64">
              {monthlyGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="registrations" fill="#5146E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  Data telemetry processing...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Admin Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-premium card-hover-effect flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Manage Campus Users
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Roles, permissions & account statuses
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/admin/approvals"
            className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-premium card-hover-effect flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Event Approvals
              </h4>
              <p className="text-xs text-slate-500 mt-1">Review organizer submissions</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-premium card-hover-effect flex items-center justify-between group"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                Master Event Catalog
              </h4>
              <p className="text-xs text-slate-500 mt-1">Audit campus wide event records</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

