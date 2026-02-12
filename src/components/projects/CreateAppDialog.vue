<template>
  <v-dialog
    max-width="600"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>Novo App</v-card-title>
      <v-card-text>
        <v-tabs v-model="createTab" class="mb-4">
          <v-tab value="manual">Manual</v-tab>
          <v-tab value="github">GitHub</v-tab>
        </v-tabs>

        <v-tabs-window v-model="createTab">
          <v-tabs-window-item value="manual">
            <v-text-field
              v-model="newApp.name"
              autofocus
              class="mb-4"
              label="Nome do App"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newApp.git"
              hint="Ex: https://github.com/user/repo.git"
              label="URL do Repositório Git"
              required
              variant="outlined"
            />
            <v-text-field
              v-model="newApp.branch"
              class="mt-4"
              hint="Deixe vazio para usar a branch padrão"
              label="Branch"
              variant="outlined"
            />

            <!-- Variáveis de Ambiente -->
            <v-divider class="my-4" />

            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-subtitle-1">Variáveis de Ambiente (Opcional)</h3>
              <div class="d-flex gap-2">
                <v-btn
                  color="secondary"
                  prepend-icon="mdi-file-import"
                  size="small"
                  variant="text"
                  @click="dialogImportEnv = true"
                >
                  Importar .env
                </v-btn>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  size="small"
                  variant="text"
                  @click="
                    dialogAddEnvVar = true;
                    tempEnvVar = { key: '', value: '' };
                  "
                >
                  Adicionar
                </v-btn>
              </div>
            </div>

            <!-- Lista de variáveis -->
            <v-list v-if="envVars.length > 0" density="compact">
              <v-list-item v-for="(envVar, index) in envVars" :key="index">
                <template #prepend>
                  <v-icon size="small">mdi-variable</v-icon>
                </template>
                <v-list-item-title>
                  <code>{{ envVar.key }}</code> =
                  <code>{{ envVar.value }}</code>
                </v-list-item-title>
                <template #append>
                  <v-btn
                    color="error"
                    icon
                    size="x-small"
                    variant="text"
                    @click="envVars.splice(index, 1)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <p v-else class="text-caption text-grey text-center py-2">
              Nenhuma variável adicionada
            </p>
          </v-tabs-window-item>

          <v-tabs-window-item value="github">
            <RepoSelector
              @cancel="emit('update:modelValue', false)"
              @select="handleRepoSelect"
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
      <v-card-actions v-if="createTab === 'manual'">
        <v-spacer />
        <v-btn
          variant="text"
          @click="emit('update:modelValue', false)"
        >Cancelar</v-btn>
        <v-btn color="primary" :loading="creating" @click="handleCreate">
          Criar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Adicionar Variável -->
  <v-dialog v-model="dialogAddEnvVar" max-width="500">
    <v-card>
      <v-card-title>Adicionar Variável</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="tempEnvVar.key"
          autofocus
          class="mb-4"
          hint="Ex: DATABASE_URL, API_KEY"
          label="Chave"
          placeholder="DATABASE_URL"
          variant="outlined"
        />
        <v-text-field
          v-model="tempEnvVar.value"
          hint="Ex: postgres://..., sk-..."
          label="Valor"
          placeholder="postgres://..."
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogAddEnvVar = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!tempEnvVar.key || !tempEnvVar.value"
          @click="confirmAddEnvVar"
        >
          Adicionar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Importar .env -->
  <v-dialog v-model="dialogImportEnv" max-width="600">
    <v-card>
      <v-card-title>Importar Variáveis do .env</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="envFileContent"
          autofocus
          hint="Cole o conteúdo do seu arquivo .env aqui"
          label="Conteúdo do .env"
          placeholder="DATABASE_URL=postgres://...
API_KEY=sk-...
PORT=3000"
          rows="10"
          variant="outlined"
        />
        <v-alert
          v-if="importError"
          class="mt-2"
          closable
          color="error"
          type="error"
          @click:close="importError = ''"
        >
          {{ importError }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogImportEnv = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          :disabled="!envFileContent"
          @click="importEnvFile"
        >
          Importar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { GitRepo } from '@/interfaces'

  import { ref } from 'vue'

  import RepoSelector from '@/components/git/RepoSelector.vue'

  defineProps<{
    modelValue: boolean
    creating?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'create': [
      payload: {
        name: string
        git: string
        branch?: string
        variables?: Record<string, string>
      },
    ]
    'create-from-repo': [
      payload: {
        name: string
        git: string
        branch?: string
        variables?: Record<string, string>
      },
    ]
  }>()

  const createTab = ref('manual')
  const newApp = ref({ name: '', git: '', branch: '' })
  const envVars = ref<Array<{ key: string, value: string }>>([])
  const dialogAddEnvVar = ref(false)
  const tempEnvVar = ref({ key: '', value: '' })
  const dialogImportEnv = ref(false)
  const envFileContent = ref('')
  const importError = ref('')

  function buildVariables (): Record<string, string> | undefined {
    if (envVars.value.length === 0) return undefined
    const variables: Record<string, string> = {}
    for (const envVar of envVars.value) {
      variables[envVar.key] = envVar.value
    }
    return variables
  }

  function confirmAddEnvVar () {
    if (!tempEnvVar.value.key || !tempEnvVar.value.value) return
    envVars.value.push({ ...tempEnvVar.value })
    dialogAddEnvVar.value = false
    tempEnvVar.value = { key: '', value: '' }
  }

  function importEnvFile () {
    importError.value = ''
    if (!envFileContent.value.trim()) {
      importError.value = 'Por favor, cole o conteúdo do arquivo .env'
      return
    }

    try {
      const lines = envFileContent.value.split('\n')
      let importedCount = 0

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const equalIndex = trimmed.indexOf('=')
        if (equalIndex === -1) continue

        const key = trimmed.slice(0, equalIndex).trim()
        let value = trimmed.slice(equalIndex + 1).trim()

        if (
          (value.startsWith('\'') && value.endsWith('\''))
          || (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1)
        }

        if (key && value) {
          const existingIndex = envVars.value.findIndex(v => v.key === key)
          if (existingIndex === -1) {
            envVars.value.push({ key, value })
          } else {
            const existing = envVars.value[existingIndex]
            if (existing) existing.value = value
          }
          importedCount++
        }
      }

      if (importedCount === 0) {
        importError.value
          = 'Nenhuma variável válida encontrada no formato KEY=VALUE'
        return
      }

      dialogImportEnv.value = false
      envFileContent.value = ''
    } catch (error_) {
      importError.value = 'Erro ao processar arquivo .env'
      console.error('Erro ao importar .env:', error_)
    }
  }

  function handleCreate () {
    if (!newApp.value.name.trim() || !newApp.value.git.trim()) return
    emit('create', {
      name: newApp.value.name,
      git: newApp.value.git,
      branch: newApp.value.branch || undefined,
      variables: buildVariables(),
    })
    resetForm()
  }

  function handleRepoSelect (repo: GitRepo) {
    emit('create-from-repo', {
      name: repo.name,
      git: repo.clone_url,
      branch: repo.default_branch,
      variables: buildVariables(),
    })
    resetForm()
  }

  function resetForm () {
    newApp.value = { name: '', git: '', branch: '' }
    envVars.value = []
  }
</script>
