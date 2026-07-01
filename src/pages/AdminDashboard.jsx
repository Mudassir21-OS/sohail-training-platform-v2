import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminDashboard() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [users, setUsers] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [deadline, setDeadline] = useState('')
  const [feedback, setFeedback] = useState({})
  const [score, setScore] = useState({})
  const [activeTab, setActiveTab] = useState('tasks')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [t, s, u] = await Promise.all([
        axios.get('https://sohail-backend-api.onrender.com/api/tasks', { headers }),
        axios.get('https://sohail-backend-api.onrender.com/api/submissions', { headers }),
        axios.get('https://sohail-backend-api.onrender.com/api/users?role=trainee', { headers })
      ])
      setTasks(t.data)
      setSubmissions(s.data)
      setUsers(u.data)
    } catch (e) { console.error(e) }
  }

  async function createTask() {
    if (!title || !assignedTo || !deadline) return
    await axios.post('https://sohail-backend-api.onrender.com/api/tasks', {
      title, description, assigned_to: Number(assignedTo), deadline
    }, { headers })
    setTitle(''); setDescription(''); setAssignedTo(''); setDeadline('')
    fetchAll()
  }

  async function gradeSubmission(id) {
    await axios.put(`https://sohail-backend-api.onrender.com/api/submissions/${id}/grade`, {
      score: Number(score[id]), feedback: feedback[id]
    }, { headers })
    fetchAll()
  }

  const badge = {
    assigned: { bg: '#fef3c7', color: '#92400e', label: '📋 Assigned' },
    submitted: { bg: '#dbeafe', color: '#1e40af', label: '📤 Submitted' },
    graded: { bg: '#d1fae5', color: '#065f46', label: '✅ Graded' }
  }

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)',
    color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 14, outline: 'none'
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
            <span style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600 }}>Admin</span>
          </div>
          <button onClick={() => { logout(); navigate('/login') }}
            style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Total Tasks', value: tasks.length, icon: '📋', color: '#6366f1' },
            { label: 'Submissions', value: submissions.length, icon: '📤', color: '#3b82f6' },
            { label: 'Trainees', value: users.length, icon: '👥', color: '#8b5cf6' }
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {['tasks', 'submissions', 'create'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? '#fff' : '#94a3b8' }}>
              {tab === 'tasks' ? '📋 Tasks' : tab === 'submissions' ? '📤 Submissions' : '➕ Create Task'}
            </button>
          ))}
        </div>

        {/* Create Task */}
        {activeTab === 'create' && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
            <h2 style={{ color: '#fff', margin: '0 0 24px', fontSize: 22 }}>Create New Task</h2>
            <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} style={inp} />
            <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={inp} />
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={inp}>
              <option value="">Select Trainee</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inp} />
            <button onClick={createTask}
              style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
              Create Task
            </button>
          </div>
        )}

        {/* Tasks */}
        {activeTab === 'tasks' && (
          <div>
            <h2 style={{ color: '#fff', margin: '0 0 20px', fontSize: 22 }}>All Tasks</h2>
            {tasks.length === 0 && <p style={{ color: '#94a3b8' }}>No tasks yet.</p>}
            <div style={{ display: 'grid', gap: 14 }}>
              {tasks.map(task => {
                const b = badge[task.status] || badge.assigned
                return (
                  <div key={task.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: 17 }}>{task.title}</h3>
                      <span style={{ background: b.bg, color: b.color, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{b.label}</span>
                    </div>
                    <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: 14 }}>{task.description}</p>
                    <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>📅 Due {task.deadline?.split('T')[0]} · 👤 {task.assigned_to_name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Submissions */}
        {activeTab === 'submissions' && (
          <div>
            <h2 style={{ color: '#fff', margin: '0 0 20px', fontSize: 22 }}>Submissions</h2>
            {submissions.length === 0 && <p style={{ color: '#94a3b8' }}>No submissions yet.</p>}
            <div style={{ display: 'grid', gap: 14 }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: 17 }}>{sub.task_title}</h3>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>👤 {sub.trainee_name}</span>
                  </div>
                  <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>{sub.submission_text}</p>
                  {sub.score ? (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: 14 }}>
                      <p style={{ color: '#34d399', margin: 0, fontWeight: 700 }}>✅ Score: {sub.score}/100</p>
                      <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13 }}>{sub.feedback}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <input placeholder="Score (0-100)" value={score[sub.id] || ''} onChange={e => setScore({ ...score, [sub.id]: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', width: 140, outline: 'none' }} />
                      <input placeholder="Feedback" value={feedback[sub.id] || ''} onChange={e => setFeedback({ ...feedback, [sub.id]: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', flex: 1, outline: 'none' }} />
                      <button onClick={() => gradeSubmission(sub.id)}
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                        Grade
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}