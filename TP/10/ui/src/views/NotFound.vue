<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-6 text-center">
          <v-card-title class="text-h2 text-error font-weight-bold"
            >404</v-card-title
          >
          <v-card-subtitle class="text-h6 mb-4"
            >Página no encontrada</v-card-subtitle
          >

          <v-img
            src="@/assets/404-illustration.svg"
            height="180"
            contain
            class="mb-6"
            alt="404 Not Found"
          />

          <v-btn color="primary" to="/" variant="flat">
            Volver al inicio
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
