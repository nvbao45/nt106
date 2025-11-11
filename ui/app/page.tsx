'use client'
import { useState, useEffect } from 'react'
import { getDishes } from '@/lib/api'
import Link from 'next/link'

interface Dish {
  id: number
  ten_mon_an: string
  gia?: number
  mo_ta?: string
  hinh_anh?: string
  dia_chi?: string
  nguoi_dong_gop?: string
}

interface Pagination {
  current: number
  pageSize: number
  total: number
}

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchDishes = async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const data = await getDishes(page, 12)
      setDishes(data.data)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch dishes. Please login.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDishes(1)
  }, [])

  const handleNext = () => {
    if (pagination && currentPage < Math.ceil(pagination.total / pagination.pageSize)) {
      fetchDishes(currentPage + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      fetchDishes(currentPage - 1)
    }
  }

  return (
    <div>
      <h1>Hôm nay ăn gì?</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div className="grid">
            {dishes.map((dish) => (
              <Link href={`/dishes/${dish.id}`} key={dish.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer' }}>
                  {dish.hinh_anh && (
                    <img src={dish.hinh_anh} alt={dish.ten_mon_an} className="cover" />
                  )}
                  <h3>{dish.ten_mon_an}</h3>
                  {dish.gia !== null && dish.gia !== undefined && (
                    <p style={{ fontWeight: 'bold', color: '#059669' }}>
                      {dish.gia.toLocaleString()} VND
                    </p>
                  )}
                  {dish.mo_ta && <p style={{ fontSize: '0.9em', color: '#555' }}>{dish.mo_ta}</p>}
                  {dish.dia_chi && <p style={{ fontSize: '0.85em', color: '#888' }}>📍 {dish.dia_chi}</p>}
                  {dish.nguoi_dong_gop && (
                    <p style={{ fontSize: '0.85em', color: '#888', marginTop: '8px' }}>
                      Contributed by: {dish.nguoi_dong_gop}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {pagination && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="button secondary" 
                onClick={() => fetchDishes(1)} 
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
                      onClick={() => fetchDishes(i)}
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
                onClick={() => fetchDishes(Math.ceil(pagination.total / pagination.pageSize))}
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
