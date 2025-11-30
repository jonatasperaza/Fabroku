import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${''}`, // TODO: fazer authstore with cookies
  },
  withCredentials: true,
})

// se retornar 401, regenerar token
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized!')
    } // TODO: refresh token logic
  })

export default apiClient
