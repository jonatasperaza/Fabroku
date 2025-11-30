import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue (error: Error | null) {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  }
  failedQueue = []
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { useAuthStore } = await import('@/stores')
    const authStore = useAuthStore()

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  error => Promise.reject(error),
)

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (
      !error.response
      || error.response.status !== 401
      || originalRequest._retry
    ) {
      throw error
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => apiClient(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { useAuthStore } = await import('@/stores')
      const authStore = useAuthStore()

      await authStore.refreshAccessToken()
      processQueue(null)

      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as Error)

      const { useAuthStore } = await import('@/stores')
      const authStore = useAuthStore()
      authStore.logout()

      throw refreshError
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
