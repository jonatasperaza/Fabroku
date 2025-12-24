<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.push(`/projects/${projectId}`)"
    >
      Voltar para Projeto
    </v-btn>

    <!-- Loading -->
    <v-progress-linear v-if="loading" indeterminate />

    <template v-if="appStore.currentApp">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center">
          <v-icon
            class="mr-3"
            :color="getStatusColor(appStore.currentApp.status)"
            size="32"
          >
            {{ getStatusIcon(appStore.currentApp.status) }}
          </v-icon>
          <div>
            <h1 class="text-h4">{{ appStore.currentApp.name }}</h1>
            <v-chip
              class="mt-1"
              :color="getStatusColor(appStore.currentApp.status)"
              size="small"
            >
              {{ appStore.currentApp.status || "stopped" }}
            </v-chip>
          </div>
        </div>
        <v-btn
          color="primary"
          :loading="refreshing"
          prepend-icon="mdi-refresh"
          variant="tonal"
          @click="refreshStatus"
        >
          Atualizar Status
        </v-btn>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <!-- Card de Progresso da Task -->
          <v-card
            v-if="
              appStore.currentApp.task_id &&
                (appStore.currentApp.status === 'STARTING' ||
                  appStore.currentApp.status === 'DELETING')
            "
            class="mb-4"
            :color="
              appStore.currentApp.status === 'DELETING' ? 'pink' : 'primary'
            "
            variant="tonal"
          >
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2 mdi-spin">mdi-loading</v-icon>
              {{
                appStore.currentApp.status === "DELETING"
                  ? "Deletando App..."
                  : "Criando App..."
              }}
            </v-card-title>
            <v-card-text>
              <div v-if="appStore.taskStatus" class="mb-2">
                <div class="d-flex justify-space-between mb-1">
                  <span>{{ appStore.taskStatus.status }}</span>
                  <span>{{ appStore.taskStatus.current }}%</span>
                </div>
                <v-progress-linear
                  :color="
                    appStore.currentApp.status === 'DELETING'
                      ? 'pink'
                      : 'primary'
                  "
                  height="8"
                  :model-value="appStore.taskStatus.current"
                  rounded
                />
              </div>
              <div v-else class="text-center">
                <v-progress-circular indeterminate size="24" />
                <span class="ml-2">Carregando progresso...</span>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Detalhes do App</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-git</v-icon>
                  </template>
                  <v-list-item-title>Repositório</v-list-item-title>
                  <v-list-item-subtitle>
                    <a :href="appStore.currentApp.git" target="_blank">
                      {{ appStore.currentApp.git }}
                    </a>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="appStore.currentApp.branch">
                  <template #prepend>
                    <v-icon>mdi-source-branch</v-icon>
                  </template>
                  <v-list-item-title>Branch</v-list-item-title>
                  <v-list-item-subtitle>{{
                    appStore.currentApp.branch
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="appStore.currentApp.domain">
                  <template #prepend>
                    <v-icon>mdi-web</v-icon>
                  </template>
                  <v-list-item-title>URL do App</v-list-item-title>
                  <v-list-item-subtitle>
                    <a
                      :href="getAppUrl(appStore.currentApp.domain)"
                      target="_blank"
                    >
                      {{ getAppUrl(appStore.currentApp.domain) }}
                      <v-icon size="small">mdi-open-in-new</v-icon>
                    </a>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="appStore.currentApp.port">
                  <template #prepend>
                    <v-icon>mdi-numeric</v-icon>
                  </template>
                  <v-list-item-title>Porta</v-list-item-title>
                  <v-list-item-subtitle>{{
                    appStore.currentApp.port
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Criado em</v-list-item-title>
                  <v-list-item-subtitle>{{
                    formatDate(appStore.currentApp.created_at)
                  }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-edit</v-icon>
                  </template>
                  <v-list-item-title>Atualizado em</v-list-item-title>
                  <v-list-item-subtitle>{{
                    formatDate(appStore.currentApp.updated_at)
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Preview do App -->
          <v-card
            v-if="
              appStore.currentApp.domain &&
                appStore.currentApp.status === 'RUNNING'
            "
            class="mb-4"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <span>
                <v-icon class="mr-2">mdi-monitor</v-icon>
                Preview
              </span>
              <div>
                <v-btn icon size="small" variant="text" @click="refreshIframe">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
                <v-btn
                  :href="getAppUrl(appStore.currentApp.domain)"
                  icon
                  size="small"
                  target="_blank"
                  variant="text"
                >
                  <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text class="pa-0">
              <div class="iframe-container">
                <iframe
                  :key="iframeKey"
                  allowfullscreen
                  class="app-iframe"
                  :src="getAppUrl(appStore.currentApp.domain)"
                  title="App Preview"
                />
              </div>
            </v-card-text>
          </v-card>

          <!-- Mensagem quando não há preview -->
          <v-card
            v-else-if="
              !appStore.currentApp.domain ||
                appStore.currentApp.status !== 'RUNNING'
            "
            class="mb-4"
          >
            <v-card-title>
              <v-icon class="mr-2">mdi-monitor-off</v-icon>
              Preview
            </v-card-title>
            <v-card-text class="text-center py-8">
              <v-icon class="mb-2" color="grey" size="64">mdi-web-off</v-icon>
              <p class="text-grey">
                <template v-if="!appStore.currentApp.domain">
                  O app ainda não possui uma URL configurada.
                </template>
                <template v-else>
                  O app precisa estar rodando para exibir o preview.
                </template>
              </p>
            </v-card-text>
          </v-card>

          <!-- Variáveis de Ambiente -->
          <v-card class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Variáveis de Ambiente</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                variant="tonal"
                @click="dialogEnvVar = true"
              >
                Adicionar
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-table
                v-if="
                  appStore.currentApp.variables &&
                    Object.keys(appStore.currentApp.variables).length > 0
                "
                density="compact"
              >
                <thead>
                  <tr>
                    <th>Chave</th>
                    <th>Valor</th>
                    <th width="80">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(value, key) in appStore.currentApp.variables"
                    :key="key"
                  >
                    <td>
                      <code>{{ key }}</code>
                    </td>
                    <td>
                      <code>{{ showSecrets ? value : "••••••••" }}</code>
                    </td>
                    <td>
                      <v-btn
                        color="error"
                        icon
                        size="small"
                        variant="text"
                        @click="removeEnvVar(String(key))"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div v-else class="text-center py-4 text-grey">
                <v-icon class="mb-2" size="32">mdi-variable</v-icon>
                <p>Nenhuma variável configurada</p>
              </div>
              <v-switch
                v-if="
                  appStore.currentApp.variables &&
                    Object.keys(appStore.currentApp.variables).length > 0
                "
                v-model="showSecrets"
                class="mt-2"
                density="compact"
                hide-details
                label="Mostrar valores"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Ações -->
          <v-card class="mb-4">
            <v-card-title>Ações</v-card-title>
            <v-card-text>
              <!-- Alerta quando está deletando -->
              <v-alert
                v-if="appStore.currentApp.status === 'DELETING'"
                class="mb-4"
                color="pink"
                icon="mdi-delete-clock"
                type="warning"
                variant="tonal"
              >
                Este app está sendo deletado...
              </v-alert>

              <!-- Botão Iniciar/Parar (condicional) -->
              <v-btn
                v-if="appStore.currentApp.status === 'STOPPED'"
                block
                class="mb-2"
                color="success"
                :loading="starting"
                prepend-icon="mdi-play"
                @click="handleStartApp"
              >
                Iniciar
              </v-btn>
              <v-btn
                v-else
                block
                class="mb-2"
                color="warning"
                :disabled="appStore.currentApp.status === 'DELETING'"
                :loading="stopping"
                prepend-icon="mdi-stop"
                @click="handleStopApp"
              >
                Parar
              </v-btn>

              <!-- Botão Reiniciar -->
              <v-btn
                block
                class="mb-2"
                color="info"
                :disabled="appStore.currentApp.status !== 'RUNNING'"
                :loading="restarting"
                prepend-icon="mdi-restart"
                @click="handleRestartApp"
              >
                Reiniciar
              </v-btn>

              <v-divider class="my-3" />

              <!-- Botão Deletar -->
              <v-btn
                block
                color="error"
                :disabled="appStore.currentApp.status === 'DELETING'"
                prepend-icon="mdi-delete"
                variant="outlined"
                @click="confirmDelete = true"
              >
                Deletar App
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Status Card -->
          <v-card v-if="appStore.currentApp.domain">
            <v-card-title>Acesso Rápido</v-card-title>
            <v-card-text>
              <v-btn
                block
                color="primary"
                :href="getAppUrl(appStore.currentApp.domain)"
                prepend-icon="mdi-open-in-new"
                target="_blank"
                variant="tonal"
              >
                Abrir App
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Dialog Adicionar Variável -->
    <v-dialog v-model="dialogEnvVar" max-width="500">
      <v-card>
        <v-card-title>Nova Variável de Ambiente</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newEnvVar.key"
            autofocus
            class="mb-4"
            label="Chave"
            placeholder="DATABASE_URL"
            variant="outlined"
          />
          <v-text-field
            v-model="newEnvVar.value"
            label="Valor"
            placeholder="postgres://..."
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogEnvVar = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!newEnvVar.key || !newEnvVar.value"
            :loading="savingEnvVar"
            @click="addEnvVar"
          >
            Adicionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Confirmar Exclusão -->
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title class="text-error">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja deletar o app
          <strong>{{ appStore.currentApp?.name }}</strong>?
          <br>
          <span class="text-error">Esta ação não pode ser desfeita.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
          <v-btn color="error" :loading="deleting" @click="handleDeleteApp">
            Deletar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Logs da Aplicação (inline) -->
    <v-row v-if="appStore.currentApp">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
              Logs da Aplicação
            </span>
            <v-btn
              color="primary"
              icon
              size="small"
              variant="text"
              @click="refreshLogs"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-4">
            <LogViewer
              :has-more="logStore.hasMore"
              :loading="logStore.loading"
              :logs="logStore.logs"
              :task-id="appStore.currentApp?.task_id || undefined"
              title="Logs"
              @load-more="loadMoreLogs"
              @stream-logs="handleStreamLogs"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import LogViewer from '@/components/logs/LogViewer.vue'
  import { useAppStore, useLogStore } from '@/stores'

  const route = useRoute()
  const router = useRouter()
  const projectId = (route.params as { projectId: string }).projectId || ''
  const appId = (route.params as { appId: string }).appId || ''

  const appStore = useAppStore()
  const logStore = useLogStore()
  const loading = ref(true)
  const refreshing = ref(false)
  const showSecrets = ref(false)
  const dialogEnvVar = ref(false)
  const savingEnvVar = ref(false)
  const confirmDelete = ref(false)
  const deleting = ref(false)
  const starting = ref(false)
  const stopping = ref(false)
  const restarting = ref(false)
  const newEnvVar = ref({ key: '', value: '' })
  const iframeKey = ref(0)
  const taskPollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

  onMounted(async () => {
    try {
      await appStore.fetchApp(appId)
      // Carrega logs automaticamente
      if (appStore.currentApp?.id) {
        await logStore.fetchLogsByApp(Number(appStore.currentApp.id))
      }
      // Se há task em andamento, inicia polling
      startTaskPollingIfNeeded()
    } finally {
      loading.value = false
    }
  })

  onUnmounted(() => {
    stopTaskPolling()
  })

  // Watch para iniciar/parar polling quando status mudar
  watch(
    () => appStore.currentApp?.status,
    newStatus => {
      if (newStatus === 'STARTING' || newStatus === 'DELETING') {
        startTaskPollingIfNeeded()
      } else {
        stopTaskPolling()
        appStore.clearTaskStatus()
      }
    },
  )

  function startTaskPollingIfNeeded () {
    const app = appStore.currentApp
    if (
      !app?.task_id
      || (app.status !== 'STARTING' && app.status !== 'DELETING')
    ) {
      return
    }

    // Limpa interval anterior se existir
    stopTaskPolling()

    // Busca status imediatamente
    pollTaskStatus()

    // Inicia polling a cada 2 segundos
    taskPollingInterval.value = setInterval(pollTaskStatus, 2000)
  }

  function stopTaskPolling () {
    if (taskPollingInterval.value) {
      clearInterval(taskPollingInterval.value)
      taskPollingInterval.value = null
    }
  }

  async function pollTaskStatus () {
    try {
      const status = await appStore.fetchAppStatus(appId)

      // Se a task terminou (SUCCESS ou FAILURE), recarrega o app
      if (status?.state === 'SUCCESS' || status?.state === 'FAILURE') {
        stopTaskPolling()
        await appStore.fetchApp(appId)
      }
    } catch (error_) {
      console.error('Erro ao buscar status da task:', error_)
    }
  }

  async function refreshStatus () {
    refreshing.value = true
    try {
      // Recarrega o app para ter os dados mais recentes
      await appStore.fetchApp(appId)
      // Se há task, busca o status também
      if (appStore.currentApp?.task_id) {
        await appStore.fetchAppStatus(appId)
      }
    } finally {
      refreshing.value = false
    }
  }

  function refreshIframe () {
    iframeKey.value++
  }

  async function addEnvVar () {
    if (!newEnvVar.value.key || !newEnvVar.value.value) {
      return
    }
    savingEnvVar.value = true
    try {
      const currentVars = appStore.currentApp?.variables || {}
      await appStore.updateApp(appId, {
        variables: {
          ...currentVars,
          [newEnvVar.value.key]: newEnvVar.value.value,
        },
      })
      dialogEnvVar.value = false
      newEnvVar.value = { key: '', value: '' }
    } finally {
      savingEnvVar.value = false
    }
  }

  async function removeEnvVar (key: string) {
    const currentVars = { ...appStore.currentApp?.variables }
    delete currentVars[key]
    await appStore.updateApp(appId, { variables: currentVars })
  }

  async function handleDeleteApp () {
    deleting.value = true
    try {
      await appStore.deleteApp(appId)
      router.push(`/projects/${projectId}`)
    } finally {
      deleting.value = false
    }
  }

  // Funções de controle do app
  async function handleStartApp () {
    starting.value = true
    try {
      await appStore.startApp(appId)
      // Recarrega o app para ter os dados mais recentes
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao iniciar app:', error_)
    } finally {
      starting.value = false
    }
  }

  async function handleStopApp () {
    stopping.value = true
    try {
      await appStore.stopApp(appId)
      // Recarrega o app para ter os dados mais recentes
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao parar app:', error_)
    } finally {
      stopping.value = false
    }
  }

  async function handleRestartApp () {
    restarting.value = true
    try {
      await appStore.restartApp(appId)
      // Recarrega o app para ter os dados mais recentes
      await appStore.fetchApp(appId)
    } catch (error_) {
      console.error('Erro ao reiniciar app:', error_)
    } finally {
      restarting.value = false
    }
  }

  // Funções de logs
  async function refreshLogs () {
    if (appStore.currentApp?.id) {
      await logStore.fetchLogsByApp(Number(appStore.currentApp.id))
    }
  }

  async function loadMoreLogs () {
    if (appStore.currentApp?.id) {
      await logStore.loadMore({ app: Number(appStore.currentApp.id) })
    }
  }

  async function handleStreamLogs (taskId: string, afterId?: number) {
    await logStore.streamLogs(taskId, afterId)
  }

  function formatDate (dateString?: string) {
    if (!dateString) {
      return '-'
    }
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getAppUrl (domain?: string | null): string {
    if (!domain) return ''
    // Se já tem protocolo, retorna como está
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return domain
    }
    // Adiciona https://
    return `https://${domain}`
  }

  function getStatusColor (status?: string) {
    const colors: Record<string, string> = {
      RUNNING: 'success',
      STOPPED: 'grey',
      ERROR: 'error',
      STARTING: 'warning',
      DELETING: 'pink',
    }
    return colors[status || 'STOPPED'] || 'grey'
  }

  function getStatusIcon (status?: string) {
    const icons: Record<string, string> = {
      RUNNING: 'mdi-check-circle',
      STOPPED: 'mdi-stop-circle',
      ERROR: 'mdi-alert-circle',
      STARTING: 'mdi-loading',
      DELETING: 'mdi-delete-clock',
    }
    return icons[status || 'STOPPED'] || 'mdi-circle'
  }
</script>

<style scoped>
.iframe-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: #1e1e1e;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.app-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}
</style>
