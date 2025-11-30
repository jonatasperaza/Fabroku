import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthService } from '@/services'
import { getCookie, removeCookie, setCookie } from '@/utils/cookies'

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  email: string
  public_repos: number
}

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
      const response = await AuthService.refreshToken(refreshToken.value)
      const data = response

      accessToken.value = data?.access
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

  const login = () => {
    return AuthService.login()
  }

  const getMe = async () => {
    const reponse = await AuthService.me()
    user.value = reponse.data
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
    getMe,
    logout,
    login,
  }
})
