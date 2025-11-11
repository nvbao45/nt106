import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach Bearer token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// -------- Auth --------
export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)
  const { data } = await api.post('/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return data // { access_token, token_type, user }
}

export const register = async (payload: {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  sex?: number
  birthday?: string
  language?: string
  phone?: string
}) => {
  const { data } = await api.post('/api/v1/user/signup', payload)
  return data
}

// -------- Dishes (Mon An) --------
export const getDishes = async (current = 1, pageSize = 10) => {
  const { data } = await api.post('/api/v1/monan/all', { current, pageSize })
  return data // { data: [...dishes], pagination: {...} }
}

export const getMyDishes = async (current = 1, pageSize = 10) => {
  const { data } = await api.post('/api/v1/monan/my-dishes', { current, pageSize })
  return data
}

export const createDish = async (dish: {
  ten_mon_an: string
  gia?: number
  mo_ta?: string
  hinh_anh?: string
  dia_chi?: string
}) => {
  const { data } = await api.post('/api/v1/monan/add', dish)
  return data
}

export default api
