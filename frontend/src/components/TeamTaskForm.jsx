import { useState } from 'react'
import axios from 'axios'

const BASE = 'https://sohail-backend-api.onrender.com'

export default function TeamTaskForm({ token, users, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [members, setMembers] = useState([{ user_id: '', part: '' }])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  function addMemberRow() {
    setMembers([...members, { user_id: '', part: '' }])
  }

  function removeMemberRow(index) {
    setMembers(members.filter((_, i) => i !== index))
  }

  function updateMember(index, field, value) {
    const updated = [...members]
    updated[index][field] = value
    setMembers(updated)
  }

  async function handleSubmit() {
    if (!title || !deadline) {
      setMsg({ type: 'error', text: 'Title and deadline are required.' })
      return
    }
    const validMembers = members.filter(m => m.user_id && m.part)
    if (validMembers.length === 0) {
      setMsg({ type: 'error', text: 'Add at least one member with a part.' })
      return
    }
    try {
      setLoading(true)
      await axios.post(`${BASE}/api/team-tasks`, {
        title,
        description,
        deadline,
        members: validMembers.map(m => ({
          user_id: Number(m.user_id),
          part: m.part
        }))
      }, { headers })
      setTitle(''); setDescription(''); setDeadline('')
      setMembers([{ user_id: '', part: '' }])
      setMsg({ type: 'success', text: 'Team task created successfully!' })
      if (onSuccess) onSuccess()
    } catch (e) {
      const errMsg = e.response?.data?.error?.message || 'Failed to create team task.'
      setMsg({ type: 'error', text: errMsg })
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)',
    color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 14, outline: 'none'
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32 }}>
      <h2 style={{ color: '#fff', margin: '0 0 8px', fontSize: 22 }}>Create Team Task</h2>
      <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: 14 }}>
        One shared project assigned to multiple trainees — each gets their own part and is graded individually.
      </p>

      {msg && (
        <div style={{
          background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          color: msg.type === 'success' ? '#34d399' : '#fca5a5', fontSize: 14
        }}>
          {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
        </div>
      )}

      <input placeholder="Task title" value={title} onChange={e => { setTitle(e.target.value); setMsg(null) }} style={inp} />
      <textarea
        placeholder="Shared brief / description"
        value={description}
        onChange={e => { setDescription(e.target.value); setMsg(null) }}
        style={{ ...inp, height: 100, resize: 'vertical' }}
      />
      <input type="date" value={deadline} onChange={e => { setDeadline(e.target.value); setMsg(null) }} style={inp} />

      {/* Member Rows */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 14, margin: '0 0 12px' }}>
          👥 Assign Members & Parts
        </p>
        {members.map((member, index) => (
          <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <select
              value={member.user_id}
              onChange={e => updateMember(index, 'user_id', e.target.value)}
              style={{ ...inp, marginBottom: 0, flex: 1 }}
            >
              <option value="">Select Trainee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <input
              placeholder="Their part (e.g. Frontend UI)"
              value={member.part}
              onChange={e => updateMember(index, 'part', e.target.value)}
              style={{ ...inp, marginBottom: 0, flex: 1 }}
            />
            {members.length > 1 && (
              <button
                onClick={() => removeMemberRow(index)}
                style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, color: '#fca5a5', cursor: 'pointer', fontSize: 16, whiteSpace: 'nowrap' }}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addMemberRow}
          style={{ padding: '10px 20px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, color: '#a5b4fc', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          + Add Member
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ padding: '12px 32px', background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, marginTop: 8 }}>
        {loading ? 'Creating...' : 'Create Team Task'}
      </button>
    </div>
  )
}

