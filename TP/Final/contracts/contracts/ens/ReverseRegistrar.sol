// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ENS.sol";

interface IOwnable {
    function owner() external view returns (address);
}

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

    /**
     * @notice Asocia un nombre ENS reverso a un contrato, siempre que el caller sea su owner.
     * @dev Toma control del subnodo ENS para poder setear el resolver y el nombre.
     *      Verifica que el contrato implementa la interfaz IOwnable y que el msg.sender es el owner.
     *      El ReverseRegistrar mantiene la propiedad del subnodo ENS para facilitar gestión centralizada.
     * @param addr La dirección del contrato que tendrá el nombre ENS reverso.
     * @param name El nombre a asociar (por ejemplo, "miapp.llamados.cfp").
     * @return reverseNode El hash del nodo ENS reverso (`keccak256(abi.encodePacked(addr.reverse, sha3HexAddress(addr)))`).
     * @custom:reverts Si la dirección no es un contrato, si no implementa IOwnable, si el caller no es el owner,
     *                 o si no se puede tomar el control del nodo ENS.
     */
    function setNameFor(
        address addr,
        string calldata name
    ) external returns (bytes32 reverseNode) {
        require(addr.code.length > 0, "Addr debe ser contrato");

        // Verificamos que quien llama sea el owner del contrato
        try IOwnable(addr).owner() returns (address contractOwner) {
            require(
                contractOwner == msg.sender,
                "No sos el owner del contrato"
            );
        } catch {
            revert("El contrato no implementa IOwnable correctamente");
        }

        // Calculamos el nodo ENS reverso
        bytes32 label = sha3HexAddress(addr);
        reverseNode = keccak256(abi.encodePacked(ADDR_REVERSE_NODE, label));

        // Si este contrato no es el owner del nodo, tomamos el control
        if (ens.owner(reverseNode) != address(this)) {
            ens.setSubnodeOwner(ADDR_REVERSE_NODE, label, address(this));
            // Confirmamos que efectivamente somos ahora los dueños
            require(
                ens.owner(reverseNode) == address(this),
                "No se pudo tomar control del nodo ENS"
            );
        }
        // Seteamos el resolver por defecto
        ens.setResolver(reverseNode, address(defaultResolver));
        // Registramos el nombre
        defaultResolver.setName(reverseNode, name);
        return reverseNode;
    }

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
}
