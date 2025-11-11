'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser, getUser, updateUser } from '@/lib/api'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const username = typeof params?.username === 'string' ? params.username : ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isSuperuser, setIsSuperuser] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [sex, setSex] = useState<number | ''>('')
  const [birthday, setBirthday] = useState('')
  const [language, setLanguage] = useState('')
  const [phone, setPhone] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isUserSuperuser, setIsUserSuperuser] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      setError('')
      try {
        const currentUser = await getCurrentUser()
        setIsSuperuser(!!currentUser?.is_superuser)
        if (!currentUser?.is_superuser) {
          setError('You do not have permission to edit users.')
          setLoading(false)
          return
        }
        // Fetch the specific user data
        const userData = await getUser(username)
        setEmail(userData.email || '')
        setFirstName(userData.first_name || '')
        setLastName(userData.last_name || '')
        setSex(userData.sex ?? '')
        setBirthday(userData.birthday || '')
        setLanguage(userData.language || '')
        setPhone(userData.phone || '')
        setIsActive(userData.is_active ?? true)
        setIsUserSuperuser(userData.is_superuser ?? false)
        setLoading(false)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load user data.')
        setLoading(false)
      }
    }
    loadUser()
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      setError('Invalid username')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload: any = {}
      if (email.trim()) payload.email = email.trim()
      if (password.trim()) payload.password = password.trim()
      if (firstName.trim()) payload.first_name = firstName.trim()
      if (lastName.trim()) payload.last_name = lastName.trim()
      if (sex !== '') payload.sex = Number(sex)
      if (birthday.trim()) payload.birthday = birthday.trim()
      if (language.trim()) payload.language = language.trim()
      if (phone.trim()) payload.phone = phone.trim()
      payload.is_active = isActive
      payload.is_superuser = isUserSuperuser

      await updateUser(username, payload)
      alert('User updated successfully!')
      router.push('/users')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update user.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error && !isSuperuser) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <button onClick={() => router.back()} className="button secondary" style={{ marginBottom: 16 }}>
        ← Back
      </button>
      <h1>Edit User: {username}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form" style={{ maxWidth: 640 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="New Password (leave blank to keep current)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="input"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="input"
          type="number"
          placeholder="Sex (0=Male, 1=Female)"
          value={sex}
          onChange={(e) => setSex(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <input
          className="input"
          type="date"
          placeholder="Birthday"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
        <input
          className="input"
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <input
          className="input"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={isUserSuperuser}
            onChange={(e) => setIsUserSuperuser(e.target.checked)}
          />
          Superuser
        </label>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="button secondary" onClick={() => router.back()} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
