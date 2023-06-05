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
  activeTab: {
    required: true,
  },
});
const emitActions = defineEmits([
  "getPackages",
  "handleEdit",
  "getUserEnrolledPackages",
]);
onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function deletePackage(id) {
  await PackageServices.deletePackage(id);
  emitActions("getPackages");
}
async function handleEnrollPackage(enrollData) {
  await PackageServices.enrollPackage(enrollData)
    .then(() => {
      if (props.activeTab === "enrolled") {
        emitActions("getUserEnrolledPackages");
      } else {
        emitActions("getPackages");
      }
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `You have enrolled for the trip successfully!`;
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response.data.message;
    });
}
console.log({ a: props.activeTab });
</script>

<template>
  <v-card
    class="rounded-lg elevation-5 mb-8"
    @click="showDetails = !showDetails"
  >
    <v-card-title class="headline">
      <h3 class="text_align_center">
        {{ packageItem?.title }}
        <v-chip
          size="small"
          pill
          color="blue"
          v-if="packageItem?.titleModified"
        >
          MODIFIED
          <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
        ></v-chip>
      </h3>
      <v-row align="center">
        <v-col cols="10">
          <v-chip class="ma-2" color="primary" label>
            <v-icon start icon="mdi-currency-usd"></v-icon>
            Package Price - {{ packageItem?.price }}
            <v-chip
              size="small"
              pill
              color="blue"
              v-if="packageItem?.priceModified"
            >
              MODIFIED
              <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
            ></v-chip>
          </v-chip>
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-calendar-range"></v-icon>
            Package Start & End Date ---
            {{ moment(packageItem?.startDate).format("MMMM DD, YYYY") }} to
            {{ moment(packageItem?.endDate).format("MMMM DD, YYYY") }}
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end" v-if="user?.role === 'admin'">
          <v-icon
            size="small"
            color="blue"
            icon="mdi-pencil"
            @click="emitActions('handleEdit', packageItem.id)"
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
      {{ packageItem?.description }}
      <v-chip
        size="small"
        pill
        color="blue"
        v-if="packageItem?.descriptionModified"
      >
        MODIFIED
        <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
      ></v-chip>
    </v-card-text>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>Package Details</h3>
        <v-col class="d-flex justify-center" v-if="user?.role === 'user'">
          <v-btn
            class="mx-2"
            color="darkblue"
            v-if="!packageItem?.isEnrolled && activeTab !== 'enrolled'"
            @click="
              handleEnrollPackage({
                isEnrolled: true,
                packageId: packageItem.id,
                userId: user.id,
              })
            "
            >Click to enroll for this package</v-btn
          >
          <v-btn
            class="mx-2"
            color="error"
            v-else-if="packageItem?.isEnrolled || activeTab === 'enrolled'"
            @click="
              handleEnrollPackage({
                isEnrolled: false,
                packageId: packageItem.id,
                userId: user.id,
              })
            "
            >Click to cancel this package</v-btn
          >
        </v-col>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Travel Date</th>
              <th class="text-left">Food</th>
              <th class="text-left">Hotel</th>
              <th class="text-left">Place</th>
              <th class="text-left">Transportation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="step in packageItem?.dayWiseDetails" :key="step.id">
              <td>{{ moment(step.date).format("MMMM DD, YYYY") }}</td>
              <td>
                <v-chip size="small" pill>{{ step.food[0].title }} </v-chip>
                <v-chip
                  size="small"
                  pill
                  color="blue"
                  v-if="step.food[0].modified"
                >
                  MODIFIED
                  <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
                ></v-chip>
              </td>
              <td>
                {{ step.hotel[0].title }}
                <v-chip
                  size="small"
                  pill
                  color="blue"
                  v-if="step.hotel[0].modified"
                >
                  MODIFIED
                  <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
                ></v-chip>
              </td>
              <td>
                {{ step.place[0].title }}
                <v-chip
                  size="small"
                  pill
                  color="blue"
                  v-if="step.place[0].modified"
                >
                  MODIFIED
                  <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
                ></v-chip>
              </td>
              <td>
                {{ step.transport[0].title }}
                <v-chip
                  size="small"
                  pill
                  color="blue"
                  v-if="step.transport[0].modified"
                >
                  MODIFIED
                  <v-icon size="small" color="blue" icon="mdi-pencil"></v-icon
                ></v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
