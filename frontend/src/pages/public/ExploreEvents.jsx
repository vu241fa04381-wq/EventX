import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { EventCard } from '../../components/common/EventCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import {
  Search,
  Filter,
  Calendar,
  SlidersHorizontal,
  X,
  Compass,
  Check,
  ChevronDown,
} from 'lucide-react';

export const ExploreEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceType, setPriceType] = useState(searchParams.get('priceType') || 'all');
  const [format, setFormat] = useState('all'); // all, in-person, online
  const [sortBy, setSortBy] = useState('startDate');

  const categories = [
    'All',
    'Technical',
    'Hackathon',
    'Workshop',
    'Conference',
    'Seminar',
    'Cultural',
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        sort: sortBy,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (priceType !== 'all') params.priceType = priceType;

      const res = await api.get('/events', { params });
      if (res.data.success) {
        let list = res.data.events || [];

        // In-memory filter for online/in-person format if selected
        if (format === 'online') {
          list = list.filter((e) => e.isOnline);
        } else if (format === 'in-person') {
          list = list.filter((e) => !e.isOnline);
        }

        setEvents(list);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, priceType, format, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setPriceType('all');
    setFormat('all');
    setSortBy('startDate');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Campus Event Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover workshops, hackathons, and technical fests happening across universities.
          </p>
        </div>

        {/* Search & Top Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, keywords, topics, or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-xs transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filter Pills / Dropdowns */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (cat !== 'All') setSearchParams({ category: cat });
                    else setSearchParams({});
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick dropdown selectors */}
            <div className="flex items-center gap-2">
              {/* Format Filter */}
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">All Formats</option>
                <option value="in-person">In-Person</option>
                <option value="online">Online / Virtual</option>
              </select>

              {/* Price Filter */}
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="all">Free & Paid</option>
                <option value="free">Free Events</option>
                <option value="paid">Paid Events</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="startDate">Date (Upcoming First)</option>
                <option value="createdAt">Newly Added</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{events.length}</span> events
            {selectedCategory !== 'All' && <span> in "{selectedCategory}"</span>}
          </p>
          {(selectedCategory !== 'All' || priceType !== 'all' || format !== 'all' || search) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events found"
            description="We couldn't find any events matching your selected filters. Try broadening your search or resetting filters."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

