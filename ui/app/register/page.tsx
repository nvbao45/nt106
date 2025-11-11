'use client'
import { useState } from 'react'
import { register } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      })
      alert('Registration successful! Redirecting to login...')
      router.push('/login')
    } catch (err: any) {
      console.error('Registration error:', err)
      let errorMsg = 'Registration failed'
      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMsg = detail
        } else if (Array.isArray(detail)) {
          // Pydantic validation errors: extract field and message
          errorMsg = detail.map((e: any) => {
            const field = e.loc?.[e.loc.length - 1] || 'field'
            return `${field}: ${e.msg}`
          }).join(', ')
        } else {
          errorMsg = JSON.stringify(detail)
        }
      } else if (err?.message) {
        errorMsg = err.message
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '24px 0 0' }}>Register</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="input"
          type="text"
          placeholder="First Name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Last Name (optional)"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
