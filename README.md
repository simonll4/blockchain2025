# Blockchain - Trabajos Prácticos 2025

## Estructura del Repositorio

### Trabajos Prácticos (TP/)

- **TP/1/** - Criptografía: Hash y Proof of Work
  - Búsqueda de colisiones en función hash SHA-256 truncada
  - Implementación de prueba de trabajo (mining) para blockchain
  - Interacción con servidor de desafíos criptográficos

- **TP/2/** - Criptografía y Generadores
  - Crack de DSA (Digital Signature Algorithm)
  - Crack de LCG (Linear Congruential Generator)

- **TP/3/** - Red de Prueba BFA (Blockchain Federal Argentina)
  - Despliegue y conexión a nodo de red privada
  - Consulta de balances y transferencias de fondos
  - Análisis y búsqueda de transacciones en bloques

- **TP/4/** - API REST para Blockchain
  - Desarrollo de API para consultas blockchain
  - Implementación de endpoints y testing

- **TP/5/** - Smart Contracts Solidity (Ballot)
  - Sistema de votación usando contratos inteligentes
  - Deployment y testing con Truffle

- **TP/6/** - Juego Tatetí (TicTacToe) con Smart Contracts
  - Implementación de juego de tres en línea en Solidity
  - Lógica de turnos y validación de movimientos
  - Sistema de eventos y control de estado del juego

- **TP/7/** - Call for Proposals (CFP) Factory
  - Factory pattern para crear contratos CFP
  - Sistema descentralizado de llamadas a proposals

- **TP/8/** - API REST para Contratos CFP
  - API Flask para interactuar con CFP y CFPFactory
  - Gestión de llamados, participantes y propuestas
  - Integración con Ganache y testing automatizado

- **TP/9/** - Frontend para CFP
  - Interfaz web para interactuar con contratos CFP
  - Integración con MetaMask 

- **TP/10/** - Sistema Completo CFP
  - Integración completa: contracts + API + UI

### Proyecto Final (Final/)

Aplicación completa de **Call for Proposals** que incluye:

- **contracts/** - Smart contracts con sistema ENS integrado
- **api/** - Backend NestJS con TypeScript
- **ui/** - Frontend Vue.js

## Instalación de dependencias

Para instalar las dependencias necesarias para los prácticos 1, 2 y 3, ejecute el siguiente comando en la raíz del repositorio:

```console
~$ pip install -r requirements.txt
```

Para otros prácticos, asegúrese de seguir las instrucciones específicas de manejo de dependencias incluidas en sus respectivas secciones.

## Navegación

Cada directorio contiene su propio README.md con instrucciones específicas de instalación, configuración y uso.
