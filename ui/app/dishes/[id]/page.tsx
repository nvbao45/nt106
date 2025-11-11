"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDish, deleteDish, updateDish, getCurrentUser } from '@/lib/api'

interface Dish {
  id: number
  ten_mon_an: string
  gia?: number | null
  mo_ta?: string | null
  hinh_anh?: string | null
  dia_chi?: string | null
  nguoi_dong_gop?: string
}

export default function DishDetailPage() {
  const params = useParams()
  const router = useRouter()
  const idParam = params?.id
  const id = typeof idParam === 'string' ? parseInt(idParam, 10) : Array.isArray(idParam) ? parseInt(idParam[0], 10) : NaN
  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')
  const [isSuperuser, setIsSuperuser] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  // form fields
  const [fName, setFName] = useState('')
  const [fPrice, setFPrice] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fImage, setFImage] = useState('')
  const [fAddress, setFAddress] = useState('')

  useEffect(() => {
    // Load current user from API
    const loadUser = async () => {
      try {
        const user = await getCurrentUser()
        setUserName(user?.username || '')
        setIsSuperuser(!!user?.is_superuser)
      } catch {
        // fallback to localStorage
        try {
          const raw = localStorage.getItem('user')
          if (raw) {
            const u = JSON.parse(raw)
            setUserName(u?.username || '')
            setIsSuperuser(!!u?.is_superuser)
          }
        } catch {}
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('Invalid dish id')
      setLoading(false)
      return
    }
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getDish(id)
        setDish(data)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load dish')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const enterEdit = () => {
    if (!dish) return
    setFName(dish.ten_mon_an || '')
    setFPrice(
      dish.gia === null || dish.gia === undefined ? '' : String(dish.gia)
    )
    setFDesc(dish.mo_ta || '')
    setFImage(dish.hinh_anh || '')
    setFAddress(dish.dia_chi || '')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!dish) return
    if (!confirm(`Delete "${dish.ten_mon_an}"? This cannot be undone.`)) return
    setDeleting(true)
    setError('')
    try {
      await deleteDish(dish.id)
      router.push('/dishes')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete dish')
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dish) return
    if (!fName.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ten_mon_an: fName.trim(),
        gia: fPrice.trim() === '' ? null : Number(fPrice),
        mo_ta: fDesc.trim() === '' ? null : fDesc.trim(),
        hinh_anh: fImage.trim() === '' ? null : fImage.trim(),
        dia_chi: fAddress.trim() === '' ? null : fAddress.trim(),
      }
      const updated = await updateDish(dish.id, payload)
      setDish(updated)
      setEditing(false)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update dish')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <button onClick={() => router.back()} className="button secondary" style={{ marginBottom: 16 }}>← Back</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && dish && (
        <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
          {!editing ? (
            <>
              {dish.hinh_anh && (
                <img src={dish.hinh_anh} alt={dish.ten_mon_an} className="cover" style={{ height: 260 }} />
              )}
              <h2 style={{ marginTop: 12 }}>{dish.ten_mon_an}</h2>
              {dish.gia !== null && dish.gia !== undefined && (
                <p style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.1em' }}>{dish.gia.toLocaleString()} VND</p>
              )}
              {dish.mo_ta && <p style={{ lineHeight: 1.4 }}>{dish.mo_ta}</p>}
              {dish.dia_chi && <p style={{ fontSize: '0.9em', color: '#555' }}>📍 {dish.dia_chi}</p>}
              {dish.nguoi_dong_gop && <p style={{ fontSize: '0.85em', color: '#666', marginTop: 8 }}>Contributed by: {dish.nguoi_dong_gop}</p>}
              {userName && (isSuperuser || dish.nguoi_dong_gop === userName) && (
                <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                  <button className="button secondary" onClick={enterEdit}>Edit</button>
                  <button
                    className="button"
                    style={{ background: '#ef4444' }}
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSave} className="form" style={{ marginTop: 0 }}>
              <input
                className="input"
                placeholder="Name"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Price (VND)"
                value={fPrice}
                onChange={(e) => setFPrice(e.target.value)}
                inputMode="decimal"
              />
              <input
                className="input"
                placeholder="Image URL"
                value={fImage}
                onChange={(e) => setFImage(e.target.value)}
              />
              <input
                className="input"
                placeholder="Address"
                value={fAddress}
                onChange={(e) => setFAddress(e.target.value)}
              />
              <textarea
                className="input"
                placeholder="Description"
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                rows={4}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="button secondary" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
