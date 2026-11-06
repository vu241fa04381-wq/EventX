import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Maximize2,
  CheckCircle,
  X,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enlargedTicket, setEnlargedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets/my');
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handlePrint = (ticket) => {
    window.print();
  };

  return (
    <DashboardLayout title="Digital Tickets">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Event Passes</h2>
          <p className="text-xs text-slate-500">
            Show these encrypted QR tickets at the venue check-in desk for fast admission.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => {
              const eventDate = new Date(ticket.event?.startDate);
              return (
                <div
                  key={ticket._id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-premium flex flex-col justify-between"
                >
                  {/* Ticket Header */}
                  <div className="p-6 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white relative">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider">
                        {ticket.event?.category || 'General Admission'}
                      </span>
                      <span className="font-mono text-brand-200">{ticket.ticketId}</span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight line-clamp-1">
                      {ticket.event?.title}
                    </h3>
                    <p className="text-xs text-brand-200 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{ticket.event?.venue || 'Campus Auditorium'}</span>
                    </p>
                  </div>

                  {/* Perforated Divider Line */}
                  <div className="relative flex items-center justify-between px-4 py-1 bg-white">
                    <div className="w-4 h-8 bg-[#F8FAFC] rounded-r-full -ml-4 border-r border-slate-200" />
                    <div className="flex-1 border-b-2 border-dashed border-slate-200 mx-2" />
                    <div className="w-4 h-8 bg-[#F8FAFC] rounded-l-full -mr-4 border-l border-slate-200" />
                  </div>

                  {/* Ticket Body & QR Area */}
                  <div className="p-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-3 flex-1 text-left w-full sm:w-auto">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Attendee Name
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {ticket.user?.name || 'Devon Vance'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Date
                          </p>
                          <p className="font-semibold text-slate-800">
                            {eventDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Time
                          </p>
                          <p className="font-semibold text-slate-800">
                            {eventDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Status
                        </p>
                        {ticket.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                            Ready for Entry
                          </span>
                        )}
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div
                        onClick={() => setEnlargedTicket(ticket)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl shadow-subtle hover:scale-105 transition-transform cursor-pointer group"
                        title="Click to enlarge QR"
                      >
                        <QRCodeSVG
                          value={
                            JSON.stringify({
                              ticketId: ticket.ticketId,
                              qrToken: ticket.qrToken,
                              eventId: ticket.event?._id,
                            })
                          }
                          size={110}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <button
                        onClick={() => setEnlargedTicket(ticket)}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <Maximize2 className="w-3 h-3" /> Enlarge QR
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Token: {ticket.qrToken?.slice(0, 8)}...
                    </span>
                    <button
                      onClick={() => handlePrint(ticket)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No digital tickets yet"
            description="When you register for approved events, your instant QR tickets will show up here."
            actionLabel="Browse Available Events"
            onAction={() => (window.location.href = '/events')}
          />
        )}

        {/* Enlarged QR Modal for Check-in scanning */}
        {enlargedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Venue Check-In QR
                </span>
                <button
                  onClick={() => setEnlargedTicket(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {enlargedTicket.event?.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {enlargedTicket.ticketId}
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl inline-block shadow-inner">
                <QRCodeSVG
                  value={
                    JSON.stringify({
                      ticketId: enlargedTicket.ticketId,
                      qrToken: enlargedTicket.qrToken,
                      eventId: enlargedTicket.event?._id,
                    })
                  }
                  size={200}
                  level="H"
                />
              </div>

              <p className="text-xs text-slate-500">
                Show this barcode to the event organizer at the registration desk.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

