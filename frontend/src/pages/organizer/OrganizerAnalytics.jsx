import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const OrganizerAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [eventComparison, setEventComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/organizer');
        if (res.data.success) {
          setStats(res.data.stats);
          setEventComparison(res.data.eventComparison || []);
        }
      } catch (err) {
        console.error('Failed to load organizer analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#5146E5', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];

  return (
    <DashboardLayout title="Event Operations Analytics">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Metrics</h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry on registration velocities, venue utilization, and check-in ratios.
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
              title="Organized Events"
              value={stats?.totalEvents ?? 0}
              icon={Calendar}
              subtitle="Events on platform"
              color="brand"
            />
            <StatCard
              title="Total Registrations"
              value={stats?.totalRegistrations ?? 0}
              icon={Users}
              subtitle="Confirmed attendees"
              color="violet"
            />
            <StatCard
              title="Verified Attendance"
              value={`${stats?.attendanceRate ?? 0}%`}
              icon={CheckCircle}
              subtitle={`${stats?.totalCheckedIn ?? 0} check-ins processed`}
              color="emerald"
            />
            <StatCard
              title="Waitlist Total"
              value={stats?.totalWaitlisted ?? 0}
              icon={Clock}
              subtitle="Pending auto-promotions"
              color="amber"
            />
          </div>
        )}

        {/* Recharts BarChart: Event Capacity vs Registrations */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Event Utilization Overview</h3>
              <p className="text-xs text-slate-500">
                Comparison of actual registrations vs designated venue capacities
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1 text-brand-600">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600" /> Registrations
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Max Capacity
              </span>
            </div>
          </div>

          <div className="w-full h-80">
            {eventComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventComparison} margin={{ top: 20, right: 20, left: -15, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickFormatter={(val) => (val.length > 20 ? `${val.slice(0, 20)}...` : val)}
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
                  <Bar dataKey="registered" fill="#5146E5" name="Registered Participants" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#E2E8F0" name="Total Capacity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No active event data available for chart visualization.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

