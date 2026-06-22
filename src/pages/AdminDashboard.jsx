import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminDashboard() {
  const { user, token, logout } = useAuth()
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

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [t, s, u] = await Promise.all([
      axios.get('http://localhost:5000/api/tasks', { headers }),
      axios.get('http://localhost:5000/api/submissions', { headers }),
      axios.get('http://localhost:5000/api/users?role=trainee', { headers })
    ])
    setTasks(t.data)
    setSubmissions(s.data)
    setUsers(u.data)
  }

  async function createTask() {
    await axios.post('http://localhost:5000/api/tasks', {
      title, description, assigned_to: Number(assignedTo), deadline
    }, { headers })
    setTitle(''); setDescription(''); setAssignedTo(''); setDeadline('')
    fetchAll()
  }

  async function gradeSubmission(id) {
    await axios.put(`http://localhost:5000/api/submissions/${id}/grade`, {
      score: Number(score[id]),
      feedback: feedback[id]
    }, { headers })
    fetchAll()
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const s = { input: { display: 'block', width: '100%', marginBottom: 10, padding: 8 } }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Create Task */}
      <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 30 }}>
        <h3>Create Task</h3>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={s.input} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={s.input} />
        <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={s.input}>
          <option value="">Select Trainee</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={s.input} />
        <button onClick={createTask} style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Create Task
        </button>
      </div>

      {/* Tasks List */}
      <h3>All Tasks</h3>
      {tasks.map(task => (
        <div key={task.id} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, marginBottom: 10 }}>
          <b>{task.title}</b> — {task.status} — Due: {task.deadline}
          <p>{task.description}</p>
        </div>
      ))}

      {/* Submissions & Grading */}
      <h3 style={{ marginTop: 30 }}>Submissions</h3>
      {submissions.map(sub => (
        <div key={sub.id} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, marginBottom: 10 }}>
          <b>{sub.task_title}</b> by {sub.trainee_name}
          <p>{sub.submission_text}</p>
          <p>Status: {sub.status}</p>
          {sub.score ? (
            <p>Score: {sub.score} — {sub.feedback}</p>
          ) : (
            <div>
              <input placeholder="Score (0-100)" value={score[sub.id] || ''} onChange={e => setScore({ ...score, [sub.id]: e.target.value })} style={{ marginRight: 10, padding: 6 }} />
              <input placeholder="Feedback" value={feedback[sub.id] || ''} onChange={e => setFeedback({ ...feedback, [sub.id]: e.target.value })} style={{ marginRight: 10, padding: 6 }} />
              <button onClick={() => gradeSubmission(sub.id)} style={{ padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Grade
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}