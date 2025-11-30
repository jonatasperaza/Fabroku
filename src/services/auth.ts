const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class AuthService {
  async login () {
    window.location.href = `${VITE_API_BASE_URL}/auth/github/login`
  }
}

export default new AuthService()
