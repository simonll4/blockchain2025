// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FIFSRegistrar.sol";

/**
 * @title LlamadosRegistrar
 * @dev Registrador específico para el dominio llamados.cfp
 */
contract LlamadosRegistrar is FIFSRegistrar {
    constructor(ENS _ens, bytes32 _node) FIFSRegistrar(_ens, _node) {}
} 