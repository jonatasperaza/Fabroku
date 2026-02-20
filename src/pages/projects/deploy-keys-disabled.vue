<template>
  <v-container class="py-10 text-center">
    <v-icon color="warning" size="x-large">mdi-lock-alert</v-icon>
    <h1 class="text-h4 font-weight-bold mt-4 mb-2">
      Deploy keys desabilitadas no GitHub
    </h1>
    <p class="mb-4">
      O deploy automático não pôde ser realizado porque as
      <b>deploy keys</b> estão desabilitadas neste repositório.<br>
      Para continuar, ative as deploy keys nas configurações do repositório no
      GitHub.
    </p>
    <v-btn
      v-if="helpUrl"
      class="mb-2"
      color="primary"
      :href="helpUrl"
      prepend-icon="mdi-open-in-new"
      target="_blank"
    >
      Ver documentação do GitHub
    </v-btn>
    <v-btn color="secondary" @click="$router.back()">Voltar</v-btn>
  </v-container>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const helpUrl = computed(
    () =>
      (route.query.help_url as string)
      || 'https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/about-ssh-deploy-keys',
  )
</script>
