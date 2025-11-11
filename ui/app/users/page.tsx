'use client'
import { useState, useEffect } from 'react'
import { getUsers, deleteUser } from '@/lib/api'
import Link from 'next/link'

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  is_superuser?: boolean
  is_active?: boolean
}

interface Pagination {
  current: number
  pageSize: number
  total: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null)

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers(page, 20)
      setUsers(data.data)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch users. Only superusers can access this page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const handleNext = () => {
    if (pagination && currentPage < Math.ceil(pagination.total / pagination.pageSize)) {
      fetchUsers(currentPage + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      fetchUsers(currentPage - 1)
    }
  }

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    setDeletingUsername(username)
    setError('')
    try {
      await deleteUser(userId)
      // Refresh the current page
      await fetchUsers(currentPage)
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to delete user'
      alert(errorMsg)
    } finally {
      setDeletingUsername(null)
    }
  }

  return (
    <div>
      <h1>Users</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>Username</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Name</th>
                <th style={{ padding: 12 }}>Superuser</th>
                <th style={{ padding: 12 }}>Active</th>
                <th style={{ padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>{user.id}</td>
                  <td style={{ padding: 12 }}>{user.username}</td>
                  <td style={{ padding: 12 }}>{user.email}</td>
                  <td style={{ padding: 12 }}>
                    {user.first_name || user.last_name
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : '-'}
                  </td>
                  <td style={{ padding: 12 }}>{user.is_superuser ? '✅' : '-'}</td>
                  <td style={{ padding: 12 }}>{user.is_active ? '✅' : '❌'}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/users/${user.id}`} className="button secondary" style={{ fontSize: '0.85em', padding: '6px 10px' }}>
                        Edit
                      </Link>
                      <button
                        className="button"
                        style={{ fontSize: '0.85em', padding: '6px 10px', background: '#ef4444' }}
                        onClick={() => handleDelete(user.id, user.username)}
                        disabled={deletingUsername === user.username}
                      >
                        {deletingUsername === user.username ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="button secondary" 
                onClick={() => fetchUsers(1)} 
                disabled={currentPage === 1}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                First
              </button>
              <button 
                className="button secondary" 
                onClick={handlePrev} 
                disabled={currentPage === 1}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                ← Prev
              </button>
              {(() => {
                const totalPages = Math.ceil(pagination.total / pagination.pageSize)
                const maxVisible = 5
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                if (endPage - startPage < maxVisible - 1) {
                  startPage = Math.max(1, endPage - maxVisible + 1)
                }
                const pages = []
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className="button"
                      style={{
                        fontSize: '0.9em',
                        padding: '8px 12px',
                        background: i === currentPage ? '#2563eb' : '#6b7280'
                      }}
                      onClick={() => fetchUsers(i)}
                    >
                      {i}
                    </button>
                  )
                }
                return pages
              })()}
              <button
                className="button secondary"
                onClick={handleNext}
                disabled={currentPage >= Math.ceil(pagination.total / pagination.pageSize)}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                Next →
              </button>
              <button
                className="button secondary"
                onClick={() => fetchUsers(Math.ceil(pagination.total / pagination.pageSize))}
                disabled={currentPage >= Math.ceil(pagination.total / pagination.pageSize)}
                style={{ fontSize: '0.9em', padding: '8px 12px' }}
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
