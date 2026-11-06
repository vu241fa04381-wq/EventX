import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Keyboard,
  ArrowRight,
  Users,
  Award,
  RefreshCw,
} from 'lucide-react';

export const QRScannerPage = () => {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await api.get('/events/my/organized');
        if (res.data.success) {
          setEvents(res.data.events || []);
          if (!selectedEventId && res.data.events.length > 0) {
            setSelectedEventId(res.data.events[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchMyEvents();
  }, []);

  const handleVerifyToken = async (token) => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await api.post('/tickets/checkin', {
        token: token.trim(),
        eventId: selectedEventId || undefined,
      });

      if (res.data.success && res.data.verified) {
        setVerificationResult({
          status: 'success',
          message: res.data.message,
          participant: res.data.participant,
          ticket: res.data.ticket,
          certificateId: res.data.certificateId,
        });
        toast.success(`Check-in verified for ${res.data.participant?.name}!`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.alreadyCheckedIn) {
        setVerificationResult({
          status: 'already_used',
          message: data.message,
          ticket: data.ticket,
          participant: data.ticket?.user,
        });
        toast.error('Ticket has already been used!');
      } else {
        setVerificationResult({
          status: 'invalid',
          message: data?.message || 'Invalid ticket token or unauthorized scan.',
          ticket: data?.ticket,
        });
        toast.error(data?.message || 'Check-in validation failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVerifyToken(manualCode);
  };

  // Start Camera QR Scanner
  const startCameraScanner = () => {
    setCameraActive(true);
    setTimeout(() => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5QrCode;

        html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            console.log('Decoded QR:', decodedText);
            handleVerifyToken(decodedText);
            stopCameraScanner();
          },
          (error) => {
            // Scanner scanning frame, ignore continuous frame logs
          }
        );
      } catch (err) {
        console.error('Camera initialization error:', err);
        toast.error('Could not access camera. Please check permissions or use manual entry.');
        setCameraActive(false);
      }
    }, 200);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current.clear();
          scannerRef.current = null;
          setCameraActive(false);
        })
        .catch((err) => {
          console.error('Error stopping camera:', err);
          setCameraActive(false);
        });
    } else {
      setCameraActive(false);
    }
  };

  const resetScanner = () => {
    setVerificationResult(null);
    setManualCode('');
  };

  return (
    <DashboardLayout title="Ticket Verification Scanner">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">QR Check-In Terminal</h2>
          <p className="text-xs text-slate-500">
            Verify participant digital passes and unlock attendance certificates automatically.
          </p>
        </div>

        {/* Event Scope Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Active Event Roster
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Any Organized Event (Automatic Lookup)</option>
              {events.map((evt) => (
                <option key={evt._id} value={evt._id}>
                  {evt.title} ({evt.registeredCount}/{evt.capacity})
                </option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <Link
              to={`/organizer/events/${selectedEventId}/participants`}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 self-start sm:self-end pb-2"
            >
              <span>View Attendee Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Verification Result Banner (Instant Real-Time Card) */}
        {verificationResult && (
          <div
            className={`p-6 rounded-3xl border shadow-premium animate-in zoom-in-95 space-y-4 ${
              verificationResult.status === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : verificationResult.status === 'already_used'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {verificationResult.status === 'success' && (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                )}
                {verificationResult.status === 'already_used' && (
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                )}
                {verificationResult.status === 'invalid' && (
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <XCircle className="w-7 h-7" />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-extrabold">
                    {verificationResult.status === 'success' && 'Admission Verified! ✅'}
                    {verificationResult.status === 'already_used' && 'Ticket Already Used! ⚠️'}
                    {verificationResult.status === 'invalid' && 'Invalid / Rejected Ticket ❌'}
                  </h3>
                  <p className="text-xs opacity-90">{verificationResult.message}</p>
                </div>
              </div>

              <button
                onClick={resetScanner}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-bold text-slate-800 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Next Scan
              </button>
            </div>

            {/* Attendee Info Card if found */}
            {verificationResult.participant && (
              <div className="p-4 rounded-2xl bg-white/90 border border-white/40 shadow-xs space-y-2 text-slate-800">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Participant
                    </span>
                    <p className="font-bold text-slate-900">
                      {verificationResult.participant.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      College
                    </span>
                    <p className="font-semibold text-slate-800">
                      {verificationResult.participant.college || 'Apex Tech'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Department
                    </span>
                    <p className="font-semibold text-slate-800">
                      {verificationResult.participant.department || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Ticket ID
                    </span>
                    <p className="font-mono font-bold text-brand-600">
                      {verificationResult.ticket?.ticketId ||
                        verificationResult.participant.ticketId}
                    </p>
                  </div>
                </div>

                {verificationResult.certificateId && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>
                      Official Certificate of Participation issued: #{verificationResult.certificateId}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scanner Terminal Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Camera Scanner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Live Camera QR Scanner</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Camera Feed
              </span>
            </div>

            {/* Video Container */}
            <div className="relative aspect-square max-h-72 w-full rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-white">
              <div id="qr-reader-container" className="w-full h-full" />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2 bg-slate-900/95">
                  <QrCode className="w-12 h-12 text-slate-500" />
                  <p className="text-xs text-slate-400">
                    Camera is standby. Click below to activate webcam or mobile lens.
                  </p>
                </div>
              )}
            </div>

            <div>
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Camera Scan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Stop Camera
                </button>
              )}
            </div>
          </div>

          {/* Box 2: Manual Ticket Code Input */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                <Keyboard className="w-4 h-4 text-violet-600" />
                <span>Manual Token / Ticket Entry</span>
              </div>
              <p className="text-xs text-slate-500">
                Type or paste the ticket code printed on student pass or read by laser barcode gun.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 my-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ticket ID or QR Token
                </label>
                <input
                  type="text"
                  required
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. EVTX-84192-3021 or 64-char token"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Sample Quick Demo buttons */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <p className="font-semibold text-slate-700 text-[11px]">
                  Sample Demo Ticket Codes to test:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setManualCode('EVTX-84192-3021')}
                    className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[10px] text-brand-600 hover:bg-brand-50"
                  >
                    EVTX-84192-3021 (HackNova - Ready)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualCode('EVTX-98214-4192')}
                    className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[10px] text-amber-600 hover:bg-amber-50"
                  >
                    EVTX-98214-4192 (Already Used)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying Ticket...' : 'Verify & Check-In Attendee'}
              </button>
            </form>

            <div className="text-[11px] text-slate-400 text-center">
              Backed by server-side cryptographic token validation.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

