import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const BASE = 'https://sohail-backend-api.onrender.com'

export default function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    axios.get(`${BASE}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setNotifications(res.data))
      .catch(err => console.error('Failed to load notifications:', err))

    const socket = io(BASE, { auth: { token: `Bearer ${token}` } })
    socket.on('new_notification', (n) => {
      setNotifications(prev => [n, ...prev])
    })
    socket.on('connect_error', (err) => console.error('Socket connection failed:', err.message))
    socketRef.current = socket

    return () => socket.disconnect()
  }, [token])

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function markAsRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    try {
      await axios.put(`${BASE}/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch (err) {
      console.error('Failed to mark as read:', err)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n))
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: 11, padding: '1px 6px', fontWeight: 700 }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 36, width: 320, maxHeight: 400, overflowY: 'auto', background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 8, zIndex: 50 }}>
          {notifications.length === 0 && <p style={{ color: '#94a3b8', padding: 12 }}>No notifications yet.</p>}
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markAsRead(n.id)}
              style={{ padding: 12, borderRadius: 8, marginBottom: 4, cursor: n.is_read ? 'default' : 'pointer',
                background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.15)' }}>
              <p style={{ color: '#fff', margin: 0, fontSize: 13 }}>{n.message}</p>
              <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 11 }}>
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
