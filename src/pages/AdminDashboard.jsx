import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BASE = 'https://sohail-backend-api.onrender.com'

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

  // Add-trainee form state
  const [traineeName, setTraineeName] = useState('')
  const [traineeEmail, setTraineeEmail] = useState('')
  const [traineePassword, setTraineePassword] = useState('')
  const [traineeMsg, setTraineeMsg] = useState(null) // { type: 'success'|'error', text }

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [t, s, u] = await Promise.all([
        axios.get(`${BASE}/api/tasks`, { headers }),
        axios.get(`${BASE}/api/submissions`, { headers }),
        axios.get(`${BASE}/api/users?role=trainee`, { headers })
      ])
      setTasks(t.data)
      setSubmissions(s.data)
      setUsers(u.data)
    } catch (e) { console.error(e) }
  }

  async function createTask() {
    if (!title || !assignedTo || !deadline) return
    await axios.post(`${BASE}/api/tasks`, {
      title, description, assigned_to: Number(assignedTo), deadline
    }, { headers })
    setTitle(''); setDescription(''); setAssignedTo(''); setDeadline('')
    fetchAll()
  }

  async function gradeSubmission(id) {
    await axios.put(`${BASE}/api/submissions/${id}/grade`, {
      score: Number(score[id]), feedback: feedback[id]
    }, { headers })
    fetchAll()
  }

  async function addTrainee() {
    if (!traineeName || !traineeEmail || !traineePassword) {
      setTraineeMsg({ type: 'error', text: 'All fields are required.' })
      return
    }
    try {
      await axios.post(`${BASE}/api/admin/trainees`, {
        name: traineeName,
        email: traineeEmail,
        password: traineePassword,
        role: 'trainee'
      }, { headers })
      setTraineeName(''); setTraineeEmail(''); setTraineePassword('')
      setTraineeMsg({ type: 'success', text: `Trainee "${traineeName}" added successfully!` })
      fetchAll()
    } catch (e) {
      const msg = e.response?.data?.error?.message || 'Failed to add trainee.'
      setTraineeMsg({ type: 'error', text: msg })
    }
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

  const tabs = ['tasks', 'submissions', 'create', 'trainees']
  const tabLabels = {
    tasks: '📋 Tasks',
    submissions: '📤 Submissions',
    create: '➕ Create Task',
    trainees: '👥 Manage Trainees'
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? '#fff' : '#94a3b8' }}>
              {tabLabels[tab]}
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

        {/* Manage Trainees — NEW THIS WEEK */}
        {activeTab === 'trainees' && (
          <div>
            {/* Add Trainee Form */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, marginBottom: 32 }}>
              <h2 style={{ color: '#fff', margin: '0 0 8px', fontSize: 22 }}>Add New Trainee</h2>
              <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: 14 }}>Create a real account — the trainee can log in immediately with these credentials.</p>

              {traineeMsg && (
                <div style={{
                  background: traineeMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${traineeMsg.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                  color: traineeMsg.type === 'success' ? '#34d399' : '#fca5a5', fontSize: 14
                }}>
                  {traineeMsg.type === 'success' ? '✅ ' : '❌ '}{traineeMsg.text}
                </div>
              )}

              <input
                placeholder="Full name"
                value={traineeName}
                onChange={e => { setTraineeName(e.target.value); setTraineeMsg(null) }}
                style={inp}
              />
              <input
                placeholder="Email address"
                value={traineeEmail}
                onChange={e => { setTraineeEmail(e.target.value); setTraineeMsg(null) }}
                style={inp}
              />
              <input
                placeholder="Password"
                type="password"
                value={traineePassword}
                onChange={e => { setTraineePassword(e.target.value); setTraineeMsg(null) }}
                style={inp}
              />
              <button onClick={addTrainee}
                style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                Add Trainee
              </button>
            </div>

            {/* Trainee List */}
            <div>
              <h2 style={{ color: '#fff', margin: '0 0 20px', fontSize: 22 }}>
                All Trainees <span style={{ color: '#64748b', fontWeight: 400, fontSize: 16 }}>({users.length})</span>
              </h2>
              {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                  <p style={{ fontSize: 16 }}>No trainees yet. Add one above.</p>
                </div>
              )}
              <div style={{ display: 'grid', gap: 12 }}>
                {users.map(u => {
                  const userTasks = tasks.filter(t => t.assigned_to === u.id)
                  return (
                    <div key={u.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ color: '#fff', margin: 0, fontWeight: 600, fontSize: 15 }}>{u.name}</p>
                          <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: 13 }}>{u.email}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '4px 12px', color: '#a5b4fc', fontSize: 12, fontWeight: 600 }}>
                          {userTasks.length} task{userTasks.length !== 1 ? 's' : ''} assigned
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}