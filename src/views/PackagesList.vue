<script setup>
import { computed, onMounted } from "vue";
import { ref } from "vue";
import RecipeCard from "../components/RecipeCardComponent.vue";
import CreateTrip from "../components/CreatePackage.vue";
import RecipeServices from "../services/RecipeServices.js";
import PackageServices from "../services/PackageServices";

const packages = ref([]);
const isAdd = ref(false);
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const activeTab = ref("upcoming");

onMounted(async () => {
  await getPackages();
});

async function getPackages() {
  user.value = JSON.parse(localStorage.getItem("user"));
  activeTab.value = "upcoming";
  await PackageServices.getAllPackages()
    .then((response) => {
      packages.value = response.data;
    })
    .catch((error) => {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

function openAdd() {
  isAdd.value = true;
}

function closeCreateForm() {
  isAdd.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}

async function getUserEnrolledPackages() {
  activeTab.value = "enrolled";
  packages.value = [];
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col>
          <div class="tabs__container text-align-center">
            <v-btn
              @click="getPackages"
              :color="activeTab === 'upcoming' ? 'primary' : ''"
              >UPCOMING PACKAGES</v-btn
            >
            <v-btn
              v-show="user?.role !== 'admin'"
              @click="getUserEnrolledPackages"
              :color="activeTab === 'enrolled' ? 'primary' : ''"
              >ENROLLED PACKAGES</v-btn
            >
          </div>
        </v-col>
        <v-col class="d-flex justify-end align-center">
          <v-select
            class="mx-2"
            color="accent"
            label="FILTER PACKAGES"
            density="comfortable"
            :items="[
              'CANCELLED',
              'COMPLETED',
              'PRICE ABOVE 500$',
              'PRICE BELOW 500$',
            ]"
          ></v-select>
          <v-btn
            class="mx-2"
            color="darkblue"
            v-if="user?.role === 'admin'"
            @click="openAdd()"
            >Create Package</v-btn
          >
        </v-col>
      </v-row>

      <RecipeCard
        v-show="packages && packages.length !== 0"
        v-for="packageItem in packages"
        :key="packageItem.id"
        :packageItem="packageItem"
        @deletedList="getLists()"
        @getPackages="getPackages"
      />

      <v-card
        class="rounded-lg elevation-5 mb-8"
        v-if="!packages || packages.length === 0"
      >
        <v-card-title class="error-msg">
          NO DETAILS FOUND MATCHING THIS CRITERIA
        </v-card-title></v-card
      >

      <v-dialog persistent v-model="isAdd" style="width: 90%">
        <CreateTrip
          @closeCreateForm="closeCreateForm"
          @getPackages="getPackages"
          :snackbar="snackbar"
        />
      </v-dialog>
      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>

<style >
.tabs__container {
  background: #e5e2e296;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  width: max-content;
}
.tabs__container button {
  height: 45px;
}
.v-select > .v-input__details {
  display: none !important;
}
</style>
