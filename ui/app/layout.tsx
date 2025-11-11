import './globals.css'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div style={{display:'flex', gap: 12, alignItems:'center'}}>
            <Link href="/">Home</Link>
            <Link href="/dishes">Dishes</Link>
          </div>
          <div style={{display:'flex', gap: 8}}>
            <Link href="/login" className="button secondary">Login</Link>
            <Link href="/register" className="button">Register</Link>
            <button className="button secondary" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>Logout</button>
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  )
}
