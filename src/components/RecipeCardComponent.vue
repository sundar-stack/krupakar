<script setup>
import moment from "moment";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PackageServices from "../services/PackageServices";

const router = useRouter();

const showDetails = ref(false);
const recipeIngredients = ref([]);
const recipeSteps = ref([]);
const user = ref(null);

const props = defineProps({
  packageItem: {
    required: true,
  },
});
const emitActions = defineEmits(["getPackages"]);
onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

function navigateToEdit(e) {
  e.stopPropagation();
  router.push({ name: "editRecipe", params: { id: props.packageItem.id } });
}

async function deletePackage(id) {
  await PackageServices.deletePackage(id);
  emitActions("getPackages");
}
</script>

<template>
  <v-card
    class="rounded-lg elevation-5 mb-8"
    @click="showDetails = !showDetails"
  >
    <v-card-title class="headline">
      <h3 class="text_align_center">
        {{ packageItem.title }}
      </h3>
      <v-row align="center">
        <v-col cols="10">
          <v-chip class="ma-2" color="primary" label>
            <v-icon start icon="mdi-currency-usd"></v-icon>
            Package Price - {{ packageItem.price }}
          </v-chip>
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-calendar-range"></v-icon>
            Package Start & End Date ---
            {{ moment(packageItem.startDate).format("MMMM DD, YYYY") }} to
            {{ moment(packageItem.endDate).format("MMMM DD, YYYY") }}
          </v-chip>
          <v-btn class="mx-2" color="darkblue" v-if="user?.role === 'user'"
            >Enroll</v-btn
          >
          <v-btn class="mx-2" color="error" v-if="user?.role === 'user'"
            >Cancel</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end" v-if="user?.role === 'admin'">
          <v-icon
            size="small"
            color="blue"
            icon="mdi-pencil"
            @click="navigateToEdit"
          ></v-icon>
          <v-icon
            size="small"
            color="error"
            icon="mdi-delete"
            class="mx-2"
            @click="deletePackage(packageItem.id)"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      {{ packageItem.description }}
    </v-card-text>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>Package Details</h3>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Travel Date</th>
              <th class="text-left">Food</th>
              <th class="text-left">Place</th>
              <th class="text-left">Transportation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="step in packageItem.day" :key="step.id">
              <td>{{ moment(step.date).format("MMMM DD, YYYY") }}</td>
              <td>
                <v-chip
                  size="small"
                  v-for="ingredient in step.food"
                  :key="ingredient.id"
                  pill
                  >{{ ingredient.title }}</v-chip
                >
              </td>
              <td>{{ step.place[0].title }}</td>
              <td>{{ step.transport[0].title }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
