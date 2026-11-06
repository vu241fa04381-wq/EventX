import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Award,
  Share2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Mail,
  Phone,
  ArrowLeft,
  Ticket,
  ChevronRight,
  MessageSquare,
  Star,
} from 'lucide-react';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, agenda, announcements, feedback

  // Fetch Event Data
  const fetchEventData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
        setUserRegistration(res.data.userRegistration || null);
      }

      // Fetch Announcements
      try {
        const annRes = await api.get(`/events/${id}/announcements`);
        if (annRes.data.success) {
          setAnnouncements(annRes.data.announcements || []);
        }
      } catch (e) {
        // Ignore announcement error
      }

      // Fetch Feedback
      try {
        const feedRes = await api.get(`/feedback/event/${id}`);
        if (feedRes.data.success) {
          setFeedbackList(feedRes.data.feedback || []);
        }
      } catch (e) {
        // Ignore feedback error
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      toast.error('Event not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  // Handle Event Registration / Waitlist
  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to register for this event.');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      setRegistering(true);
      const res = await api.post(`/registrations/${id}`);
      if (res.data.success) {
        if (res.data.registration.status === 'confirmed') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          toast.success('Registration Confirmed! Your digital ticket is ready 🎉');
        } else if (res.data.registration.status === 'waitlisted') {
          toast.success(
            `Added to waitlist at position #${res.data.registration.waitlistPosition}. We'll notify you if a seat opens up!`
          );
        }
        fetchEventData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Event Not Found</h2>
          <p className="text-slate-500 mt-2">
            This event may have been removed or does not exist.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  const deadlinePassed = new Date(event.registrationDeadline) < new Date();
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const availableSeats = Math.max(0, event.capacity - event.registeredCount);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events Directory
          </Link>
        </div>

        {/* Hero Cover Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] max-h-[420px] w-full bg-slate-900 shadow-md">
          <img
            src={
              event.image ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'
            }
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Hero Floating Content */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-xs">
                  {event.category}
                </span>
                {event.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-amber-950">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-950" /> Featured
                  </span>
                )}
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {event.priceType === 'free' || event.price === 0 ? 'FREE ADMISSION' : `$${event.price}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>

            <button
              onClick={handleShare}
              className="self-start sm:self-end inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all"
            >
              <Share2 className="w-4 h-4" /> Share Event
            </button>
          </div>
        </div>

        {/* Content & Action Bar Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Description, Tabs, Agenda */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Meta Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Date</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Time</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  {event.isOnline ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Location</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {event.isOnline ? 'Online Meeting' : event.venue}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Capacity</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {event.registeredCount}/{event.capacity}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              {event.agenda && event.agenda.length > 0 && (
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === 'agenda'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Schedule / Agenda ({event.agenda.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('announcements')}
                className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === 'announcements'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Announcements ({announcements.length})
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === 'feedback'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Feedback & Reviews ({feedbackList.length})
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-subtle space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About This Event</h3>
                  <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Topic Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizer Info Card */}
                {event.organizer && (
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Event Host
                    </h4>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <img
                        src={
                          event.organizer.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.name)}&background=5146E5&color=fff`
                        }
                        alt={event.organizer.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{event.organizer.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {event.organizer.department ? `${event.organizer.department} • ` : ''}
                          {event.organizer.college || 'Apex Institute of Technology'}
                        </p>
                      </div>
                      {event.contactEmail && (
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-white transition-colors"
                          title="Contact Organizer"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Agenda */}
            {activeTab === 'agenda' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Event Schedule & Agenda</h3>
                <div className="space-y-4">
                  {event.agenda.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 font-bold text-xs shrink-0">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{item.session}</p>
                        {item.speaker && (
                          <p className="text-xs text-slate-500 mt-0.5">Speaker: {item.speaker}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Announcements */}
            {activeTab === 'announcements' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Official Announcements</h3>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div
                        key={ann._id}
                        className={`p-4 rounded-xl border ${
                          ann.priority === 'urgent'
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No announcements published yet.
                  </p>
                )}
              </div>
            )}

            {/* Tab: Feedback */}
            {activeTab === 'feedback' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Participant Feedback</h3>
                {feedbackList.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackList.map((item) => (
                      <div
                        key={item._id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{item.comment}</p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          — {item.isAnonymous ? 'Anonymous Attendee' : item.user?.name || 'Verified Attendee'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No feedback submitted yet for this event.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Action & Ticket Registration Card */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Registration Status
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {event.priceType === 'free' || event.price === 0 ? 'Free Entry' : `$${event.price}`}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isFull
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isFull ? 'Waitlist Open' : 'Open for Registration'}
                  </span>
                </div>
              </div>

              {/* Capacity Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Seats Capacity</span>
                  <span>{percentFilled}% Filled</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? 'bg-amber-500' : 'bg-brand-600'
                    }`}
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {isFull ? (
                    <span className="text-amber-600 font-medium">
                      All {event.capacity} seats reserved. ({event.waitlistCount} on waitlist)
                    </span>
                  ) : (
                    <span>{availableSeats} seats remaining out of {event.capacity}</span>
                  )}
                </p>
              </div>

              {/* Deadline alert */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <p className="font-semibold text-slate-700">Registration Deadline:</p>
                <p className="text-slate-500">
                  {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(event.registrationDeadline).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Call to action button */}
              <div>
                {userRegistration ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        {userRegistration.status === 'confirmed' && 'You are registered!'}
                        {userRegistration.status === 'waitlisted' &&
                          `You are #${userRegistration.waitlistPosition} on waitlist`}
                        {userRegistration.status === 'attended' && 'Attendance Verified!'}
                      </p>
                      <p className="text-emerald-700">
                        {userRegistration.status === 'confirmed' &&
                          'Your digital ticket with QR code is ready.'}
                        {userRegistration.status === 'waitlisted' &&
                          'If a seat opens up, you will be promoted automatically.'}
                        {userRegistration.status === 'attended' &&
                          'Your Certificate of Participation is ready to download.'}
                      </p>
                    </div>

                    {userRegistration.status === 'confirmed' && (
                      <Link
                        to="/my-tickets"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all"
                      >
                        <Ticket className="w-4 h-4" /> View My Digital Ticket
                      </Link>
                    )}

                    {userRegistration.status === 'attended' && (
                      <Link
                        to="/my-certificates"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
                      >
                        <Award className="w-4 h-4" /> Download Certificate
                      </Link>
                    )}
                  </div>
                ) : deadlinePassed ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-500 font-semibold text-sm cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                ) : isFull ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-sm transition-all"
                  >
                    {registering ? 'Joining Waitlist...' : 'Join Waitlist Queue'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {registering ? 'Securing Seat...' : 'Register for Event'}
                  </button>
                )}
              </div>

              {/* Guarantees */}
              <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
                <p>• Fast check-in with offline QR pass</p>
                <p>• Verified credentials powered by EventX</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

