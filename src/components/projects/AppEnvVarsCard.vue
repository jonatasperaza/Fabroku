<template>
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
        v-if="variables && Object.keys(variables).length > 0"
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
          <tr v-for="(value, key) in variables" :key="key">
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
                @click="emit('remove', String(key))"
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
        v-if="variables && Object.keys(variables).length > 0"
        v-model="showSecrets"
        class="mt-2"
        density="compact"
        hide-details
        label="Mostrar valores"
      />
    </v-card-text>
  </v-card>

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
          :loading="saving"
          @click="handleAdd"
        >
          Adicionar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  defineProps<{
    variables?: Record<string, string>
    saving?: boolean
  }>()

  const emit = defineEmits<{
    add: [envVar: { key: string, value: string }]
    remove: [key: string]
  }>()

  const showSecrets = ref(false)
  const dialogEnvVar = ref(false)
  const newEnvVar = ref({ key: '', value: '' })

  function handleAdd () {
    if (!newEnvVar.value.key || !newEnvVar.value.value) return
    emit('add', { ...newEnvVar.value })
    dialogEnvVar.value = false
    newEnvVar.value = { key: '', value: '' }
  }
</script>
