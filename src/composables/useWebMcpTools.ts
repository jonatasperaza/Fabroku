import type { App } from '@/modules/applications'
import { appRepository, GetApplicationProcesses, GetApplicationStatus } from '@/modules/applications'
import { GetRuntimeLogs, logRepository } from '@/modules/logs'
import { useAppStore } from '@/stores/app'

interface ModelContextToolResult {
  content: Array<{ type: 'text', text: string }>
}

interface ModelContextTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (args: Record<string, unknown>) => Promise<ModelContextToolResult> | ModelContextToolResult
}

interface ModelContext {
  registerTool: (tool: ModelContextTool, options: { signal: AbortSignal }) => Promise<void>
}

function getModelContext (): ModelContext | null {
  if (typeof document === 'undefined') {
    return null
  }
  return (document as unknown as { modelContext?: ModelContext }).modelContext ?? null
}

function toolResult (data: unknown): ModelContextToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

function summarizeApp (app: App | null) {
  if (!app) {
    return null
  }
  return {
    id: app.id,
    name: app.name,
    status: app.status,
    domain: app.domain,
    branch: app.branch,
    project: app.project,
  }
}

export function useWebMcpTools () {
  let controller: AbortController | null = null

  function start () {
    if (controller) {
      return
    }
    const modelContext = getModelContext()
    if (!modelContext) {
      return
    }

    controller = new AbortController()
    const signal = controller.signal
    const appStore = useAppStore()
    const getApplicationStatus = new GetApplicationStatus(appRepository)
    const getApplicationProcesses = new GetApplicationProcesses(appRepository)
    const getRuntimeLogs = new GetRuntimeLogs(logRepository)

    const register = (tool: ModelContextTool) => {
      modelContext.registerTool(tool, { signal }).catch((error: unknown) => {
        console.warn(`[webmcp] falha ao registrar tool "${tool.name}"`, error)
      })
    }

    register({
      name: 'fabroku-list-apps',
      description: 'Lista as aplicações do usuário logado no Fabroku, com status, domínio, branch e projeto. Somente leitura — não inicia, para, reinicia, faz redeploy nem apaga nada.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      async execute () {
        const apps = await appStore.fetchApps()
        return toolResult(apps.map(app => summarizeApp(app)))
      },
    })

    register({
      name: 'fabroku-get-app-status',
      description: 'Retorna o status atual e o progresso da última operação (criação/deploy) de um app do Fabroku pelo id. Somente leitura.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'id numérico do App, obtido via fabroku-list-apps' },
        },
        required: ['appId'],
        additionalProperties: false,
      },
      async execute ({ appId }) {
        const id = String(appId)
        const [app, taskStatus] = await Promise.all([
          appStore.fetchApp(id),
          getApplicationStatus.execute(id).catch(() => null),
        ])
        return toolResult({ app: summarizeApp(app), task: taskStatus })
      },
    })

    register({
      name: 'fabroku-get-app-processes',
      description: 'Retorna a escala de processos (dynos) atual de um app do Fabroku pelo id — nome do processo, réplicas desejadas e réplicas ativas. Somente leitura.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'id numérico do App, obtido via fabroku-list-apps' },
        },
        required: ['appId'],
        additionalProperties: false,
      },
      async execute ({ appId }) {
        const processes = await getApplicationProcesses.execute(String(appId))
        return toolResult(processes)
      },
    })

    register({
      name: 'fabroku-get-runtime-logs',
      description: 'Retorna as últimas linhas de log de runtime (stdout/stderr do container) de um app do Fabroku pelo id. Somente leitura.',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'id numérico do App, obtido via fabroku-list-apps' },
          lines: { type: 'number', description: 'quantidade de linhas a retornar (padrão 100, máximo 500)' },
        },
        required: ['appId'],
        additionalProperties: false,
      },
      async execute ({ appId, lines }) {
        const capped = Math.min(Math.max(Number(lines) || 100, 1), 500)
        const logs = await getRuntimeLogs.execute(Number(appId), capped)
        return toolResult(logs)
      },
    })
  }

  function stop () {
    controller?.abort()
    controller = null
  }

  return { start, stop }
}
