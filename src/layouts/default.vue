<template>
  <v-app>
    <v-navigation-drawer permanent>
      <v-sheet class="d-flex align-center pr-5" elevation="0">

        <v-card
          class="d-flex align-center px-3"
          elevation="0"
          rounded="lg"
        >
          <v-avatar :image="authStore.user?.avatar_url" :name="authStore.user?.name" />
          <div class="ml-2">
            <div class="text-subtitle-2 font-weight-medium cursor-pointer">
              {{ authStore.user?.name || 'Usuário' }}
            </div>
          </div>
        </v-card>
      </v-sheet>
      <v-list class="d-flex flex-column align-center px-2">
        <v-list-item
          class="menu-item"
          link
          prepend-icon="mdi-home"
          rounded="lg"
          title="Dashboard"
          to="/dashboard"
        />
        <v-list-item
          class="menu-item"
          link
          prepend-icon="mdi-folder"
          rounded="lg"
          title="Projects"
          to="/projects"
        />
        <v-list-item
          class="menu-item"
          link
          prepend-icon="mdi-cog"
          rounded="lg"
          title="Settings"
          to="/settings"
        />
        <v-list-item
          class="menu-item"
          link
          prepend-icon="mdi-file-document"
          rounded="lg"
          title="Documentation"
          to="/documentation"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useAuthStore } from '@/stores'
  const authStore = useAuthStore()

  onMounted(() => {
    authStore.checkAuth()
  })
</script>

<style scoped>
.menu-item {
  width: 100%;
  margin-bottom: 12px;
  height: 10px;
}

/* Reduz a margem do ícone */
.menu-item :deep(.v-list-item__spacer) {
  width: 16px;
}
</style>
