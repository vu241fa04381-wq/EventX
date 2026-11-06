import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Calendar,
  Shield,
  Zap,
  Award,
  Users,
  QrCode,
  Layers,
  Heart,
  Sparkles,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Modern Campus Operating System</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Empowering Universities with Smart Event Infrastructure
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            EventX was conceived to bridge the gap between academic event organizers, campus tech clubs, and ambitious students through real-time discovery, seamless QR admissions, and verifiable digital credentials.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Zero-Friction Discovery</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Find hackathons, cloud summits, and cultural galas tailored to your department and career interests, with instant one-click registrations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Waitlist & QR Pass</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Database-safe concurrency checks prevent overbooking. When attendees cancel, the next waitlisted student is automatically promoted with an instant QR pass.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verifiable PDF Certificates</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Paper certificates are a thing of the past. Real-time scanner check-ins immediately unlock tamper-resistant, downloadable PDF certificates for portfolios.
            </p>
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Built on Modern Architecture</h2>
            <p className="text-sm text-slate-500 mt-1">
              EventX leverages an enterprise-grade MERN technology stack designed for low latency and high reliability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Frontend</span>
              <p className="text-base font-bold text-slate-900 mt-1">React + Vite</p>
              <p className="text-xs text-slate-500 mt-0.5">Tailwind CSS & Recharts</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Backend</span>
              <p className="text-base font-bold text-slate-900 mt-1">Node.js + Express</p>
              <p className="text-xs text-slate-500 mt-0.5">RESTful Architecture</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Database</span>
              <p className="text-base font-bold text-slate-900 mt-1">MongoDB & Mongoose</p>
              <p className="text-xs text-slate-500 mt-0.5">Atomic concurrency safety</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Real-time</span>
              <p className="text-base font-bold text-slate-900 mt-1">Socket.IO</p>
              <p className="text-xs text-slate-500 mt-0.5">Instant event notifications</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

