<template>
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
            <a :href="app.git" target="_blank">
              {{ app.git }}
            </a>
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="app.branch">
          <template #prepend>
            <v-icon>mdi-source-branch</v-icon>
          </template>
          <v-list-item-title>Branch</v-list-item-title>
          <v-list-item-subtitle>{{ app.branch }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="app.domain">
          <template #prepend>
            <v-icon>mdi-web</v-icon>
          </template>
          <v-list-item-title>URL do App</v-list-item-title>
          <v-list-item-subtitle>
            <a :href="getAppUrl(app.domain)" target="_blank">
              {{ getAppUrl(app.domain) }}
              <v-icon size="small">mdi-open-in-new</v-icon>
            </a>
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="app.port">
          <template #prepend>
            <v-icon>mdi-numeric</v-icon>
          </template>
          <v-list-item-title>Porta</v-list-item-title>
          <v-list-item-subtitle>{{ app.port }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon>mdi-calendar</v-icon>
          </template>
          <v-list-item-title>Criado em</v-list-item-title>
          <v-list-item-subtitle>{{
            formatDate(app.created_at)
          }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon>mdi-calendar-edit</v-icon>
          </template>
          <v-list-item-title>Atualizado em</v-list-item-title>
          <v-list-item-subtitle>{{
            formatDate(app.updated_at)
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { App } from '@/interfaces'

  defineProps<{
    app: App
  }>()

  function formatDate (dateString?: string) {
    if (!dateString) return '-'
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
    if (domain.startsWith('http://') || domain.startsWith('https://'))
      return domain
    return `https://${domain}`
  }
</script>
