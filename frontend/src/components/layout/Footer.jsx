import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Event<span className="text-brand-400">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              The modern smart event operating system designed for universities, organizers, and tech communities to discover, host, and verify campus experiences.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="p-2 hover:text-brand-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 hover:text-brand-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 hover:text-brand-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About EventX
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Organizer Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Host an Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Features
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400">QR Code Ticketing</li>
              <li className="text-slate-400">Smart Waitlist Engine</li>
              <li className="text-slate-400">Real-time Check-in Scanner</li>
              <li className="text-slate-400">Automated PDF Certificates</li>
              <li className="text-slate-400">Role-based Analytics</li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Campus Inquiries
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Want to deploy EventX across your university or student council?
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                placeholder="contact@eventx.edu"
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                readOnly
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Integrated with MongoDB, Express, React, and Node.js.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} EventX Platform. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built with precision & passion</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for modern campuses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

