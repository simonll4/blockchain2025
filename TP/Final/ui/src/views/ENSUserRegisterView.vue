<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegisterUser } from "@/composables/contracts/ens/useENSRegisterUser";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const { ensName } = storeToRefs(userStore);

const username = ref("");
const formRef = ref();

const { account } = useMetamask();
const userAddress = computed(() => account.value || "");

const { registerUserName, isLoading, error } = useENSRegisterUser();
const showSuccess = ref(false);

const onRegister = async () => {
  const { valid } = await formRef.value.validate();

  if (!valid) return;

  const ok = await registerUserName(username.value);

  if (ok) {
    showSuccess.value = true;

    formRef.value.reset();
    username.value = "";

    setTimeout(() => {
      showSuccess.value = false;
    }, 4000);
  }
};
</script>

<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <v-card class="pa-6" max-width="420" elevation="8">
      <v-card-title class="text-h5 font-weight-bold mb-2">
        Registrar tu nombre ENS
      </v-card-title>
      <v-card-subtitle class="mb-4">
        Asocia un nombre de usuario a tu dirección de Ethereum
      </v-card-subtitle>

      <v-form @submit.prevent="onRegister" ref="formRef">
        <v-text-field
          v-model="username"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account"
          :disabled="isLoading"
          :rules="[(v) => !!v || 'El nombre es requerido']"
          required
        />

        <v-btn
          :loading="isLoading"
          color="primary"
          class="mt-4"
          type="submit"
          block
        >
          Registrar
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          class="mt-3"
          border="start"
          variant="tonal"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="showSuccess"
          type="success"
          class="mt-3"
          border="start"
          variant="tonal"
        >
          ¡Registro exitoso! Tu nombre ENS ha sido registrado.
        </v-alert>
      </v-form>

      <v-divider class="my-6" />

      <div class="text-center">
        <div class="mb-2 text-caption">Resolución actual:</div>
        <v-chip
          v-if="ensName"
          color="primary"
          class="mb-2"
          prepend-icon="mdi-account"
        >
          {{ ensName }}
        </v-chip>
        <v-chip v-else color="grey" class="mb-2" prepend-icon="mdi-wallet">
          {{ userAddress }}
        </v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<!-- <script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegisterUser } from "@/composables/contracts/ens/useENSRegisterUser";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const { ensName } = storeToRefs(userStore);

const username = ref("");

const { account } = useMetamask();
const userAddress = computed(() => account.value || "");

const { registerUserName, isLoading, error, success, message } =
  useENSRegisterUser();

const showSuccess = ref(false);

const onRegister = async () => {
  showSuccess.value = false;

  const result = await registerUserName(username.value);

  if (result) {
    showSuccess.value = true;
    username.value = ""; // limpia el input

    setTimeout(() => {
      showSuccess.value = false;
    }, 4000);
  }
};
// const onRegister = async () => {
//   const ok = await registerUserName(username.value);
//   if (ok) {
//     showSuccess.value = true;
//     setTimeout(() => {
//       showSuccess.value = false;
//     }, 4000); // Oculta el mensaje luego de 4 segundos
//   }
// };
</script>
<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <v-card class="pa-6" max-width="420" elevation="8">
      <v-card-title class="text-h5 font-weight-bold mb-2">
        Registrar tu nombre ENS
      </v-card-title>
      <v-card-subtitle class="mb-4">
        Asocia un nombre de usuario a tu dirección de Ethereum
      </v-card-subtitle>

      <v-form @submit.prevent="onRegister">
        <v-text-field
          v-model="username"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account"
          :disabled="isLoading"
          :rules="[(v) => !!v || 'El nombre es requerido']"
          required
        />

        <v-btn
          :loading="isLoading"
          color="primary"
          class="mt-4"
          type="submit"
          block
        >
          Registrar
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          class="mt-3"
          border="start"
          variant="tonal"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="showSuccess"
          type="success"
          class="mt-3"
          border="start"
          variant="tonal"
        >
          ¡Registro exitoso! Tu nombre ENS ha sido registrado.
        </v-alert>
      </v-form>

      <v-divider class="my-6" />

      <div class="text-center">
        <div class="mb-2 text-caption">Resolución actual:</div>
        <v-chip
          v-if="ensName"
          color="primary"
          class="mb-2"
          prepend-icon="mdi-account"
        >
          {{ ensName }}
        </v-chip>
        <v-chip v-else color="grey" class="mb-2" prepend-icon="mdi-wallet">
          {{ userAddress }}
        </v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<!-- <script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegisterUser } from "@/composables/contracts/ens/useENSRegisterUser";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const { ensName } = storeToRefs(userStore);

const username = ref("");

const { account } = useMetamask();
const userAddress = computed(() => account.value || "");

const { registerUserName, isLoading, error, success, message } =
  useENSRegisterUser();

const onRegister = async () => {
  const ok = await registerUserName(username.value);
};
</script>

<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <v-card class="pa-6" max-width="420" elevation="8">
      <v-card-title class="text-h5 font-weight-bold mb-2">
        Registrar tu nombre ENS
      </v-card-title>
      <v-card-subtitle class="mb-4">
        Asocia un nombre de usuario a tu dirección de Ethereum
      </v-card-subtitle>

      <v-form @submit.prevent="onRegister" v-if="!success">
        <v-text-field
          v-model="username"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account"
          :disabled="isLoading"
          :rules="[(v) => !!v || 'El nombre es requerido']"
          required
        />
        <v-btn
          :loading="isLoading"
          color="primary"
          class="mt-4"
          type="submit"
          block
        >
          Registrar
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          class="mt-3"
          border="start"
          variant="tonal"
        >
          {{ error }}
        </v-alert>
      </v-form>

      <v-alert
        v-if="success"
        type="success"
        class="mt-3"
        border="start"
        variant="tonal"
      >
        ¡Registro exitoso! Tu nombre ENS ha sido registrado.
      </v-alert>

      <v-divider class="my-6" />

      <div class="text-center">
        <div class="mb-2 text-caption">Resolución actual:</div>
        <v-chip
          v-if="ensName"
          color="primary"
          class="mb-2"
          prepend-icon="mdi-account"
        >
          {{ ensName }}
        </v-chip>
        <v-chip v-else color="grey" class="mb-2" prepend-icon="mdi-wallet">
          {{ userAddress }}
        </v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style> -->
-->
