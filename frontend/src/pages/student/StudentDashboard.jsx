import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CalendarCheck,
  Ticket,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Compass,
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

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [upcomingRegistrations, setUpcomingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Analytics
        const analyticsRes = await api.get('/analytics/student');
        if (analyticsRes.data.success) {
          setStats(analyticsRes.data.stats);
          setCategoryData(analyticsRes.data.categoryData || []);
          setMonthlyActivity(analyticsRes.data.monthlyActivity || []);
        }

        // Active Registrations
        const regRes = await api.get('/registrations/my');
        if (regRes.data.success) {
          const confirmed = (regRes.data.registrations || []).filter(
            (r) => r.status === 'confirmed'
          );
          setUpcomingRegistrations(confirmed.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#5146E5', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

  return (
    <DashboardLayout title="Student Overview">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white overflow-hidden shadow-premium">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Welcome back
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Devon'}!
            </h2>
            <p className="text-brand-100 text-xs sm:text-sm leading-relaxed">
              You're all set for your upcoming campus events. Check your digital passes, review waitlist updates, or download attendance certificates below.
            </p>
          </div>
        </div>

        {/* KPI Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Registered Events"
              value={stats?.totalRegistrations ?? 0}
              icon={CalendarCheck}
              subtitle="Total signed up"
              color="brand"
            />
            <StatCard
              title="Upcoming Confirmed"
              value={stats?.upcomingCount ?? 0}
              icon={Clock}
              subtitle="Active admissions"
              color="violet"
            />
            <StatCard
              title="Attended Events"
              value={stats?.attendedCount ?? 0}
              icon={Ticket}
              subtitle="Verified check-ins"
              color="emerald"
            />
            <StatCard
              title="Certificates"
              value={stats?.certificatesCount ?? 0}
              icon={Award}
              subtitle="Ready for download"
              color="amber"
            />
          </div>
        )}

        {/* Upcoming Events Carousel & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Upcoming Registered Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Upcoming Events</h3>
                <p className="text-xs text-slate-500">Confirmed seats awaiting your check-in</p>
              </div>
              <Link
                to="/my-registrations"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>View all registrations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              </div>
            ) : upcomingRegistrations.length > 0 ? (
              <div className="space-y-3">
                {upcomingRegistrations.map((reg) => (
                  <div
                    key={reg._id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-premium card-hover-effect flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          reg.event?.image ||
                          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
                        }
                        alt={reg.event?.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                          {reg.event?.category || 'Event'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {reg.event?.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(reg.event?.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {reg.event?.isOnline ? 'Online' : reg.event?.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Confirmed
                      </span>
                      <Link
                        to="/my-tickets"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No active event registrations</p>
                <p className="text-xs text-slate-500">
                  Explore exciting workshops and hackathons happening on campus.
                </p>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
                >
                  Explore Events
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Category Distribution */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Event Interests</h3>
              <p className="text-xs text-slate-500">Breakdown of registered categories</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col items-center justify-center min-h-[260px]">
              {categoryData.length > 0 ? (
                <>
                  <div className="w-full h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          innerRadius={40}
                          paddingAngle={4}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-xs text-slate-400 py-8">
                  Register for events to see your interest analytics.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Activity Recharts Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Participation Timeline</h3>
            <p className="text-xs text-slate-500">Your monthly event registrations</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

