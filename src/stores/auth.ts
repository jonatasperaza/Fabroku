import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCookie, removeCookie, setCookie } from '@/utils/cookies'

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  email: string
  public_repos: number
}

const API_BASE_URL = 'http://localhost:8000'

export const useAuthStore = defineStore('auth', () => {
  // Access token (cookie de sessão - expira rápido)
  const accessToken = ref<string | null>(getCookie('access_token'))

  // Refresh token (cookie persistente - dura mais)
  const refreshToken = ref<string | null>(getCookie('refresh_token'))

  const user = ref<GitHubUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isRefreshing = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshToken.value = refresh

    setCookie('access_token', access, {
      days: 0.01, // ~15 minutos
      secure: true,
      sameSite: 'strict',
    })

    setCookie('refresh_token', refresh, {
      days: 7,
      secure: true,
      sameSite: 'strict',
    })
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    removeCookie('access_token')
    removeCookie('refresh_token')
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value || isRefreshing.value) {
      return false
    }

    isRefreshing.value = true

    try {
      const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken.value,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao renovar token')
      }

      const data = await response.json()

      accessToken.value = data.access
      setCookie('access_token', data.access, {
        days: 0.01,
        secure: true,
        sameSite: 'strict',
      })

      return true
    } catch (error_) {
      console.error('Erro ao renovar token:', error_)
      clearTokens()
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  const apiRequest = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    if (!accessToken.value) {
      throw new Error('Não autenticado')
    }
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    if (response.status === 401) {
      const refreshed = await refreshAccessToken()

      if (refreshed) {
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken.value}`,
          },
        })
      } else {
        throw new Error('Sessão expirada')
      }
    }

    return response
  }

  const fetchUser = async () => {
    if (!accessToken.value) {
      error.value = 'Token não encontrado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const response = await apiRequest(`${API_BASE_URL}/api/auth/users/me/`)

      if (!response.ok) {
        throw new Error('Falha ao buscar dados do usuário')
      }

      user.value = await response.json()
      return true
    } catch (error_) {
      error.value
        = error_ instanceof Error ? error_.message : 'Erro ao buscar usuário'
      if (error_ instanceof Error && error_.message === 'Sessão expirada') {
        clearTokens()
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearTokens()
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    error,
    isAuthenticated,
    setTokens,
    clearTokens,
    refreshAccessToken,
    apiRequest,
    fetchUser,
    logout,
  }
})
