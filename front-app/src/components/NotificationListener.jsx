import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import notificationService from '../services/NotificationService';

const POLL_INTERVAL_MS = 8000; // 8s
const STORAGE_KEY = 'seen_notification_ids_v1';

function loadSeenIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveSeenIds(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export default function NotificationListener() {
  const svcRef = useRef(null);
  const timerRef = useRef(null);
  const seenRef = useRef(loadSeenIds());

  useEffect(() => {
    // Use the singleton instance exported by NotificationService.js
    svcRef.current = notificationService;

    async function checkNewNotifications() {
      try {
        const list = await svcRef.current.getUnreadNotifications();
        if (!Array.isArray(list)) return;

        // Détecter les nouvelles notifications non encore vues
        const newOnes = list.filter(n => !seenRef.current.has(String(n.id)));
        if (newOnes.length > 0) {
          // Afficher un toast pour chaque nouvelle notification d'assignation (ou toutes selon besoin)
          newOnes.forEach(n => {
            const title = n.title || 'Nouvelle notification';
            const message = n.message || '';
            toast.custom(
              (t) => (
                <div
                  style={{
                    padding: '16px',
                    background: '#111827',
                    color: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                    minWidth: 360,
                    maxWidth: 520,
                    border: '1px solid #374151',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</div>
                  {message && <div style={{ fontSize: 14, opacity: 0.9 }}>{message}</div>}
                </div>
              ),
              { duration: 6000, position: 'top-right' }
            );

            // Marquer comme vu (pas lu) pour éviter les toasts répétés
            seenRef.current.add(String(n.id));
          });
          saveSeenIds(seenRef.current);
        }
      } catch (e) {
        // Silencieux pour éviter du bruit en UI
        // console.error('Notification poll error', e);
      }
    }

    // Premier check rapide
    checkNewNotifications();
    // Polling périodique
    timerRef.current = setInterval(checkNewNotifications, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return null;
}
