// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CFP.sol";

contract CFPFactory {
    // Evento que se emite cuando se crea un llamado a presentación de propuestas
    event CFPCreated(address indexed creator, bytes32 indexed callId, CFP cfp);

    // Estructura que representa un llamado
    struct CallForProposals {
        address creator; // Dirección del creador del llamado
        CFP cfp; // Contrato CFP que gestiona las propuestas de ese llamado
    }

    // Estructura para estado de cuentas
    // observacion: enum con los 3 estados, y no pensar como combinacion de valores
    // no todas las combinaciones son validas (si esta autorizado se supone que esta registrado)
    // se complica la logica de los combinaciones
    enum AccountState {
        NotRegistered,
        Pending,
        Authorized
    }

    // para no tener multiples mappins se puede crear una extructura creator con todo los datos

    address private immutable _owner; // Dirección del dueño de la factoría (quien desplegó el contrato)

    mapping(bytes32 => CallForProposals) private _calls; // Mapeo de identificadores de llamados

    bytes32[] private _callIds; // Lista de todos los callIds creados

    mapping(address => AccountState) private _accountState; // Estado de las cuentas

    address[] private _pending; // Cuentas pendientes de autorización

    address[] private _creators; // Lista de direcciones que han creado llamados

    mapping(address => bytes32[]) private _callsCreatedBy; // Llamados creados por cada dirección

    // Modificador que permite solo al dueño ejecutar ciertas funciones
    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "Solo el creador puede hacer esta llamada"
        );
        _;
    }

    // Modificador que permite solo a cuentas autorizadas ejecutar ciertas funciones
    modifier onlyAuthorized(address account) {
        require(
            _accountState[account] == AccountState.Authorized,
            "No autorizado"
        );
        _;
    }

    // Modificador que verifica que el llamado no exista
    modifier isNewCallId(bytes32 callId) {
        require(_calls[callId].creator == address(0), "El llamado ya existe");
        _;
    }

    // Modificador que verifica que el llamado existe
    modifier isCallIdExists(bytes32 callId) {
        require(_calls[callId].creator != address(0), "El llamado no existe");
        _;
    }

    // Modificador que verifica que la cuenta no esté registrada
    modifier notRegistered(address account) {
        require(
            _accountState[account] == AccountState.NotRegistered,
            "Ya se ha registrado"
        );
        _;
    }

    // Modificador que verifica que el índice esté dentro de los límites
    modifier isValidIndex(uint index, uint length) {
        require(index < length, "Indice fuera de rango");
        _;
    }

    /** Constructor del contrato.
     *  Establece la dirección que despliega el contrato como dueña de la factoría.
     */
    constructor() {
        _owner = msg.sender;
    }

    // Devuelve la dirección del dueño de la factoría
    function owner() public view returns (address) {
        return _owner;
    }

    // Devuelve el llamado asociado con un callId
    function calls(
        bytes32 callId
    ) public view returns (CallForProposals memory) {
        return _calls[callId];
    }

    // Devuelve una lista de todos los callIds creados
    function allCallIds() external view returns (bytes32[] memory) {
        return _callIds;
    }

    // Devuelve la cantidad de cuentas que han creado llamados.
    function creatorsCount() public view returns (uint256) {
        return _creators.length;
    }

    // Devuelve la dirección de un creador `de la lista de creadores
    function creators(
        uint index
    ) public view isValidIndex(index, _creators.length) returns (address) {
        return _creators[index];
    }

    /// Devuelve el identificador del llamado que está en la posición `index` de la lista de llamados creados por `creator`
    function createdBy(
        address creator,
        uint256 index
    )
        public
        view
        isValidIndex(index, _callsCreatedBy[creator].length)
        returns (bytes32)
    {
        return _callsCreatedBy[creator][index];
    }

    // Devuelve la cantidad de llamados creados por `creator`
    function createdByCount(address creator) public view returns (uint256) {
        return _callsCreatedBy[creator].length;
    }

    // Devuelve la cantidad de registraciones pendientes.
    // Sólo puede ser ejecutada por el dueño de la factoría
    // En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
    function pendingCount() public view onlyOwner returns (uint256) {
        return _pending.length;
    }

    // Devuelve la registración pendiente con índice `index`
    // Sólo puede ser ejecutada por el dueño de la factoría
    function getPending(
        uint256 index
    )
        public
        view
        onlyOwner
        isValidIndex(index, _pending.length)
        returns (address)
    {
        return _pending[index];
    }

    // Devuelve la lista de todas las registraciones pendientes.
    // Sólo puede ser ejecutada por el dueño de la factorífa
    function getAllPending() public view onlyOwner returns (address[] memory) {
        return _pending;
    }

    // Devuelve verdadero si una cuenta se ha registrado, tanto si su estado es pendiente como si ya se la ha autorizado.
    function isRegistered(address account) public view returns (bool) {
        AccountState state = _accountState[account];
        return
            state == AccountState.Pending || state == AccountState.Authorized;
    }

    // Devuelve verdadero si una cuenta está autorizada a crear llamados.
    function isAuthorized(address account) public view returns (bool) {
        return _accountState[account] == AccountState.Authorized;
    }

    /** Crea un llamado, con un identificador y un tiempo de cierre.
     *  Si ya existe un llamado con ese identificador, revierte con el mensaje de error "El llamado ya existe"
     *  Si el emisor no está autorizado a crear llamados, revierte con el mensaje "No autorizado"
     */
    function create(
        bytes32 callId,
        uint256 timestamp
    ) public onlyAuthorized(msg.sender) returns (CFP) {
        return _createCFP(callId, timestamp, msg.sender);
    }

    /**
     * Crea un llamado, estableciendo a `creator` como creador del mismo.
     * Sólo puede ser invocada por el dueño de la factoría.
     * Si el emisor no está autorizado a crear llamados, revierte con el mensaje "No autorizado"
     */
    function createFor(
        bytes32 callId,
        uint256 timestamp,
        address creator
    ) public onlyOwner onlyAuthorized(creator) returns (CFP) {
        return _createCFP(callId, timestamp, creator);
    }

    /** Función interna que ejecuta la lógica de creación de un llamado
     *  Crea un nuevo contrato CFP con la información dada.
     *  Registra al creador y su llamado.
     *  Emite el evento CFPCreated.
     */
    function _createCFP(
        bytes32 callId_,
        uint256 closingTime_,
        address creator_
    ) private isNewCallId(callId_) returns (CFP) {
        CFP cfp = new CFP(callId_, closingTime_);
        _calls[callId_] = CallForProposals(creator_, cfp);
        _callIds.push(callId_);

        if (_callsCreatedBy[creator_].length == 0) {
            _creators.push(creator_);
        }
        _callsCreatedBy[creator_].push(callId_);

        emit CFPCreated(creator_, callId_, cfp);
        return cfp;
    }

    /** Permite a un usuario registrar una propuesta, para un llamado con identificador `callId`.
     *  Si el llamado no existe, revierte con el mensaje "El llamado no existe".
     *  Registra la propuesta en el llamado asociado con `callId` y pasa como creador la dirección del emisor del mensaje.
     */
    function registerProposal(
        bytes32 callId,
        bytes32 proposal
    ) public isCallIdExists(callId) {
        _calls[callId].cfp.registerProposalFor(proposal, msg.sender);
    }

    /** Permite que una cuenta se registre para poder crear llamados.
     *  El registro queda en estado pendiente hasta que el dueño de la factoría lo autorice.
     *  Si ya se ha registrado, revierte con el mensaje "Ya se ha registrado"
     */
    function register() public notRegistered(msg.sender) {
        _accountState[msg.sender] = AccountState.Pending;
        _pending.push(msg.sender);
    }

    /** Autoriza a una cuenta a crear llamados.
     *  Sólo puede ser ejecutada por el dueño de la factoría.
     *  En caso contrario revierte con el mensaje "Solo el creador puede hacer esta llamada".
     *  Si la cuenta se ha registrado y está pendiente, la quita de la lista de pendientes,
     *  si no la registra automáticamente.
     */
    function authorize(address creator) public onlyOwner {
        AccountState state = _accountState[creator];
        if (state == AccountState.NotRegistered) {
            // Registro directo y autorización
            _accountState[creator] = AccountState.Authorized;
        } else if (state == AccountState.Pending) {
            _removePending(creator);
            _accountState[creator] = AccountState.Authorized;
        }
    }

    /**
     * Quita la autorización de una cuenta para crear llamados.
     * Sólo puede ser ejecutada por el dueño de la factoría.
     * Si la cuenta está registrada y pendiente, la quita de pendientes.
     * Siempre marca la cuenta como no autorizada y no registrada.
     */
    function unauthorize(address creator) public onlyOwner {
        if (_accountState[creator] == AccountState.Pending) {
            _removePending(creator);
        }
        _accountState[creator] = AccountState.NotRegistered;
    }

    /**
     * Función interna que elimina una cuenta de pendientes.
     */
    function _removePending(address account) private {
        uint256 length = _pending.length;
        for (uint256 i = 0; i < length; i++) {
            if (_pending[i] == account) {
                if (i < length - 1) {
                    _pending[i] = _pending[length - 1];
                }
                _pending.pop();
                break;
            }
        }
    }
}
