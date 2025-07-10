# CFP UI - Plataforma de Llamados y Propuestas con ENS y Blockchain

Esta aplicación es una interfaz web desarrollada en Vue 3 y Vuetify que permite gestionar llamados (CFP, "Call for Proposals") y propuestas, integrando funcionalidades de Ethereum, ENS (Ethereum Name Service) y autenticación mediante Metamask.

## Características principales

- **Autenticación Web3:** Conexión y validación de usuarios mediante Metamask.
- **Registro ENS:** Los usuarios pueden asociar un nombre ENS a su dirección Ethereum para una mejor identificación.
- **Gestión de llamados:** Visualización de llamados activos, creación de nuevos llamados (solo usuarios autorizados), y detalle de cada llamado.
- **Registro y verificación de propuestas:** Permite subir propuestas de forma anónima o directamente on-chain usando Metamask.
- **Gestión de usuarios:** Panel para autorizar nuevos usuarios (solo visible para administradores/owners).
- **Integración con contratos inteligentes:** Toda la lógica de llamados, usuarios y propuestas está respaldada por smart contracts desplegados en la red configurada.

## Requisitos

- Node.js >= 18
- Tener Metamask instalado en el navegador.
- Acceso a los contratos desplegados (ver configuración de contratos en `contractsConfig.json`).

## Instalación

1. **Instalar las dependencias:**

   ```bash
   npm install
   ```

2. **Configurar el archivo `.env`:**

   Crea un archivo `.env` en la raíz del proyecto y define la URL base de la API backend:

   ```
   VITE_API_BASE_URL="URL"
   ```

   > Cambia la URL según dónde esté corriendo tu backend.

3. **Ejecuta la aplicación en modo desarrollo:**

   ```bash
   npm run dev
   ```

   La app estará disponible en [http://localhost:5173](http://localhost:5173) (o el puerto configurado en VITE_PORT).

## Scripts útiles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la app para producción.
- `npm run preview`: Previsualiza la app ya compilada.
- `npm run type-check`: Verifica los tipos TypeScript.

## Estructura general

- **src/views/**: Vistas principales (Home, Llamados, Detalle de llamado, Registro ENS para usuario, Gestión de Usuarios).
- **src/components/**: Componentes reutilizables.
- **src/services/**: Lógica de conexión con contratos y API.
- **src/composables/**: Hooks reutilizables para lógica de negocio y contratos.
- **contractsConfig.json**: Configuración de contratos y dominios ENS utilizados.

## Notas

- Solo los usuarios autorizados pueden crear llamados.
- Solo el administrador puede acceder a la gestión de usuarios.
- El registro ENS es opcional pero recomendado para una mejor experiencia.
