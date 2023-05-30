<script setup>
import { computed, onMounted, ref, watch } from "vue";
import MenuBar from "./components/MenuBar.vue";
import { useRoute, useRouter } from "vue-router";
import "../styles/global.css";
const router = useRouter();
const route = useRoute();

const currentPath = ref(null);
const userRole = ref(null);

const validateAuthorization = () => {
  const userInfo = localStorage.getItem("user") || "{}";
  const { token = "", id = "", role = "" } = JSON.parse(userInfo);
  if (token && id && (role === "admin" || role === "user")) {
    router.push({ name: "packages" });
    userRole.value = role;
  } else {
    console.log("coming to here ?>????????");
    router.push({ name: "login" });
  }
  currentPath.value = route.path;
};

onMounted(() => {
  validateAuthorization();
});

watch(() => route.params, validateAuthorization);
</script>
<template>
  <v-app>
    <MenuBar :key="$route.fullPath" v-if="currentPath !== '/'" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
