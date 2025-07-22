// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CFP {
    // Evento que se emite cuando alguien registra una propuesta
    event ProposalRegistered(
        bytes32 indexed proposal,
        address indexed sender,
        uint256 blockNumber
    );

    // Estructura que representa una propuesta
    struct ProposalData {
        address sender;
        uint256 blockNumber;
        uint256 timestamp;
    }

    // Identificador del llamado
    bytes32 private immutable _callId;

    // Timestamp del cierre del llamado
    uint256 private immutable _closingTime;

    // _owner: dirección lógica del dueño del contrato, utilizada para patron owneable
    // _creator: dirección que despliega el contrato (factory)
    address private immutable _owner;
    address private immutable _creator;

    // Mapeo de identificadores de propuestas a sus datos
    mapping(bytes32 => ProposalData) private _proposalData;

    // Lista de todas las propuestas registradas
    bytes32[] private _proposals;

    constructor(bytes32 callId_, uint256 closingTime_, address owner_) {
        require(owner_ != address(0), "owner invalido");
        require(
            closingTime_ > block.timestamp,
            "El cierre de la convocatoria no puede estar en el pasado"
        );
        _owner = owner_;
        _creator = msg.sender;
        _callId = callId_;
        _closingTime = closingTime_;
    }

    modifier onlyCreator() {
        require(
            msg.sender == _creator,
            "Solo el creador puede hacer esta llamada"
        );
        _;
    }

    modifier isValidProposal(bytes32 proposal) {
        require(block.timestamp <= _closingTime, "Convocatoria cerrada");
        require(
            _proposalData[proposal].sender == address(0),
            "La propuesta ya ha sido registrada"
        );
        _;
    }

    modifier isValidIndex(uint index, uint length) {
        require(index < length, "Indice fuera de rango");
        _;
    }

    // Devuelve los datos asociados con una propuesta
    function proposalData(
        bytes32 proposal
    ) public view returns (ProposalData memory) {
        return _proposalData[proposal];
    }

    // Devuelve la propuesta en la posición dada
    function proposals(
        uint256 index
    ) public view isValidIndex(index, _proposals.length) returns (bytes32) {
        return _proposals[index];
    }

    // Devuelve el timestamp de cierre del llamado
    function closingTime() public view returns (uint256) {
        return _closingTime;
    }

    // Devuelve el identificador del llamado
    function callId() public view returns (bytes32) {
        return _callId;
    }

    // Devuelve el creador del llamado
    function creator() public view returns (address) {
        return _creator;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    // Devuelve la cantidad total de propuestas registradas
    function proposalCount() public view returns (uint256) {
        return _proposals.length;
    }

    // Devuelve el timestamp en que se registró una propuesta
    function proposalTimestamp(bytes32 proposal) public view returns (uint256) {
        return _proposalData[proposal].timestamp;
    }

    // Registra una nueva propuesta enviada por el autor del mensaje
    function registerProposal(
        bytes32 proposal
    ) public isValidProposal(proposal) {
        _registerProposal(proposal, msg.sender);
    }

    // Registra una nueva propuesta para un emisor específico
    function registerProposalFor(
        bytes32 proposal,
        address sender
    ) public onlyCreator isValidProposal(proposal) {
        _registerProposal(proposal, sender);
    }

    // Función interna para registrar una propuesta
    function _registerProposal(bytes32 proposal, address sender) private {
        ProposalData memory data = ProposalData({
            sender: sender,
            blockNumber: block.number,
            timestamp: block.timestamp
        });
        _proposalData[proposal] = data;
        _proposals.push(proposal);
        emit ProposalRegistered(proposal, sender, block.number);
    }
}
