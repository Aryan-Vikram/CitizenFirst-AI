import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Clock, ThumbsUp, ThumbsDown, MessageCircle, Camera, Loader2, Images } from 'lucide-react';
import CaseTimeline from '../components/CaseTimeline.jsx';
import PriorityScoreCard from '../components/PriorityScoreCard.jsx';
import { DepartmentBadge, PriorityBadge } from '../components/PriorityBadge.jsx';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import MapView from '../components/MapView.jsx';
import { casesService } from '../services/cases.js';
import { formatDate } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { readAndCompressImage } from '../utils/image.js';

export default function CaseDetails() {
  const { caseId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { user } = useAuth();
  const { pushToast } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await casesService.get(caseId);
      setRecord(data.case);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { load(); }, [load]);

  async function submitFeedback(resolved) {
    try {
      const data = await casesService.submitFeedback(caseId, { resolved });
      setRecord(data.case);
      setFeedbackSent(true);
      pushToast(resolved === 'yes' ? 'Thanks for confirming!' : 'Reopened — a department will follow up.', 'info');
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }

  const isOfficerRole = user && ['field_officer', 'department_admin', 'government_admin'].includes(user.role);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const evidenceInputRef = useRef(null);

  async function handleEvidenceUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      pushToast('Please choose an image file.', 'error');
      return;
    }
    setUploadingEvidence(true);
    try {
      const dataUrl = await readAndCompressImage(file);
      const stage = record.status === 'Resolution Submitted' || record.status === 'AI Verification' ? 'after' : 'before';
      const data = await casesService.addEvidence(caseId, { type: 'photo', url: dataUrl, stage });
      setRecord(data.case);
      pushToast('Photo attached to case.', 'success');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setUploadingEvidence(false);
    }
  }

  const NEXT_STATUS = {
    Routed: 'Department Accepted',
    'Department Accepted': 'Field Inspection',
    'Field Inspection': 'Work in Progress',
    'Work in Progress': 'Resolution Submitted',
    'Resolution Submitted': 'AI Verification',
    'AI Verification': 'Resolved'
  };

  async function advanceStatus() {
    if (!record || !NEXT_STATUS[record.status]) return;
    setStatusUpdating(true);
    try {
      const data = await casesService.updateStatus(caseId, NEXT_STATUS[record.status], 'Updated by officer');
      setRecord(data.case);
      pushToast(`Status updated to ${data.case.status}.`, 'success');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-content px-4 py-10"><LoadingState rows={4} /></div>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-content px-4 py-10">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }
  if (!record) return null;

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs text-ink-faint">{record.caseId}</span>
          <h1 className="text-2xl font-bold text-ink tracking-tight mt-1">{record.title}</h1>
          <div className="mt-2 flex items-center gap-4 flex-wrap text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1"><MapPin size={14} /> {record.city}{record.ward ? `, ${record.ward}` : ''}</span>
            <span className="inline-flex items-center gap-1"><Users size={14} /> {record.citizenReports} report(s)</span>
            <span className="inline-flex items-center gap-1"><Clock size={14} /> Filed {formatDate(record.firstReportedAt)}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {record.departments.map((d) => <DepartmentBadge key={d} code={d} />)}
          </div>
        </div>
        <PriorityBadge band={record.priorityBand} score={record.priorityScore} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-ink mb-4">Description</h2>
            <p className="text-sm text-ink-soft leading-relaxed rounded-card border border-border bg-bg-subtle p-4">
              {record.description}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-ink mb-4">Case timeline</h2>
            <div className="rounded-card border border-border bg-bg p-5">
              <CaseTimeline status={record.status} timeline={record.timeline} />
            </div>
          </section>

          {record.evidence?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-1.5">
                <Images size={15} /> Photo evidence
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {record.evidence.filter((ev) => ev.type === 'photo' && ev.url).map((ev, i) => (
                  <div key={i} className="rounded-md overflow-hidden border border-border">
                    <img src={ev.url} alt={`${ev.stage} evidence`} className="h-32 w-full object-cover" />
                    <div className="px-2 py-1 bg-bg-subtle text-[11px] text-ink-soft capitalize">{ev.stage}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isOfficerRole && (
            <section className="rounded-card border border-border bg-bg p-5">
              <h2 className="text-sm font-semibold text-ink mb-1">Attach evidence photo</h2>
              <p className="text-xs text-ink-soft mb-3">
                Upload a "before" photo during inspection, or an "after" photo once work is complete.
              </p>
              <input ref={evidenceInputRef} type="file" accept="image/*" capture="environment" onChange={handleEvidenceUpload} className="hidden" />
              <div className="flex gap-2">
                <button
                  onClick={() => evidenceInputRef.current?.click()}
                  disabled={uploadingEvidence}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm text-ink-soft hover:border-primary/50 hover:text-primary disabled:opacity-60"
                >
                  {uploadingEvidence ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />} Take / upload photo
                </button>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-ink mb-4">Location</h2>
            <MapView cases={[record]} center={[record.location.lat, record.location.lng]} zoom={14} height={320} />
          </section>

          {record.status === 'Resolved' && !feedbackSent && !record.citizenFeedback && (
            <section className="rounded-card border border-primary/25 bg-primary-soft/40 p-5">
              <h2 className="text-sm font-semibold text-ink mb-1 flex items-center gap-1.5">
                <MessageCircle size={15} /> Is this actually fixed?
              </h2>
              <p className="text-sm text-ink-soft mb-4">Your confirmation closes the loop — or reopens it if it isn't.</p>
              <div className="flex gap-3">
                <button onClick={() => submitFeedback('yes')} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-resolved text-white text-sm font-semibold">
                  <ThumbsUp size={15} /> Yes, resolved
                </button>
                <button onClick={() => submitFeedback('no')} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-critical text-critical text-sm font-semibold">
                  <ThumbsDown size={15} /> No, reopen it
                </button>
              </div>
            </section>
          )}

          {isOfficerRole && record.status !== 'Resolved' && NEXT_STATUS[record.status] && (
            <section className="rounded-card border border-border bg-bg p-5">
              <h2 className="text-sm font-semibold text-ink mb-3">Officer actions</h2>
              <button
                onClick={advanceStatus}
                disabled={statusUpdating}
                className="px-4 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
              >
                {statusUpdating ? 'Updating…' : `Advance to "${NEXT_STATUS[record.status]}"`}
              </button>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <PriorityScoreCard score={record.priorityScore} band={record.priorityBand} factors={record.priorityFactors} />
          {record.isDuplicateCluster && (
            <div className="rounded-card border border-teal/30 bg-teal-soft p-4 text-sm text-ink">
              <p className="font-semibold mb-1">Consolidated report</p>
              <p className="text-ink-soft">
                {record.citizenReports} citizens reported this same issue. Reports were automatically merged into
                this one case instead of creating duplicates.
              </p>
            </div>
          )}
          <div className="rounded-card border border-border bg-bg p-4 text-sm">
            <p className="text-xs text-ink-faint mb-1">SLA target</p>
            <p className="font-medium text-ink">{record.slaHours} hours</p>
          </div>
          <Link to="/my-requests" className="block text-center text-sm text-primary font-medium hover:underline">
            ← Back to my requests
          </Link>
        </div>
      </div>
    </div>
  );
}
