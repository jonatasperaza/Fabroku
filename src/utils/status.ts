/**
 * Utilitários centralizados para exibição de status de apps.
 *
 * O backend devolve status em UPPER_CASE ("RUNNING", "STOPPED", …).
 * Para exibição nos chips usamos capitalização legível ("Running", "Stopped").
 */

const STATUS_COLORS: Record<string, string> = {
  RUNNING: 'success',
  STOPPED: 'grey',
  ERROR: 'error',
  STARTING: 'warning',
  DELETING: 'pink',
  STOPPING: 'warning',
  RESTARTING: 'info',
  DEPLOYING: 'info',
  FAILED: 'error',
}

const STATUS_ICONS: Record<string, string> = {
  RUNNING: 'mdi-check-circle',
  STOPPED: 'mdi-stop-circle',
  ERROR: 'mdi-alert-circle',
  STARTING: 'mdi-loading',
  DELETING: 'mdi-delete-clock',
  STOPPING: 'mdi-stop-circle',
  RESTARTING: 'mdi-restart',
  DEPLOYING: 'mdi-rocket-launch',
  FAILED: 'mdi-alert-circle',
}

/**
 * Retorna a cor Vuetify para um dado status.
 */
export function getStatusColor (status?: string): string {
  return STATUS_COLORS[(status || 'STOPPED').toUpperCase()] || 'grey'
}

/**
 * Retorna o ícone MDI para um dado status.
 */
export function getStatusIcon (status?: string): string {
  return STATUS_ICONS[(status || 'STOPPED').toUpperCase()] || 'mdi-circle'
}

/**
 * Formata o status para exibição nos chips.
 * "RUNNING" → "Running", "STOPPED" → "Stopped", undefined → "Stopped"
 */
export function formatStatus (status?: string): string {
  const s = (status || 'STOPPED').toUpperCase()
  return s.charAt(0) + s.slice(1).toLowerCase()
}
