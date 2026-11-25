import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { soilSensorRequest } from '../api/soilSensor';
import './CalendarPage.css';
import '../styles/PageTitles.css';

const EMPTY_FORM = {
  title: '', description: '', event_type: 'task', start_at: '', end_at: '', location: '',
  sensor_id: 'virtual-sensor-01', field_name: '', plot_name: '', status: 'planned',
};

const toInputDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toIso = (value) => value ? new Date(value).toISOString() : null;
const sameDay = (first, second) => first.getFullYear() === second.getFullYear()
  && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();

const eventStatus = (status) => ({ planned: 'Planned', in_progress: 'In progress', completed: 'Completed', done: 'Done', failed: 'Failed', cancelled: 'Cancelled' }[status] || status);

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const visibleRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (viewMode === 'month') {
      start.setDate(1); start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0); end.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay()); start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime()); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
    }
    return { start, end };
  }, [currentDate, viewMode]);

  const refreshEvents = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ start: visibleRange.start.toISOString(), end: visibleRange.end.toISOString() });
      const result = await soilSensorRequest(`/calendar/events?${query}`);
      setEvents(result.items || []);
      setConnected(true);
      setError('');
    } catch (requestError) {
      setEvents([]);
      setConnected(false);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [visibleRange]);

  useEffect(() => {
    refreshEvents();
    const interval = window.setInterval(() => refreshEvents(), 5000);
    return () => window.clearInterval(interval);
  }, [refreshEvents]);

  const eventsForDate = (date) => events.filter((event) => sameDay(new Date(event.start_at), date));
  const selectedEvents = eventsForDate(selectedDate);

  const moveDate = (direction) => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + direction);
    else if (viewMode === 'week') next.setDate(next.getDate() + direction * 7);
    else next.setDate(next.getDate() + direction);
    setCurrentDate(next);
    setSelectedDate(next);
  };

  const openNewForm = (eventType = 'task') => {
    const start = new Date(selectedDate);
    start.setHours(9, 0, 0, 0);
    setEditingId(null);
    setForm({ ...EMPTY_FORM, event_type: eventType, start_at: toInputDateTime(start.toISOString()) });
    setShowForm(true);
  };

  const openEditForm = (event) => {
    setEditingId(event.id);
    setForm({
      ...EMPTY_FORM,
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_at: toInputDateTime(event.start_at),
      end_at: toInputDateTime(event.end_at),
      location: event.location || '',
      sensor_id: event.sensor_id || 'virtual-sensor-01',
      field_name: event.field_name || '',
      plot_name: event.plot_name || '',
      status: ['planned', 'in_progress', 'done', 'cancelled'].includes(event.status) ? event.status : 'planned',
    });
    setShowForm(true);
  };

  const saveEvent = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    const payload = {
      ...form,
      start_at: toIso(form.start_at),
      end_at: toIso(form.end_at),
      status: form.status,
      sensor_id: form.event_type === 'sensor_run' ? form.sensor_id : null,
      field_name: form.event_type === 'sensor_run' ? form.field_name : null,
      plot_name: form.event_type === 'sensor_run' ? form.plot_name : null,
    };
    try {
      await soilSensorRequest(editingId ? `/calendar/events/${editingId}` : '/calendar/events', {
        method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload),
      });
      setShowForm(false);
      await refreshEvents();
    } catch (requestError) {
      setError(requestError.message);
    } finally { setSaving(false); }
  };

  const removeEvent = async (eventId) => {
    if (!window.confirm('Delete this calendar event?')) return;
    try {
      await soilSensorRequest(`/calendar/events/${eventId}`, { method: 'DELETE' });
      await refreshEvents();
    } catch (requestError) { setError(requestError.message); }
  };

  const retryEvent = async (eventId) => {
    try {
      await soilSensorRequest(`/calendar/events/${eventId}/retry`, { method: 'POST' });
      await refreshEvents();
    } catch (requestError) { setError(requestError.message); }
  };

  const shiftMonth = (monthOffset, day) => new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day);
  const renderMonth = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let index = 0; index < firstDay; index += 1) cells.push(<div key={`empty-${index}`} className="calendar-day empty" />);
    for (let day = 1; day <= days; day += 1) {
      const date = shiftMonth(0, day);
      const dayEvents = eventsForDate(date);
      cells.push(
        <button type="button" key={day} className={`calendar-day ${sameDay(selectedDate, date) ? 'selected' : ''} ${sameDay(new Date(), date) ? 'today' : ''}`} onClick={() => setSelectedDate(date)}>
          <span className="day-number">{day}</span>
          <span className="calendar-event-dots">
            {dayEvents.slice(0, 3).map((item) => <i key={item.id} className={`event-dot ${item.event_type}`} title={item.title} />)}
            {dayEvents.length > 3 && <small>+{dayEvents.length - 3}</small>}
          </span>
        </button>,
      );
    }
    return cells;
  };

  const weekDays = useMemo(() => {
    const sunday = new Date(currentDate);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(sunday); day.setDate(sunday.getDate() + index); return day;
    });
  }, [currentDate]);

  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const title = viewMode === 'day' ? selectedDate.toLocaleDateString('en-US', { dateStyle: 'full' })
    : viewMode === 'week' ? `Week of ${weekDays[0].toLocaleDateString()} – ${weekDays[6].toLocaleDateString()}` : monthTitle;

  return (
    <div className="calendar-page">
      <div className="calendar-page-inner">
        <div className="tasks-header calendar-page-title">
          <div><h1 className="page-main-title"><Calendar className="w-7 h-7 title-icon" />Calendar & Planning</h1><p>Tasks, activities, and scheduled virtual soil readings.</p></div>
          <div className="calendar-top-actions">
            <button className="btn-secondary" onClick={() => openNewForm('task')}><Plus size={17} /> New task</button>
            <button className="btn-primary" onClick={() => openNewForm('activity')}><Plus size={17} /> New activity</button>
            <button className="btn-primary" onClick={() => openNewForm('sensor_run')}><Activity size={17} /> Schedule soil reading</button>
          </div>
        </div>

        {!connected && <div className="calendar-api-alert" role="alert">{error || 'Connect the soil simulator on port 8001 to load calendar data.'}</div>}
        {loading && <div className="calendar-api-alert">Loading calendar events…</div>}

        <div className="calendar-main">
          <div className="calendar-content">
            <div className="calendar-header-section">
              <div className="calendar-nav">
                <button className="nav-btn" onClick={() => moveDate(-1)} aria-label="Previous"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="calendar-month-year">{title}</h2>
                <button className="nav-btn" onClick={() => moveDate(1)} aria-label="Next"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <div className="view-controls">
                {['month', 'week', 'day'].map((view) => <button key={view} className={`view-btn ${viewMode === view ? 'active' : ''}`} onClick={() => setViewMode(view)}>{view[0].toUpperCase() + view.slice(1)}</button>)}
              </div>
            </div>

            <div className="calendar-container">
              {viewMode === 'month' && <><div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="calendar-weekday">{day}</div>)}</div><div className="calendar-days-grid">{renderMonth()}</div></>}
              {viewMode === 'week' && <div className="calendar-week-grid">{weekDays.map((day) => <button type="button" key={day.toISOString()} className={`calendar-week-day ${sameDay(selectedDate, day) ? 'selected' : ''}`} onClick={() => setSelectedDate(day)}><strong>{day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</strong>{eventsForDate(day).map((item) => <span key={item.id} className={`calendar-week-event ${item.event_type}`}>{item.title}</span>)}</button>)}</div>}
              {viewMode === 'day' && <div className="calendar-day-view"><h3>{selectedDate.toLocaleDateString('en-US', { dateStyle: 'full' })}</h3><EventList events={selectedEvents} onEdit={openEditForm} onDelete={removeEvent} onRetry={retryEvent} /></div>}
            </div>

            {viewMode !== 'day' && <section className="selected-date-tasks">
              <div className="calendar-selected-heading"><h3 className="tasks-title">Events for {selectedDate.toLocaleDateString('en-US', { dateStyle: 'full' })}</h3><button className="calendar-refresh-btn" onClick={refreshEvents} disabled={loading}><RefreshCw size={15} /> Refresh</button></div>
              {selectedEvents.length ? <EventList events={selectedEvents} onEdit={openEditForm} onDelete={removeEvent} onRetry={retryEvent} /> : <p className="calendar-empty">{connected ? 'No events on this date.' : 'Calendar events are unavailable while the simulator API is offline.'}</p>}
            </section>}
          </div>
        </div>
      </div>

      {showForm && <div className="modal-overlay" onClick={() => setShowForm(false)}><form className="modal-content calendar-event-form" onClick={(event) => event.stopPropagation()} onSubmit={saveEvent}>
        <div className="modal-header"><h3 className="modal-title">{editingId ? 'Edit event' : 'Create calendar event'}</h3><button type="button" className="modal-close" onClick={() => setShowForm(false)}>×</button></div>
        <div className="modal-body calendar-form-grid">
          <label>Title<input className="form-input" required maxLength="160" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Type<select className="form-select" value={form.event_type} onChange={(event) => setForm({ ...form, event_type: event.target.value })}><option value="task">Task</option><option value="activity">Activity</option><option value="sensor_run">Scheduled virtual soil reading</option></select></label>
          {editingId && form.event_type !== 'sensor_run' && <label>Status<select className="form-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="done">Done</option><option value="cancelled">Cancelled</option></select></label>}
          <label>Start date and time<input className="form-input" type="datetime-local" required value={form.start_at} onChange={(event) => setForm({ ...form, start_at: event.target.value })} /></label>
          <label>End date and time<input className="form-input" type="datetime-local" value={form.end_at} onChange={(event) => setForm({ ...form, end_at: event.target.value })} /></label>
          <label className="calendar-form-wide">Location<input className="form-input" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
          <label className="calendar-form-wide">Description<textarea className="form-textarea" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          {form.event_type === 'sensor_run' && <>
            <label>Sensor ID<input className="form-input" required value={form.sensor_id} onChange={(event) => setForm({ ...form, sensor_id: event.target.value })} /></label>
            <label>Field<input className="form-input" value={form.field_name} onChange={(event) => setForm({ ...form, field_name: event.target.value })} /></label>
            <label>Plot<input className="form-input" value={form.plot_name} onChange={(event) => setForm({ ...form, plot_name: event.target.value })} /></label>
            <p className="calendar-form-note calendar-form-wide">This creates a planned event. It becomes a simulated measurement only after the simulator runs it successfully.</p>
          </>}
          {error && <p className="calendar-api-alert calendar-form-wide" role="alert">{error}</p>}
        </div>
        <div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary" disabled={saving || !connected}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create event'}</button></div>
      </form></div>}
    </div>
  );
};

function EventList({ events, onEdit, onDelete, onRetry }) {
  if (!events.length) return <p className="calendar-empty">No events for this date.</p>;
  return <div className="calendar-event-list">{events.map((event) => <article className={`calendar-event-card ${event.event_type}`} key={event.id}>
    <div className="calendar-event-icon">{event.event_type === 'sensor_run' ? <Activity size={18} /> : <Calendar size={18} />}</div>
    <div className="calendar-event-info"><div className="calendar-event-title">{event.title}<span className={`calendar-event-status ${event.status}`}>{eventStatus(event.status)}</span></div>
      <p><Clock size={14} /> {new Date(event.start_at).toLocaleString()}{event.end_at ? ` – ${new Date(event.end_at).toLocaleTimeString()}` : ''}</p>
      {event.location && <p><MapPin size={14} /> {event.location}</p>}
      {event.event_type === 'sensor_run' && <p>Virtual simulated run · {event.field_name || 'Field unspecified'} / {event.plot_name || 'Plot unspecified'}{event.reading_id ? ` · Reading #${event.reading_id}` : ''}</p>}
      {event.description && <p>{event.description}</p>}{event.execution_error && <p className="calendar-execution-error">{event.execution_error}</p>}
    </div>
    <div className="calendar-event-actions">{event.status !== 'completed' && event.status !== 'in_progress' && <button type="button" onClick={() => onEdit(event)} aria-label="Edit event">Edit</button>}{event.status === 'failed' && <button type="button" onClick={() => onRetry(event.id)}>Retry</button>}<button type="button" onClick={() => onDelete(event.id)} aria-label="Delete event"><Trash2 size={16} /></button></div>
  </article>)}</div>;
}

export default CalendarPage;
