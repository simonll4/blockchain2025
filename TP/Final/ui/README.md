# Aplicación Vue 3

Esta es una aplicación web moderna construida con Vue 3 y Vite.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (versión 16.x o superior)
- npm (viene incluido con Node.js)

## Instalación

Instala las dependencias:

```bash
npm install
```

# Variables de Entorno (.env)

Configura el archivo `.env` en la raíz del proyecto con estas variables:

```env
VITE_API_BASE_URL= # URL del backend API
VITE_PORT= # Puerto del frontend (Vite)
VITE_NETWORK_ID= # ID de la red blockchain
VITE_CHAIN_ID= # ID de la cadena
VITE_CFP_CONTRACT_PATH=../contracts/build/contracts/CFP.json # Ruta al contrato CFP
VITE_CFPFACTORY_CONTRACT_PATH=../contracts/build/contracts/CFPFactory.json # Ruta al contrato Factory
```

## Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:5173` (puerto por defecto).

## Compilación para Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Esto generará un directorio `dist` con los archivos compilados listos para desplegar.

## Estructura del Proyecto

```
├── public/ # Archivos estáticos
├── src/ # Código fuente principal de la aplicación
│ ├── assets/       # Recursos
│ ├── components/   # Componentes Vue
│ ├── composables/  # Lógica reusable con Composition API
│ ├── services/     # Capa de servicios (API calls, blockchain interactions)
│ ├── layouts/      # Componentes de diseño base
│ ├── plugins/      # Extensiones de Vue
│ ├── router/       # Configuración de rutas
│ ├── views/        # Componentes de página/pantalla
│ ├── store/        # Estado global (Pinia stores)
│ ├── utils/        # Funciones utilitarias
│ ├── App.vue       # Componente raíz
│ └── main.js       # Punto de entrada de la aplicación
├── .env            # Variables de entorno
├── index.html      # Archivo HTML de entrada
├── vite.config.js  # Configuración de Vite
└── package.json    # Dependencias y scripts del proyecto
```

## Scripts

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza la compilación de producción

## Notas Adicionales

- La aplicación utiliza la Composition API de Vue 3
- Se utiliza Vite como herramienta de compilación
- Para más detalles, consulta la documentación de Vue 3: [Documentación Vue 3](https://v3.vuejs.org/)
