import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Award,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';

export const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/my');
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownloadPDF = async (cert) => {
    try {
      setDownloadingId(cert._id);
      const res = await api.get(`/certificates/${cert._id}/download`, {
        responseType: 'blob',
      });

      // Create blob link & trigger download
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${cert.certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download certificate PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout title="Certificates of Participation">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Earned Certificates</h2>
          <p className="text-xs text-slate-500">
            Official credentials automatically generated upon verified event attendance.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-56 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            <div className="h-56 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-premium card-hover-effect flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {cert.certificateId}
                    </span>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Credential
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {cert.eventTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Awarded to <strong className="text-slate-800">{cert.recipientName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Issued by {cert.organizerName || 'Event Organizing Committee'} on{' '}
                    {new Date(cert.issuedDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(cert)}
                    disabled={downloadingId === cert._id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-all disabled:opacity-70"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === cert._id ? 'Generating PDF...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No certificates yet"
            description="Certificates are automatically issued as soon as you are checked in at an event by an organizer."
            actionLabel="View Registered Events"
            onAction={() => (window.location.href = '/my-registrations')}
          />
        )}

        {/* Certificate Visual Preview Modal */}
        {previewCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 space-y-6">
              <button
                onClick={() => setPreviewCert(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative Certificate Sheet */}
              <div className="border-4 border-double border-brand-200 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-widest">
                  <Award className="w-4 h-4" />
                  <span>EventX Verified Academic Credential</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Certificate of Participation
                </h2>

                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  This certifies that
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-brand-700 border-b border-brand-200 inline-block px-8 pb-1">
                  {previewCert.recipientName}
                </h3>

                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  has actively participated in and successfully completed all designated sessions of{' '}
                  <strong className="text-slate-900 font-semibold">{previewCert.eventTitle}</strong>.
                </p>

                <div className="pt-6 grid grid-cols-2 gap-4 border-t border-slate-200 text-left text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Organized By</p>
                    <p className="font-bold text-slate-900">{previewCert.organizerName}</p>
                    <p className="text-[10px] text-slate-500">Event Lead</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      Verification Code
                    </p>
                    <p className="font-mono font-bold text-brand-600">
                      {previewCert.verificationCode || 'A92F4D7B'}
                    </p>
                    <p className="text-[10px] text-slate-400">{previewCert.certificateId}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewCert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(previewCert)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Official PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

