import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MapPin, ArrowRight, ArrowLeft, School, Building, Route as RoadIcon, Home, Loader2,
  Camera, ImagePlus, X, ScanEye, Send
} from 'lucide-react';
import ProgressSteps from '../components/ProgressSteps.jsx';
import AIAnalysisCard from '../components/AIAnalysisCard.jsx';
import MapView from '../components/MapView.jsx';
import { aiService } from '../services/ai.js';
import { casesService } from '../services/cases.js';
import { useApp } from '../context/AppContext.jsx';
import { readAndCompressImage } from '../utils/image.js';
import { DEPARTMENT_NAMES } from '../utils/priorityScore.js';

const STEPS = ['Describe', 'AI Understanding', 'Location', 'Review & Submit'];

const CITY_CENTERS = {
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Thane: [19.2183, 72.9781]
};

const LOCATION_TAGS = [
  { key: 'near_school', label: 'Near a school', icon: School },
  { key: 'near_hospital', label: 'Near a hospital', icon: Building },
  { key: 'main_arterial_road', label: 'Main road', icon: RoadIcon },
  { key: 'residential_dense', label: 'Dense residential area', icon: Home }
];

export default function ReportRequest() {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Pune');
  const [ward, setWard] = useState('');
  const [locationTags, setLocationTags] = useState([]);
  const [location, setLocation] = useState({ lat: 18.5204, lng: 73.8567 });
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { pushToast } = useApp();
  const navigate = useNavigate();

  async function handlePhotoSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError('');
    setPhotoProcessing(true);
    try {
      const dataUrl = await readAndCompressImage(file);
      setPhotoDataUrl(dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoProcessing(false);
    }
  }

  function removePhoto() {
    setPhotoDataUrl(null);
    setPhotoAnalysis(null);
  }

  async function runAnalysis() {
    if (description.trim().length < 5) {
      setError('Please describe the issue in a few more words.');
      return;
    }
    setError('');
    setAnalyzing(true);
    try {
      const data = await aiService.analyzeText(description, locationTags);
      setAnalysis(data);
      if (photoDataUrl) {
        try {
          const imgResult = await aiService.analyzeImage(data.issueType);
          setPhotoAnalysis(imgResult);
        } catch (imgErr) {
          // Photo analysis is a bonus signal — don't block the flow if it fails.
        }
      }
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function toggleTag(key) {
    setLocationTags((tags) => (tags.includes(key) ? tags.filter((t) => t !== key) : [...tags, key]));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const data = await casesService.create({
        description,
        city,
        ward,
        location,
        locationTags,
        photoDataUrl: photoDataUrl || null
      });
      setResult(data);
      pushToast(data.duplicate ? 'Consolidated into an existing report.' : 'Request submitted successfully.', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-resolved-soft text-resolved text-2xl font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-ink">
          {result.duplicate ? 'Your report has been linked to an existing case' : 'Request submitted'}
        </h1>
        <p className="mt-2 text-ink-soft">{result.message || 'CitizenFirst AI has routed your request and assigned a priority score.'}</p>

        <div className="mt-6 rounded-card border border-border bg-bg p-5 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-ink-faint">Case ID</span>
            <span className="font-mono text-sm text-ink">{result.case.caseId}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-ink-faint">Status</span>
            <span className="text-sm font-medium text-ink">{result.case.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-faint">Priority</span>
            <span className="text-sm font-medium text-ink">{result.case.priorityBand} ({result.case.priorityScore}/100)</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(`/case/${encodeURIComponent(result.case.caseId)}`)}
            className="px-5 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
          >
            Track this case
          </button>
          <button
            onClick={() => { setResult(null); setStep(0); setDescription(''); setAnalysis(null); setPhotoDataUrl(null); setPhotoAnalysis(null); }}
            className="px-5 py-3 rounded-md border border-border text-ink text-sm font-semibold hover:bg-bg-subtle"
          >
            Report another issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink tracking-tight mb-1">Report a Request</h1>
      <p className="text-sm text-ink-soft mb-8">Tell us what's wrong — CitizenFirst AI handles the rest.</p>

      <ProgressSteps steps={STEPS} currentStep={step} />

      {error && <p className="mb-4 text-sm text-critical bg-critical-soft rounded-md p-3">{error}</p>}

      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Describe the issue</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="e.g. There is severe waterlogging near the school on MG Road, and the road surface is also damaged."
                className="w-full rounded-md border border-border px-3 py-2.5 text-sm bg-bg text-ink resize-none"
              />
              <button
                type="button"
                aria-label="Use voice input (demo)"
                className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-bg-subtle text-ink-soft hover:text-primary"
                onClick={() => pushToast('Voice input is a prototype affordance in this demo.', 'info')}
              >
                <Mic size={15} />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-faint">Available in English, हिन्दी and मराठी.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Add a photo (optional, but helps a lot)</label>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelected}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelected}
              className="hidden"
            />

            {!photoDataUrl ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={photoProcessing}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-md border border-dashed border-border text-sm text-ink-soft hover:border-primary/50 hover:text-primary disabled:opacity-60"
                >
                  <Camera size={16} /> Take photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoProcessing}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-md border border-dashed border-border text-sm text-ink-soft hover:border-primary/50 hover:text-primary disabled:opacity-60"
                >
                  {photoProcessing ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />} Upload photo
                </button>
              </div>
            ) : (
              <div className="relative inline-block">
                <img src={photoDataUrl} alt="Attached evidence" className="h-40 w-full sm:w-auto rounded-md border border-border object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                  className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center rounded-full bg-critical text-white shadow-panel"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <p className="mt-1.5 text-xs text-ink-faint">On a phone, "Take photo" opens your camera directly.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Does this location have extra context?</label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATION_TAGS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTag(key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm transition-colors ${
                    locationTags.includes(key)
                      ? 'border-primary bg-primary-soft text-primary font-medium'
                      : 'border-border text-ink-soft hover:border-ink-faint'
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
          >
            {analyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</> : <>Analyze with AI <ArrowRight size={16} /></>}
          </button>
        </div>
      )}

      {step === 1 && analysis && (
        <div className="space-y-5">
          <AIAnalysisCard analysis={analysis} />

          {photoDataUrl && (
            <div className="rounded-card border border-teal/25 bg-teal-soft/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-white">
                  <ScanEye size={14} />
                </span>
                <h3 className="text-sm font-semibold text-ink">Photo Analysis</h3>
                <span className="ml-auto text-[11px] text-ink-faint border border-border rounded px-1.5 py-0.5">
                  Prototype AI
                </span>
              </div>
              <div className="flex gap-4">
                <img src={photoDataUrl} alt="Attached evidence" className="h-24 w-24 rounded-md object-cover border border-border shrink-0" />
                {photoAnalysis ? (
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm flex-1">
                    <div>
                      <dt className="text-xs text-ink-faint">Detected</dt>
                      <dd className="font-semibold text-ink">{photoAnalysis.detected}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-faint">Confidence</dt>
                      <dd className="font-semibold text-ink">{Math.round(photoAnalysis.confidence * 100)}%</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-faint">Visual severity</dt>
                      <dd className="font-semibold text-ink">{photoAnalysis.potentialImpact}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-faint">Related cases nearby</dt>
                      <dd className="font-semibold text-ink">{photoAnalysis.relatedCases}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-ink-soft flex-1">Photo attached — visual analysis wasn't available this time, but your photo will still be attached to the case.</p>
                )}
              </div>
              {analysis?.departments?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-teal/20 flex items-start gap-2">
                  <Send size={14} className="text-teal shrink-0 mt-0.5" />
                  <p className="text-xs text-ink-soft">
                    This photo will be sent along with your report to{' '}
                    <span className="font-semibold text-ink">
                      {analysis.departments.map((code) => DEPARTMENT_NAMES[code] || code).join(' and ')}
                    </span>
                    {analysis.departments.length > 1 ? ' — both departments will see it.' : ' as evidence.'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md border border-border text-ink text-sm font-semibold hover:bg-bg-subtle">
              <ArrowLeft size={15} /> Edit description
            </button>
            <button onClick={() => setStep(2)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
              Confirm & continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">City</label>
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setLocation({ lat: CITY_CENTERS[e.target.value][0], lng: CITY_CENTERS[e.target.value][1] }); }}
                className="w-full rounded-md border border-border px-3 py-2.5 text-sm bg-bg text-ink"
              >
                {Object.keys(CITY_CENTERS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Ward / Area (optional)</label>
              <input
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Ward 14"
                className="w-full rounded-md border border-border px-3 py-2.5 text-sm bg-bg text-ink"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink mb-1.5">
              <MapPin size={14} /> Pinpoint the exact location
            </label>
            <MapView
              center={CITY_CENTERS[city]}
              zoom={12}
              height={340}
              pickable
              pickedLocation={location}
              onPick={setLocation}
            />
            <p className="mt-1.5 text-xs text-ink-faint">Tap on the map to place the marker at the exact spot.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md border border-border text-ink text-sm font-semibold hover:bg-bg-subtle">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
              Review <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-card border border-border bg-bg p-5 space-y-3 text-sm">
            {photoDataUrl && (
              <img src={photoDataUrl} alt="Attached evidence" className="h-32 w-full object-cover rounded-md border border-border mb-1" />
            )}
            <SummaryRow label="Description" value={description} />
            <SummaryRow label="Detected issue" value={analysis?.issueLabel} />
            <SummaryRow label="Location" value={`${city}${ward ? `, ${ward}` : ''}`} />
            <SummaryRow label="Coordinates" value={`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`} />
            <SummaryRow label="Context tags" value={locationTags.length ? locationTags.join(', ').replace(/_/g, ' ') : 'None'} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md border border-border text-ink text-sm font-semibold hover:bg-bg-subtle">
              <ArrowLeft size={15} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="text-ink font-medium">{value}</p>
    </div>
  );
}
