# Proyecto Truffle – Documentación

## Propósito del Proyecto

Este proyecto truffle implementa un sistema de **Llamados a Presentación de Propuestas (CFP)** basado en blockchain, que permite:

### Funcionalidades Principales

- **Gestión de Llamados**: Crear y administrar llamados para presentación de propuestas con fechas de cierre específicas
- **Registro de Propuestas**: Permitir a usuarios registrados enviar propuestas a los llamados activos
- **Sistema de Autorización**: Control de acceso con estados de cuenta (No registrado, Pendiente, Autorizado)
- **Nomenclatura ENS**: Integración con Ethereum Name Service para identificación de usuarios y llamados
- **Factoría de Contratos**: Creación dinámica de contratos CFP individuales para cada convocatoria

### Componentes Clave

- **CFPFactory**: Contrato principal que gestiona la creación de llamados y autorización de usuarios
- **CFP**: Contratos individuales para cada convocatoria que manejan las propuestas
- **ENS**: Sistema de nombres para identificación de participantes y llamados

---

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- **Node.js** (recomendado v18 o superior)
- **npm** (v6 o superior)
- **Truffle**  
  Instala Truffle globalmente si no lo tienes:
  ```bash
  npm install -g truffle
  ```
- **Ganache**  
  Puedes usar Ganache CLI o la versión de escritorio:
  ```bash
  npm install -g ganache-cli
  ```
  o descarga desde [Ganache UI](https://trufflesuite.com/ganache/).

---

## Instalación del Proyecto

1. **Instala las dependencias:**
   ```bash
   npm install
   ```

---

## Configuración

- Por defecto, el proyecto está configurado para usar la red local de Ganache.
- Si necesitas modificar la configuración de red, edita el archivo `truffle-config.js`.

---

## Despliegue de Contratos y Configuración

Para desplegar los contratos en la red local de Ganache y generar la configuración necesaria para la API y la UI, ejecuta el siguiente comando desde la raíz del proyecto:

```bash
truffle migrate --network ganache && truffle exec scripts/save-contracts-config.js --network ganache
```

### ¿Qué hace este comando?

1. **`truffle migrate --network ganache`**  
   Despliega todos los contratos inteligentes definidos en la carpeta `contracts/` sobre la red local de Ganache.

2. **`truffle exec scripts/save-contracts-config.js --network ganache`**  
   Ejecuta un script que genera archivos de configuración con informacion de los contratos desplegados.  
   Estos archivos son utilizados por la API y la UI para interactuar correctamente con los contratos.

---

## Ejecución de Pruebas

Para correr los tests de los contratos:
```bash
truffle test
```

---

## Estructura del Proyecto

- `contracts/` — Contratos inteligentes Solidity.
- `migrations/` — Scripts de migración de Truffle.
- `scripts/` — Scripts auxiliares.
- `test/` — Pruebas automatizadas de los contratos.
- `truffle-config.js` — Configuración de redes y compilador.

---

