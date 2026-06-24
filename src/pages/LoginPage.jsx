import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin() {
    try {
      const res = await axios.post('https://sohail-backend-api.onrender.com/api/auth/login', {
        email,
        password
      })
      login(res.data.user, res.data.token)
      if (res.data.user.role === 'admin') navigate('/admin')
      else navigate('/trainee')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{ color: '#ffffff', textAlign: 'center', marginBottom: 4, fontSize: 22 }}>
          Sohail Training Platform
        </h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 30, fontSize: 14 }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            background: '#450a0a',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <label style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 6 }}>Email</label>
        <input
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />

        <label style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 6 }}>Password</label>
        <input
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 24,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          Login
        </button>
      </div>
    </div>
  )
}