# 📄 CFP Frontend

Interfaz web desarrollada con **Vue 3**, **Vite** y **Vuetify** para interactuar con la API desarrollada en TP8. Permite visualizar llamados, registrar propuestas y verificar la existencia de propuestas previamente registradas.

---

## Requisitos

- Node.js >= 18
- NPM >= 9

---

## Configuración


### Instalar dependencias

```bash
npm install
```

### Configurar archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
- `VITE_API_URL`: URL base del backend Flask
- `VITE_PORT`: Puerto del servidor de desarrollo

> Las variables deben comenzar con `VITE_` para que estén disponibles en el cliente.

---

## Scripts disponibles

### Desarrollo con hot-reload

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5175` (o el puerto definido).

### Compilar para producción

```bash
npm run build
```