import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function TraineeDashboard() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [submissionText, setSubmissionText] = useState({})

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [t, s] = await Promise.all([
        axios.get('https://sohail-backend-api.onrender.com/api/tasks', { headers }),
        axios.get('https://sohail-backend-api.onrender.com/api/submissions', { headers })
      ])
      setTasks(t.data)
      setSubmissions(s.data)
    } catch (e) { console.error(e) }
  }

  async function submitTask(taskId) {
    await axios.post(`https://sohail-backend-api.onrender.com/api/tasks/${taskId}/submissions`, {
      submission_text: submissionText[taskId], file_url: null
    }, { headers })
    setSubmissionText({ ...submissionText, [taskId]: '' })
    fetchAll()
  }

  const alreadySubmitted = (taskId) => submissions.some(s => s.task_id === taskId)
  const getSubmission = (taskId) => submissions.find(s => s.task_id === taskId)

  const badge = {
    assigned: { bg: '#fef3c7', color: '#92400e', label: '📋 Assigned' },
    submitted: { bg: '#dbeafe', color: '#1e40af', label: '📤 Submitted' },
    graded: { bg: '#d1fae5', color: '#065f46', label: '✅ Graded' }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Sohail Training</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '4px 14px' }}>
            <span style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600 }}>Trainee</span>
          </div>
          <button onClick={() => { logout(); navigate('/login') }}
            style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 28, fontWeight: 700 }}>My Tasks</h2>
          <p style={{ color: '#94a3b8', margin: '6px 0 0', fontSize: 15 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 16 }}>No tasks assigned yet.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 20 }}>
          {tasks.map(task => {
            const submitted = alreadySubmitted(task.id)
            const sub = getSubmission(task.id)
            const b = badge[task.status] || badge.assigned
            return (
              <div key={task.id} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 28, border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>{task.title}</h3>
                  <span style={{ background: b.bg, color: b.color, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {b.label}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.6 }}>{task.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                  <span style={{ fontSize: 13 }}>📅</span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>Due {task.deadline?.split('T')[0]}</span>
                </div>

                {submitted ? (
                  <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 16 }}>
                    <p style={{ color: '#a5b4fc', margin: '0 0 8px', fontSize: 14 }}>📤 Your submission:</p>
                    <p style={{ color: '#e2e8f0', margin: '0 0 12px', fontSize: 14 }}>{sub.submission_text}</p>
                    {sub.score
                      ? <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: 12 }}>
                          <p style={{ color: '#34d399', margin: 0, fontWeight: 700 }}>Score: {sub.score}/100</p>
                          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13 }}>{sub.feedback}</p>
                        </div>
                      : <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>⏳ Waiting for grade...</p>
                    }
                  </div>
                ) : (
                  <div>
                    <textarea
                      placeholder="Write your submission here..."
                      value={submissionText[task.id] || ''}
                      onChange={e => setSubmissionText({ ...submissionText, [task.id]: e.target.value })}
                      style={{ width: '100%', height: 120, padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 14, resize: 'vertical', outline: 'none' }}
                    />
                    <button onClick={() => submitTask(task.id)}
                      style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                      Submit Task
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}