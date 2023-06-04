<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";
import PackageServices from "../services/PackageServices";

const router = useRouter();

const isEndDateBeforeStartDate = (endDate, startDate) => {
  if (startDate && endDate) {
    const isGreater = moment(new Date(endDate)).isSameOrBefore(startDate);
    return isGreater ? true : false;
  } else {
    return false;
  }
};

const props = defineProps({
  snackbar: {
    required: true,
  },
  inEdit: {
    required: true,
  },
  tripId: {
    required: true,
  },
});
const dontValidateDate = ref(false);
const newPackage = ref({
  title: "",
  description: "",
  price: "",
  startDate: "",
  endDate: "",
  totalDays: null,
  dayWiseDetails: [],
});

const rules = ref({
  required: [(v) => !!v || "Field is required"],
  dateValidation: [
    (v) => !!v || "Field is required",
    (value) => {
      const isPastDate = moment(new Date(value)).isSameOrBefore(new Date());
      return isPastDate ? "Please select a future date !" : true;
    },
    (value) => {
      return isEndDateBeforeStartDate(value, newPackage.value.startDate)
        ? "Package end date should be greater than the start date"
        : true;
    },
  ],
});
const emitActions = defineEmits(["getPackages", "closeCreateForm"]);

onMounted(() => {
  console.log({ props });
  if (props.inEdit && props.tripId) {
    dontValidateDate.value = true;
    getPackageDetails();
  }
});

function handleStartAndEndDate() {
  const { startDate = "", endDate = "" } = newPackage.value;
  if (startDate && endDate) {
    if (isEndDateBeforeStartDate(endDate, startDate)) {
      newPackage.value.dayWiseDetails = [];
      return;
    } else {
      console.log({ startDate, endDate });
      const momentStartDate = moment(startDate);
      const momentEndDate = moment(endDate);
      //// compare dates and get the days count
      const daysDiff = momentEndDate.diff(momentStartDate, "days") + 1;
      const destinationData = [];
      const destinationDates = [];
      for (
        let m = moment(momentStartDate);
        m.isSameOrBefore(momentEndDate);
        m.add(1, "days")
      ) {
        destinationDates.push(m.format("YYYY-MM-DD"));
      }
      for (let i = 0; i < daysDiff; i++) {
        const details = {
          date: destinationDates[i] || "",
          place: { title: "", modified: false },
          key: i,
          transport: { title: "", modified: false },
          food: { title: "", modified: false },
          hotel: { title: "", modified: false },
        };
        destinationData.push(details);
      }
      newPackage.value.dayWiseDetails = destinationData;
      newPackage.value.totalDays = destinationDates?.length;
    }
  } else {
    return;
  }
}

async function addPackage() {
  console.log({ newPackage });
  await PackageServices.createPackage(newPackage.value)
    .then(() => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `${newPackage.value.title} added successfully!`;
      emitActions("getPackages");
      emitActions("closeCreateForm");
    })
    .catch((error) => {
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response.data.message;
    });
}

async function getPackageDetails() {
  await PackageServices.getPackageById(props.tripId)
    .then((response) => {
      const tripData = response?.data || {};
      console.log({ tripData });
      newPackage.value.title = tripData.title;
      newPackage.value.description = tripData.description;
      newPackage.value.price = tripData?.price;
      newPackage.value.startDate = moment(tripData.startDate).format(
        "YYYY-MM-DD"
      );
      newPackage.value.endDate = moment(tripData.endDate).format("YYYY-MM-DD");
      newPackage.value.dayWiseDetails = tripData?.dayWiseDetails?.map((el) => {
        return { ...el, date: moment(el.date).format("YYYY-MM-DD") };
      });
    })
    .catch((error) => {
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response.data.message;
    });
}

async function editPackage() {
  await PackageServices.editPackage(tripId, newPackage.value)
    .then(() => {
      props.snackbar.value = true;
      props.snackbar.color = "green";
      props.snackbar.text = `${newPackage.value.title} updated successfully!`;
      emitActions("getTrips");
      emitActions("closeCreateForm");
    })
    .catch((error) => {
      console.log(error);
      props.snackbar.value = true;
      props.snackbar.color = "error";
      props.snackbar.text = error.response.data.message;
    });
}

console.log({ v: newPackage.value.dayWiseDetails });
</script>

<template>
  <v-form
    @submit.prevent="inEdit ? editPackage() : addPackage()"
    style="overflow: scroll"
  >
    <v-card class="rounded-lg elevation-5">
      <v-card-title class="heading_secondary text_align_center">{{
        inEdit ? "Edit Package" : "Create Package"
      }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newPackage.title"
          label="Package Name *"
          :rules="rules.required"
          variant="outlined"
        ></v-text-field>
        <v-textarea
          v-model="newPackage.description"
          label="Package Description"
          auto-grow
          rows="2"
          :rules="rules.required"
          variant="outlined"
        ></v-textarea>
        <v-text-field
          v-model.number="newPackage.price"
          label="Package Price *"
          type="number"
          :rules="rules.required"
          variant="outlined"
        ></v-text-field>
        <v-card-title> Package start date and end date </v-card-title>
        <v-row>
          <v-text-field
            type="date"
            label="Start Date *"
            class="mx-2"
            v-model="newPackage.startDate"
            @change="handleStartAndEndDate"
            :rules="dontValidateDate ? '' : rules.dateValidation"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            type="date"
            label="End Date *"
            v-model="newPackage.endDate"
            @change="handleStartAndEndDate"
            :rules="dontValidateDate ? '' : rules.dateValidation"
            variant="outlined"
          ></v-text-field>
        </v-row>

        <section
          v-show="
            newPackage.dayWiseDetails && newPackage.dayWiseDetails.length !== 0
          "
        >
          <v-card-title class="error">
            Please enter the day destination package details
          </v-card-title>
          <div class="destinations-wrapper">
            <v-row
              :key="destionDetails.key"
              v-for="destionDetails in newPackage.dayWiseDetails"
            >
              <v-text-field
                type="date"
                label="Date of travel *"
                class="mx-2"
                v-model="destionDetails.date"
                disabled
                :rules="rules.required"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                type="text"
                label="Location *"
                class="mx-2"
                v-model="destionDetails.place.title"
                :rules="rules.required"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                type="text"
                label="Food"
                class="mx-2"
                v-model="destionDetails.food.title"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                type="text"
                label="Hotel"
                class="mx-2"
                v-model="destionDetails.hotel.title"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                type="text"
                label="Transportation *"
                class="mx-2"
                v-model="destionDetails.transport.title"
                :rules="rules.required"
                variant="outlined"
              ></v-text-field>
            </v-row>
          </div>
        </section>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="flat"
          color="secondary"
          @click="emitActions('closeCreateForm')"
          >Close</v-btn
        >
        <v-btn variant="flat" color="primary" type="submit">{{
          inEdit ? "Update Package" : "Create Package"
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style>
.destinations-wrapper {
  height: 250px;
  overflow-y: scroll;
  padding: 20px;
}
</style>