import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Video, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const EventCard = ({ event }) => {
  if (!event) return null;

  const {
    _id,
    title,
    shortDescription,
    category,
    image,
    startDate,
    venue,
    isOnline,
    capacity,
    registeredCount = 0,
    waitlistCount = 0,
    priceType = 'free',
    price = 0,
    isFeatured,
    organizer,
  } = event;

  const isFull = registeredCount >= capacity;
  const percentFilled = Math.min(100, Math.round((registeredCount / (capacity || 1)) * 100));
  const availableSeats = Math.max(0, capacity - registeredCount);

  // Format date
  const eventDate = new Date(startDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryColors = {
    Technical: 'bg-blue-50 text-blue-700 border-blue-200',
    Hackathon: 'bg-purple-50 text-purple-700 border-purple-200',
    Workshop: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Conference: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Seminar: 'bg-amber-50 text-amber-700 border-amber-200',
    Cultural: 'bg-pink-50 text-pink-700 border-pink-200',
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle hover:shadow-premium card-hover-effect flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={
            image ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
          }
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border ${
              categoryColors[category] || 'bg-white/90 text-slate-800 border-white/40'
            }`}
          >
            {category}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-400 text-amber-950 shadow-xs">
              <Sparkles className="w-3 h-3 fill-amber-950" />
              Featured
            </span>
          )}
        </div>

        {/* Price / Admission Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
            {priceType === 'free' || price === 0 ? 'FREE' : `$${price}`}
          </span>
        </div>

        {/* Bottom Image Overlay: Date */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1.5 drop-shadow">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            <span>{formattedDate}</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-brand-300" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {shortDescription || 'Experience cutting-edge sessions, networking, and hands-on workshops.'}
          </p>

          {/* Venue & Organizer */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              {isOnline ? (
                <>
                  <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Online Stream / Virtual</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{venue || 'Campus Auditorium'}</span>
                </>
              )}
            </div>

            {organizer?.name && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span className="truncate">By {organizer.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Capacity / Status Bar & Action */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {isFull ? (
                  <span className="text-amber-600 font-semibold">Full ({waitlistCount} waitlisted)</span>
                ) : (
                  <span>{availableSeats} seats left</span>
                )}
              </span>
              <span className="text-slate-400">{percentFilled}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFull ? 'bg-amber-500' : 'bg-brand-600'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          <Link
            to={`/events/${_id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-600 hover:text-white transition-all group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

