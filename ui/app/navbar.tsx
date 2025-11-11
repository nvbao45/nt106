'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    // Re-evaluate auth state on route change (and initial mount)
    try {
      const hasToken = !!localStorage.getItem('token')
      setLoggedIn(hasToken)
      if (hasToken) {
        const raw = localStorage.getItem('user')
        if (raw) {
          try {
            const u = JSON.parse(raw)
            setUserName(u?.username || u?.email || '')
          } catch {
            setUserName('')
          }
        } else {
          setUserName('')
        }
      } else {
        setUserName('')
      }
    } catch (_) {
      setLoggedIn(false)
      setUserName('')
    }
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
        <Link href="/dishes">Dishes</Link>
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
