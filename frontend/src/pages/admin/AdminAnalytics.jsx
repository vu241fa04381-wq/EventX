import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import {
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Shield,
  PieChart as PieIcon,
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
  Legend,
} from 'recharts';

export const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/analytics/admin'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (analyticsRes.data.success) {
          setCategoryData(analyticsRes.data.categoryData || []);
          setMonthlyGrowth(analyticsRes.data.monthlyGrowth || []);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#5146E5', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

  return (
    <DashboardLayout title="Platform Telemetry & Analytics">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">University Platform Health</h2>
          <p className="text-xs text-slate-500">
            Macroscopic trends across campus adoption, event genres, and attendance outcomes.
          </p>
        </div>

        {/* Top KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Platform Users"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              subtitle="Registered accounts"
              color="brand"
            />
            <StatCard
              title="Catalog Volume"
              value={stats?.totalEvents ?? 0}
              icon={Calendar}
              subtitle="Events created"
              color="violet"
            />
            <StatCard
              title="Check-in Conversion"
              value={`${stats?.attendanceRate ?? 0}%`}
              icon={CheckCircle}
              subtitle="Registration to venue ratio"
              color="emerald"
            />
            <StatCard
              title="Approved Ratio"
              value={`${
                stats?.totalEvents > 0
                  ? Math.round((stats.approvedEvents / stats.totalEvents) * 100)
                  : 0
              }%`}
              icon={Shield}
              subtitle={`${stats?.approvedEvents ?? 0} approved`}
              color="amber"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registration Volume Trend</h3>
              <p className="text-xs text-slate-500">Trailing month-by-month student engagement</p>
            </div>

            <div className="w-full h-72">
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
            </div>
          </div>

          {/* Category Distribution Pie */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Events by Discipline</h3>
              <p className="text-xs text-slate-500">Distribution across tech and cultural categories</p>
            </div>

            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

