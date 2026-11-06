import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { EventCard } from '../../components/common/EventCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  GraduationCap,
} from 'lucide-react';

export const LandingPage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/events?featured=true&limit=3');
        if (res.data.success) {
          setFeaturedEvents(res.data.events || []);
        }
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Hackathons', icon: Cpu, count: '10+ Active', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { name: 'Technical', icon: Layers, count: '24+ Active', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { name: 'Workshops', icon: Calendar, count: '18+ Active', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { name: 'Conferences', icon: Users, count: '8+ Active', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { name: 'Cultural', icon: Sparkles, count: '14+ Active', color: 'bg-pink-50 text-pink-600 border-pink-200' },
    { name: 'Seminars', icon: GraduationCap, count: '12+ Active', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-200/40 via-violet-200/30 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-800">
                The Next-Gen Campus Event Management Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Discover Events.{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Create Experiences.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Your one-stop platform to discover exciting events, connect with communities, and create unforgettable experiences.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transition-all"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register?role=organizer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
              >
                <span>Host an Event</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant QR Digital Tickets
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated Waitlist Engine
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified PDF Certificates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Strip */}
      <section className="bg-white border-y border-slate-200/80 py-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight">1,200+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Campus Registrations</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">99.4%</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">QR Check-in Speed</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-violet-600 tracking-tight">850+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Certificates Issued</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">100%</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Role-Based Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Browse by Interest
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Curated Event Categories
            </h2>
          </div>
          <Link
            to="/events"
            className="mt-3 md:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            Explore all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/events?category=${cat.name}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-premium card-hover-effect cursor-pointer flex flex-col items-center text-center group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${cat.color}`}
              >
                <cat.icon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h4>
              <span className="text-[11px] text-slate-400 mt-0.5">{cat.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Handpicked Highlights
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Featured Campus Events
              </h2>
            </div>
            <Link
              to="/events"
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>View full directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((evt) => (
                <EventCard key={evt._id} event={evt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No featured events right now. Check out the explore catalog!
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Engineered For Simplicity
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            How EventX Empowers Campuses
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            From seamless discovery to instant QR verification and verifiable digital credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900">Discover & Register</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Browse approved hackathons, workshops, and tech talks. One-click registration locks your seat or puts you into a smart waitlist queue.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant QR Digital Ticket</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every confirmed registration instantly generates an encrypted QR pass stored securely in your dashboard for offline access.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900">Fast Scan & Verified PDF</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Organizers verify tickets at the venue in milliseconds. Verified attendance automatically unlocks your downloadable PDF certificate!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Loved by Students & Organizers</h2>
            <p className="text-sm text-slate-500 mt-1">Real experiences from university tech chapters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <p className="text-sm text-slate-700 italic">
                "EventX made checking in over 300 hackathon hackers effortless. No paper sheets, no long queues, and instant certificate distribution afterwards."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100"
                  alt="Sarah Jenkins"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                  <p className="text-[11px] text-slate-500">Lead Organizer, Apex Tech Fest</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <p className="text-sm text-slate-700 italic">
                "The waitlist auto-promotion is a game-changer. When someone dropped out of the AI Summit, my ticket was immediately confirmed without me doing a thing!"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100"
                  alt="Devon Vance"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Devon Vance</p>
                  <p className="text-[11px] text-slate-500">Software Engineering Student</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
              <p className="text-sm text-slate-700 italic">
                "As an admin, reviewing events and tracking university-wide participation trends with real Recharts analytics gives us total clarity."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                  alt="Alex Rivera"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Alex Rivera</p>
                  <p className="text-[11px] text-slate-500">Platform Operations Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 p-8 sm:p-12 text-white overflow-hidden shadow-xl text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to elevate your campus events?
            </h2>
            <p className="text-brand-100 text-sm sm:text-base">
              Join thousands of students and organizers discovering and managing events with EventX.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-brand-600 font-bold hover:bg-slate-100 shadow transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/events"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-700/60 hover:bg-brand-700 text-white font-semibold border border-white/20 transition-all"
              >
                Browse All Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

