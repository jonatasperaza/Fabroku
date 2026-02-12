<template>
  <!-- Preview do App -->
  <v-card v-if="app.domain && app.status === 'RUNNING'" class="mb-4">
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
          :href="getAppUrl(app.domain)"
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
          :src="getAppUrl(app.domain)"
          title="App Preview"
        />
      </div>
    </v-card-text>
  </v-card>

  <!-- Mensagem quando não há preview -->
  <v-card v-else class="mb-4">
    <v-card-title>
      <v-icon class="mr-2">mdi-monitor-off</v-icon>
      Preview
    </v-card-title>
    <v-card-text class="text-center py-8">
      <v-icon class="mb-2" color="grey" size="64">mdi-web-off</v-icon>
      <p class="text-grey">
        <template v-if="!app.domain">
          O app ainda não possui uma URL configurada.
        </template>
        <template v-else>
          O app precisa estar rodando para exibir o preview.
        </template>
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { App } from '@/interfaces'

  import { ref } from 'vue'

  defineProps<{
    app: App
  }>()

  const iframeKey = ref(0)

  function refreshIframe () {
    iframeKey.value++
  }

  function getAppUrl (domain?: string | null): string {
    if (!domain) return ''
    if (domain.startsWith('http://') || domain.startsWith('https://'))
      return domain
    return `https://${domain}`
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
