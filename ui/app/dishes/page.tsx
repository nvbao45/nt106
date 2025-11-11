'use client'
import { useState, useEffect } from 'react'
import { getDishes } from '@/lib/api'

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

export default function DishesPage() {
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
      <h1>Dishes</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <div className="grid">
            {dishes.map((dish) => (
              <div key={dish.id} className="card">
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
            ))}
          </div>
          {pagination && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
              <button className="button secondary" onClick={handlePrev} disabled={currentPage === 1}>
                ← Prev
              </button>
              <span>
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                className="button secondary"
                onClick={handleNext}
                disabled={currentPage >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
