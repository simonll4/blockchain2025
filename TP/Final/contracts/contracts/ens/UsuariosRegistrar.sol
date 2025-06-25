// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FIFSRegistrar.sol";

/**
 * @title UsuariosRegistrar
 * @dev Registrador específico para el dominio usuarios.cfp
 */
contract UsuariosRegistrar is FIFSRegistrar {
    constructor(ENS _ens, bytes32 _node) FIFSRegistrar(_ens, _node) {}
} 