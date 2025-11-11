'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getCurrentUser } from '@/lib/api'

export default function NavBar() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [isSuperuser, setIsSuperuser] = useState(false)

  useEffect(() => {
    // Re-evaluate auth state on route change (and initial mount)
    const loadAuth = async () => {
      try {
        const hasToken = !!localStorage.getItem('token')
        setLoggedIn(hasToken)
        if (hasToken) {
          try {
            const user = await getCurrentUser()
            setUserName(user?.username || user?.email || '')
            setIsSuperuser(!!user?.is_superuser)
          } catch {
            // Fallback to localStorage
            const raw = localStorage.getItem('user')
            if (raw) {
              try {
                const u = JSON.parse(raw)
                setUserName(u?.username || u?.email || '')
                setIsSuperuser(!!u?.is_superuser)
              } catch {
                setUserName('')
                setIsSuperuser(false)
              }
            } else {
              setUserName('')
              setIsSuperuser(false)
            }
          }
        } else {
          setUserName('')
          setIsSuperuser(false)
        }
      } catch (_) {
        setLoggedIn(false)
        setUserName('')
        setIsSuperuser(false)
      }
    }
    loadAuth()
  }, [pathname])

  const handleLogout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setLoggedIn(false)
      setUserName('')
      window.location.href = '/login'
    } catch (_) {}
  }

  return (
    <nav className="nav">
      <div style={{display:'flex', gap: 12, alignItems:'center'}}>
        <Link href="/">Home</Link>
        {loggedIn && <Link href="/my-dishes">My Contributions</Link>}
        {isSuperuser && <Link href="/users">Users</Link>}
        <Link href="/docs" target="_blank" rel="noopener noreferrer">API Docs</Link>
      </div>
      <div style={{display:'flex', gap: 8, alignItems:'center'}}>
        {loggedIn && userName && (
          <span style={{color:'#374151'}}>Welcome, <strong>{userName}</strong></span>
        )}
        {!loggedIn && (
          <>
            <Link href="/login" className="button secondary">Login</Link>
            <Link href="/register" className="button">Register</Link>
          </>
        )}
        {loggedIn && (
          <button className="button secondary" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  )
}
