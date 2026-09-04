import React, { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel.jsx';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import { notificationsService } from '../services/notifications.js';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationsService.list();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id) {
    try {
      await notificationsService.markRead(id);
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      // silently ignore in demo
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Bell size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">Notifications</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">Updates on your requests and assigned cases.</p>

      {loading && <LoadingState rows={4} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && (
        <div className="rounded-card border border-border bg-bg px-4">
          <NotificationPanel notifications={notifications} onMarkRead={markRead} />
        </div>
      )}
    </div>
  );
}
