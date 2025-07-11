# Sistema de Llamados a Presentación de Propuestas (CFP) con Blockchain

Un sistema de gestión de llamados y propuestas basado en blockchain, que integra smart contracts, API REST y una interfaz web con soporte para ENS (Ethereum Name Service).

## 📋 Descripción General

Este proyecto implementa un sistema descentralizado para la gestión de **Llamados a Presentación de Propuestas (CFP)** que permite:

- **Crear y gestionar llamados** con fechas de cierre específicas
- **Registrar propuestas** de forma anónima o asociadas a usuarios
- **Sistema de autorización** con estados de cuenta (No registrado, Pendiente, Autorizado)
- **Integración ENS** para identificación de usuarios y llamados mediante nombres legibles
- **Factoría de contratos** para creación dinámica de llamados
- **Interfaz web moderna** con autenticación Web3 mediante MetaMask

## Arquitectura del Sistema

El proyecto está estructurado en **3 componentes principales** que trabajan en conjunto:

### [**`/contracts`**](./contracts/) - Smart Contracts (Solidity + Truffle)
**Tecnologías:** Solidity, Truffle, Web3.js, ENS

Sistema de contratos inteligentes que implementa la lógica de negocio:

- **`CFPFactory.sol`** - Factoría principal que gestiona la creación de llamados y autorización de usuarios
- **`CFP.sol`** - Contratos individuales para cada llamado que manejan las propuestas
- **Sistema ENS completo** - Registry, Registrars, Resolvers para identificación mediante nombres
- **Dominios personalizados:** `usuarios.cfp`, `llamados.cfp`, `addr.reverse`

📖 [Ver documentación detallada](./contracts/README.md)

### [**`/api`**](./api/) - API REST (NestJS + TypeScript)
**Tecnologías:** NestJS, TypeScript, Ethers.js, Jest

API REST que actúa como intermediario entre la interfaz web y la blockchain:

- **Gestión de cuentas** - Registro y autorización de usuarios
- **Gestión de llamados** - Creación, listado y consulta de llamados
- **Gestión de propuestas** - Registro y verificación de propuestas
- **Integración ENS** - Resolución de nombres y direcciones

📖 [Ver documentación detallada](./api/README.md)

### [**`/ui`**](./ui/) - Interfaz Web (Vue 3 + Vuetify)
**Tecnologías:** Vue 3, Vuetify, TypeScript, Pinia, Ethers.js

Interfaz web moderna y responsiva que proporciona acceso completo al sistema:

- **Autenticación Web3** - Conexión mediante MetaMask
- **Gestión de llamados** - Visualización, creación y detalle de llamados
- **Registro ENS** - Asociación de nombres a direcciones Ethereum
- **Gestión de propuestas** - Envío anónimo y verificación
- **Panel administrativo** - Autorización de usuarios (solo para owners)
- **Integración completa** - Conexión directa con contratos y API

📖 [Ver documentación detallada](./ui/README.md)

## Stack Tecnológico

### Blockchain & Smart Contracts
- **Solidity** ^0.8.19 - Lenguaje de contratos inteligentes
- **Truffle** - Framework de desarrollo y testing
- **Web3.js** ^4.16.0 - Interacción con Ethereum
- **ENS** - Sistema de nombres de Ethereum

### Backend
- **NestJS** ^11.0.1 - Framework Node.js para APIs
- **TypeScript** ^5.7.3 - Tipado estático
- **Ethers.js** ^6.14.3 - Biblioteca Ethereum
- **PyTest** - Testing

### Frontend
- **Vue 3** ^3.5.13 - Framework progresivo
- **Vuetify** ^3.8.7 - Component library de Material Design
- **TypeScript** ~5.8.0 - Tipado estático
- **Pinia** ^3.0.1 - State management
- **Ethers.js** ^6.14.4 - Interacción con blockchain

### Herramientas de Desarrollo
- **Vite** ^6.2.4 - Build tool para frontend
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeChain** - Generación de tipos TypeScript para contratos

## Inicio Rápido

### Prerrequisitos
- **Node.js** >= 18
- **npm** >= 6
- **Truffle** (instalación global)
- **Ganache** (local blockchain)
- **MetaMask** (extensión de navegador)

### 1. Configuración de Smart Contracts
```bash
cd contracts
npm install
truffle migrate --network ganache
truffle exec scripts/save-contracts-config.js --network ganache
```

### 2. Configuración de la API
```bash
cd api
npm install
# Configurar src/config/config.json  (ver doc detallada de API)
npm run start:dev
```

### 3. Configuración de la UI
```bash
cd ui
npm install
# Crear archivo .env con VITE_API_BASE_URL (ver doc detallada de UI)
npm run dev
```

## 🔧 Configuración Detallada

### Smart Contracts
Los contratos se despliegan automáticamente y generan archivos de configuración que son utilizados por la API y UI. El sistema incluye:

- **CFPFactory** - Gestión central de llamados y usuarios
- **CFP** - Contratos individuales por convocatoria
- **ENS Registry** - Sistema de nombres completo
- **Registrars** - Para usuarios y llamados
- **Resolvers** - Resolución de direcciones y metadatos

### API REST
La API requiere configuración de:
- **Cuenta Ethereum** con fondos para transacciones
- **URL de red** (Ganache local por defecto)
- **Configuración de contratos** generada automáticamente

### Interfaz Web
La UI se conecta a:
- **API REST** para operaciones usando el owner de la factoria
- **Contratos inteligentes** para operaciones on-chain
- **MetaMask** para autenticación y transacciones

## Funcionalidades Principales

### Para Usuarios Registrados
- **Registro ENS** - Asociar nombre a dirección Ethereum
- **Crear llamados** - Publicar llamados con descripción
- **Enviar propuestas** - Participar en llamados activas
- **Verificar propuestas** - Confirmar registro de propuestas

### Para Administradores
- **Gestión de usuarios** - Autorizar nuevos creadores
- **Panel de control** - Vista general del sistema
- **Configuración ENS** - Administrar dominios y resolvers

### Para Participantes Anonimos
- **Explorar llamados** - Ver llamados activas
- **Detalles completos** - Información de cada llamado
- **Propuestas anónimas** - Participación sin identificación

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
truffle test
```

### API REST
```bash
cd api/test
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest test_apiserver.py -v
```

## 📁 Estructura del Proyecto

```
Final/
├── contracts/          # Smart contracts y configuración Truffle
│   ├── contracts/      # Contratos Solidity
│   ├── migrations/     # Scripts de despliegue
│   ├── test/          # Tests de contratos
│   └── scripts/       # Scripts auxiliares
├── api/               # API REST con NestJS
│   ├── src/           # Código fuente TypeScript
│   ├── test/          # Tests en Python
│   └── dist/          # Build compilado
└── ui/                # Interfaz web Vue 3
    ├── src/           # Código fuente Vue/TypeScript
    ├── public/        # Assets estáticos
    └── dist/          # Build de producción
```

## 🔗 Enlaces Útiles

- [Documentación de Smart Contracts](./contracts/README.md)
- [Documentación de la API](./api/README.md)
- [Documentación de la UI](./ui/README.md)
- [Especificaciones del Proyecto](./README-PRD.md)
