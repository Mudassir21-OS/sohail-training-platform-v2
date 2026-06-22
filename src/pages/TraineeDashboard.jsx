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

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [t, s] = await Promise.all([
      axios.get('http://localhost:5000/api/tasks', { headers }),
      axios.get('http://localhost:5000/api/submissions', { headers })
    ])
    setTasks(t.data)
    setSubmissions(s.data)
  }

  async function submitTask(taskId) {
    await axios.post(`http://localhost:5000/api/tasks/${taskId}/submissions`, {
      submission_text: submissionText[taskId],
      file_url: null
    }, { headers })
    setSubmissionText({ ...submissionText, [taskId]: '' })
    fetchAll()
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const alreadySubmitted = (taskId) => submissions.some(s => s.task_id === taskId)
  const getSubmission = (taskId) => submissions.find(s => s.task_id === taskId)

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>My Tasks</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </div>

      {tasks.length === 0 && <p>No tasks assigned yet.</p>}

      {tasks.map(task => {
        const submitted = alreadySubmitted(task.id)
        const sub = getSubmission(task.id)
        return (
          <div key={task.id} style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, marginBottom: 15 }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Deadline: {task.deadline} — Status: <b>{task.status}</b></p>

            {submitted ? (
              <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 6 }}>
                <p>✅ Submitted: {sub.submission_text}</p>
                {sub.score && <p>Score: <b>{sub.score}</b> — {sub.feedback}</p>}
                {!sub.score && <p style={{ color: 'gray' }}>Waiting for grade...</p>}
              </div>
            ) : (
              <div>
                <textarea
                  placeholder="Write your submission here..."
                  value={submissionText[task.id] || ''}
                  onChange={e => setSubmissionText({ ...submissionText, [task.id]: e.target.value })}
                  style={{ width: '100%', height: 100, padding: 8, marginBottom: 10 }}
                />
                <button
                  onClick={() => submitTask(task.id)}
                  style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}