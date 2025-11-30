import Cookies from 'js-cookie'

/**
 * Utilitário para gerenciar cookies de forma segura usando js-cookie
 */

interface CookieOptions {
  days?: number
  path?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Define um cookie com opções de segurança
 */
export function setCookie (
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  const {
    days = 7,
    path = '/',
    secure = window.location.protocol === 'https:',
    sameSite = 'strict',
  } = options

  Cookies.set(name, value, {
    expires: days,
    path,
    secure,
    sameSite,
  })
}

/**
 * Obtém o valor de um cookie
 */
export function getCookie (name: string): string | null {
  return Cookies.get(name) || null
}

/**
 * Remove um cookie
 */
export function removeCookie (name: string, path = '/'): void {
  Cookies.remove(name, { path })
}

/**
 * Verifica se um cookie existe
 */
export function hasCookie (name: string): boolean {
  return Cookies.get(name) !== undefined
}
