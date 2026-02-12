<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>
        <v-icon class="mr-2">mdi-database</v-icon>
        Banco de Dados
      </span>
      <v-btn
        v-if="!hasDatabase"
        color="primary"
        :disabled="!appName"
        :loading="creating"
        prepend-icon="mdi-database-plus"
        size="small"
        variant="tonal"
        @click="emit('create')"
      >
        Criar PostgreSQL
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Sem banco de dados -->
      <div v-if="!hasDatabase && !creating" class="text-center py-4 text-grey">
        <v-icon class="mb-2" color="grey" size="48">mdi-database-off</v-icon>
        <p class="mb-2">Nenhum banco de dados vinculado</p>
        <p class="text-caption">
          Crie um banco PostgreSQL e a variável <code>DATABASE_URL</code>
          será injetada automaticamente no app.
        </p>
      </div>

      <!-- Criando banco -->
      <div v-else-if="creating" class="text-center py-4">
        <v-progress-circular
          class="mb-3"
          color="primary"
          indeterminate
          size="48"
        />
        <p class="text-primary">Criando banco de dados...</p>
        <p class="text-caption text-grey">
          O banco será provisionado e a <code>DATABASE_URL</code> será
          automaticamente configurada.
        </p>
      </div>

      <!-- Banco de dados existente -->
      <div v-else>
        <v-list density="compact">
          <v-list-item v-for="service in services" :key="service.id">
            <template #prepend>
              <v-icon color="success">mdi-database-check</v-icon>
            </template>
            <v-list-item-title class="d-flex align-center">
              <span class="font-weight-medium">{{ service.name }}</span>
              <v-chip class="ml-2" color="blue" size="x-small" variant="tonal">
                {{ service.service_type }}
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              Contêiner: <code>{{ service.container_name || "-" }}</code>
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                color="error"
                icon
                :loading="deletingId === service.id"
                size="small"
                variant="text"
                @click="emit('delete', service.id!)"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip
                  activator="parent"
                  location="top"
                >Remover banco</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-alert
          class="mt-3"
          color="success"
          density="compact"
          icon="mdi-check-circle"
          variant="tonal"
        >
          A variável <code>DATABASE_URL</code> foi injetada automaticamente pelo
          Dokku ao vincular o banco.
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { Service } from '@/interfaces'

  import { computed } from 'vue'

  const props = defineProps<{
    services: Service[]
    appName?: string
    creating?: boolean
    deletingId?: number | null
  }>()

  const emit = defineEmits<{
    create: []
    delete: [serviceId: number]
  }>()

  const hasDatabase = computed(() => props.services.length > 0)
</script>
