// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ENS.sol";

abstract contract Resolver {
    function setName(bytes32 node, string memory name) public virtual;
}

interface INameResolver {
    function setName(bytes32 node, string calldata name) external;
}

contract ReverseRegistrar {
    // namehash('addr.reverse')
    bytes32 public constant ADDR_REVERSE_NODE =
        0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2;

    ENS public ens;
    Resolver public defaultResolver;

    /**
     * @dev Constructor
     * @param ensAddr The address of the ENS registry.
     * @param resolverAddr The address of the default reverse resolver.
     */
    constructor(ENS ensAddr, Resolver resolverAddr) {
        ens = ensAddr;
        defaultResolver = resolverAddr;

        // Assign ownership of the reverse record to our deployer
        ReverseRegistrar oldRegistrar = ReverseRegistrar(
            ens.owner(ADDR_REVERSE_NODE)
        );
        if (address(oldRegistrar) != address(0x0)) {
            oldRegistrar.claim(msg.sender);
        }
    }

    /**
     * @dev Transfers ownership of the reverse ENS record associated with the
     *      calling account.
     * @param owner The address to set as the owner of the reverse record in ENS.
     * @return The ENS node hash of the reverse record.
     */
    function claim(address owner) public returns (bytes32) {
        return claimWithResolver(owner, address(0x0));
    }

    /**
     * @dev Transfers ownership of the reverse ENS record associated with the
     *      calling account.
     * @param owner The address to set as the owner of the reverse record in ENS.
     * @param resolver The address of the resolver to set; 0 to leave unchanged.
     * @return The ENS node hash of the reverse record.
     */
    function claimWithResolver(
        address owner,
        address resolver
    ) public returns (bytes32) {
        bytes32 label = sha3HexAddress(msg.sender);
        bytes32 _node = keccak256(abi.encodePacked(ADDR_REVERSE_NODE, label));
        address currentOwner = ens.owner(_node);

        // Update the resolver if required
        if (resolver != address(0x0) && resolver != ens.resolver(_node)) {
            // Transfer the name to us first if it's not already
            if (currentOwner != address(this)) {
                ens.setSubnodeOwner(ADDR_REVERSE_NODE, label, address(this));
                currentOwner = address(this);
            }
            ens.setResolver(_node, resolver);
        }

        // Update the owner if required
        if (currentOwner != owner) {
            ens.setSubnodeOwner(ADDR_REVERSE_NODE, label, owner);
        }

        return _node;
    }

    /**
     * @dev Sets the `name()` record for the reverse ENS record associated with
     * the calling account. First updates the resolver to the default reverse
     * resolver if necessary.
     * @param name The name to set for this address.
     * @return The ENS node hash of the reverse record.
     */
    function setName(string memory name) public returns (bytes32) {
        bytes32 _node = claimWithResolver(
            address(this),
            address(defaultResolver)
        );
        defaultResolver.setName(_node, name);
        return _node;
    }

    function setNameFor(
        address addr,
        address owner,
        string calldata name
    ) external returns (bytes32 reverseNode) {
        bytes32 label = sha3HexAddress(addr);
        reverseNode = keccak256(abi.encodePacked(ADDR_REVERSE_NODE, label));
        _ensureOwnership(label);
        ens.setResolver(reverseNode, address(defaultResolver));
        defaultResolver.setName(reverseNode, name);
        if (owner != ens.owner(reverseNode)) {
            ens.setSubnodeOwner(ADDR_REVERSE_NODE, label, owner);
        }
    }

    // /**
    //  * @notice Crea y configura el PTR de una dirección arbitraria.
    //  * @param addr      Dirección que tendrá el registro inverso.
    //  * @param owner     Quien quedará como dueño del nodo PTR.
    //  * @param resolver  Resolver a usar (suele ser PublicResolver).
    //  * @param name      Nombre ENS completo, p. ej. "foo.llamados.cfp".
    //  */
    // function setNameForAddr(
    //     address addr,
    //     address owner,
    //     address resolver,
    //     string calldata name
    // ) external returns (bytes32 reverseNode) {
    //     bytes32 label = sha3HexAddress(addr);
    //     reverseNode = keccak256(abi.encodePacked(ADDR_REVERSE_NODE, label));

    //     // 1. Creamos/poseemos el nodo
    //     _ensureOwnership(label);

    //     // 2. Resolver
    //     if (resolver != address(0) && resolver != ens.resolver(reverseNode)) {
    //         ens.setResolver(reverseNode, resolver);
    //     }

    //     // 3. Escribimos el texto "name"
    //     INameResolver(resolver).setName(reverseNode, name);

    //     // 4. Transferimos la propiedad al owner final
    //     if (owner != ens.owner(reverseNode)) {
    //         ens.setSubnodeOwner(ADDR_REVERSE_NODE, label, owner);
    //     }
    // }

    /**
     * @dev Returns the node hash for a given account's reverse records.
     * @param addr The address to hash
     * @return The ENS node hash.
     */
    function node(address addr) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(ADDR_REVERSE_NODE, sha3HexAddress(addr))
            );
    }

    /**
     * @dev An optimised function to compute the sha3 of the lower-case
     *      hexadecimal representation of an Ethereum address.
     * @param addr The address to hash
     * @return ret The SHA3 hash of the lower-case hexadecimal encoding of the
     *         input address.
     */
    function sha3HexAddress(address addr) private pure returns (bytes32 ret) {
        addr;
        ret; // Stop warning us about unused variables
        assembly {
            let
                lookup
            := 0x3031323334353637383961626364656600000000000000000000000000000000

            for {
                let i := 40
            } gt(i, 0) {

            } {
                i := sub(i, 1)
                mstore8(i, byte(and(addr, 0xf), lookup))
                addr := div(addr, 0x10)
                i := sub(i, 1)
                mstore8(i, byte(and(addr, 0xf), lookup))
                addr := div(addr, 0x10)
            }

            ret := keccak256(0, 40)
        }
    }

    /// @dev Garantiza que este contrato sea dueño del subnodo <label>.addr.reverse
    function _ensureOwnership(bytes32 label) private {
        if (
            ens.owner(keccak256(abi.encodePacked(ADDR_REVERSE_NODE, label))) !=
            address(this)
        ) {
            ens.setSubnodeOwner(ADDR_REVERSE_NODE, label, address(this));
        }
    }
    // /**
    //  * @dev SHA3 de la representación hexadec. minúscula de una address
    //  *      (función optimizada en ensamblador, igual que la original).
    //  */
    // function _sha3HexAddress(address addr) private pure returns (bytes32 ret) {
    //     assembly {
    //         let
    //             lookup
    //         := 0x3031323334353637383961626364656600000000000000000000000000000000

    //         for {
    //             let i := 40
    //         } gt(i, 0) {

    //         } {
    //             i := sub(i, 1)
    //             mstore8(i, byte(and(addr, 0xf), lookup))
    //             addr := shr(4, addr)
    //             i := sub(i, 1)
    //             mstore8(i, byte(and(addr, 0xf), lookup))
    //             addr := shr(4, addr)
    //         }

    //         ret := keccak256(0, 40)
    //     }
    // }
}
