import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BusFront, CalendarDays, CheckCircle2, Clock3, MapPin, Send, Users, X } from 'lucide-react';
import '../styles/PageTitles.css';
import './TransportPage.css';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const EMPTY_FORM = {
  pickup_location: '', destination: '', travel_date: '', work_start: '08:00', work_end: '17:00', passengers: 1, details: '',
};

async function transportRequest(path, options = {}) {
  const token = localStorage.getItem('shefarms_access_token');
  if (!token) throw new Error('Please sign in to submit or view your transport requests.');
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error(`Cannot reach the SheFarms backend at ${API_BASE_URL}. Start the backend and try again.`);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || `Transport request failed (HTTP ${response.status}).`);
  return body;
}

const dateLabel = (value) => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export default function TransportPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await transportRequest('/transport/requests');
      setRequests(result.items || []);
      setError('');
    } catch (requestError) {
      setRequests([]);
      setError(requestError.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await transportRequest('/transport/requests', { method: 'POST', body: JSON.stringify({ ...form, passengers: Number(form.passengers) }) });
      setForm(EMPTY_FORM);
      setSuccess('Your transport request has been sent to the cooperative. It is pending confirmation.');
      await refresh();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };

  const cancel = async (id) => {
    try {
      await transportRequest(`/transport/requests/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (requestError) { setError(requestError.message); }
  };

  return (
    <main className="transport-page">
      <header className="transport-heading">
        <div><span className="transport-eyebrow">FIELD JOURNEY PLANNING</span><h1 className="page-main-title"><BusFront aria-hidden="true" />Request transportation</h1><p>Share where and when you need a ride to the field. The cooperative can review your request and coordinate a bus.</p></div>
        <div className="transport-heading-mark"><BusFront size={28} /><span>Cooperative transport</span></div>
      </header>

      {error && <div className="transport-message error" role="alert"><AlertCircle size={19} />{error}</div>}
      {success && <div className="transport-message success" role="status"><CheckCircle2 size={19} />{success}</div>}

      <div className="transport-layout">
        <section className="transport-card">
          <div className="transport-card-heading"><span className="transport-step">01</span><div><h2>Journey details</h2><p>Tell us where to pick you up and which field you are going to.</p></div></div>
          <form className="transport-form" onSubmit={submit}>
            <label className="transport-field transport-wide">Pickup location<input required minLength="2" maxLength="240" name="pickup_location" value={form.pickup_location} onChange={setField} placeholder="Village, neighborhood, or a clear meeting point" /></label>
            <label className="transport-field transport-wide">Field destination<input required minLength="2" maxLength="240" name="destination" value={form.destination} onChange={setField} placeholder="Farm or field name and location" /></label>
            <label className="transport-field">Travel date<input required type="date" min={new Date().toISOString().slice(0, 10)} name="travel_date" value={form.travel_date} onChange={setField} /></label>
            <label className="transport-field">Number of passengers<input required type="number" min="1" max="100" name="passengers" value={form.passengers} onChange={setField} /></label>
            <label className="transport-field">Work starts<input required type="time" name="work_start" value={form.work_start} onChange={setField} /></label>
            <label className="transport-field">Work ends<input required type="time" name="work_end" value={form.work_end} onChange={setField} /></label>
            <label className="transport-field transport-wide">Additional details <span className="transport-optional">Optional</span><textarea maxLength="1200" rows="3" name="details" value={form.details} onChange={setField} placeholder="Accessibility needs, extra pickup instructions, or other details" /></label>
            <div className="transport-form-footer"><p>Your request is sent to the cooperative for confirmation. A submission does not mean a bus is already booked.</p><button className="transport-submit" type="submit" disabled={saving}><Send size={16} />{saving ? 'Sending request…' : 'Send transport request'}</button></div>
          </form>
        </section>

        <aside className="transport-side-card"><span className="transport-side-icon"><BusFront size={22} /></span><h2>Plan your field trip</h2><p>Request transport with enough notice and include a recognizable pickup point to help the driver find you.</p><div className="transport-info-row"><MapPin size={17} /><span>Clear pickup and field locations</span></div><div className="transport-info-row"><Clock3 size={17} /><span>Your work start and end times</span></div><div className="transport-info-row"><Users size={17} /><span>How many seats are needed</span></div><div className="transport-note"><CalendarDays size={17} /><span>Requests remain pending until the cooperative confirms transport arrangements.</span></div></aside>
      </div>

      <section className="transport-requests-section"><div className="transport-list-heading"><div><span className="transport-eyebrow">YOUR ACTIVITY</span><h2>My transport requests</h2></div><span className="transport-count">{requests.length} {requests.length === 1 ? 'request' : 'requests'}</span></div>
        {loading ? <div className="transport-empty">Loading your requests…</div> : requests.length === 0 ? <div className="transport-empty">No transport requests yet. Submit a journey request above to get started.</div> :
          <div className="transport-request-list">{requests.map((item) => <article className="transport-request-item" key={item.id}>
            <span className="transport-request-icon"><BusFront size={19} /></span><div className="transport-request-main"><div className="transport-request-title"><strong>{item.destination}</strong><span className={`transport-status ${item.status}`}>{item.status}</span></div><p><MapPin size={14} />{item.pickup_location} <span aria-hidden="true">→</span> {item.destination}</p><p><CalendarDays size={14} />{dateLabel(item.travel_date)}<Clock3 size={14} />{item.work_start}–{item.work_end}<Users size={14} />{item.passengers} {item.passengers === 1 ? 'passenger' : 'passengers'}</p>{item.details && <p className="transport-detail-text">{item.details}</p>}</div>
            {item.status === 'pending' && <button className="transport-cancel" type="button" onClick={() => cancel(item.id)} aria-label="Cancel request"><X size={16} />Cancel</button>}
          </article>)}</div>}
      </section>
    </main>
  );
}
