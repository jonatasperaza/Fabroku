import apiClient from '@/plugins/axios'
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class AuthService {
  async login () {
    window.location.href = `${VITE_API_BASE_URL}/auth/github/login`
  }

  async me () {
    const response = await apiClient.get('/auth/users/me/')
    return response.data
  }

  async refreshToken (refreshToken: string) {
    const response = await apiClient.post('/token/refresh/', { refresh: refreshToken })
    return response.data
  }
}

export default new AuthService()
