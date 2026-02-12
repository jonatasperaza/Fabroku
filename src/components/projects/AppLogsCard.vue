<template>
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
        @click="emit('refresh')"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="pa-4">
      <LogViewer
        :has-more="hasMore"
        :loading="loading"
        :logs="logs"
        :task-id="taskId"
        title="Logs"
        @load-more="emit('load-more')"
        @stream-logs="(taskId, afterId) => emit('stream-logs', taskId, afterId)"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import LogViewer from '@/components/logs/LogViewer.vue'

  defineProps<{
    logs: any[]
    loading?: boolean
    hasMore?: boolean
    taskId?: string
  }>()

  const emit = defineEmits<{
    'refresh': []
    'load-more': []
    'stream-logs': [taskId: string, afterId?: number]
  }>()
</script>
