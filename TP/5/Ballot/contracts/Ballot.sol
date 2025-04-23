// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

/// @title Votación segura, optimizada y completa
contract Ballot {
    // Esta estructura representa a un votante
    struct Voter {
        bool canVote; // si es verdadero, la persona puede votar
        bool voted; // si es verdadero, la persona ya votó
        uint vote; // índice de la propuesta elegida.
    }

    // Este estructura representa a una propuesta
    struct Proposal {
        bytes32 name; // nombre (hasta 32 bytes)
        uint voteCount; // votos recibidos por la propuesta
    }

    // Dirección del presidente de la votación
    address public immutable chairperson;

    // Cantidad de votantes
    uint public numVoters;

    // Arreglo dinámico de propuestas.
    Proposal[] public proposals;

    // Variable de estado con los votantes
    mapping(address => Voter) public voters;

    // Estados de la votación
    enum VotingState {
        NotStarted,
        Ongoing,
        Ended
    }

    // Estado de la votación
    VotingState public state;

    // Modificador para verificar que el llamador es el presidente
    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can do this");
        _;
    }

    // Modificador para verificar el estado de la votación
    modifier inState(VotingState expected) {
        require(state == expected, "Invalid voting state for this action");
        _;
    }

    /// Crea una nueva votación para elegir entre `proposalNames`.
    constructor(bytes32[] memory proposalNames) {
        require(
            proposalNames.length > 1,
            "There should be at least 2 proposals"
        );
        for (uint i = 0; i < proposalNames.length; ++i) {
            // `Proposal({...})` crea un objeto temporal
            // de tipo Proposal y  `proposals.push(...)`
            // lo agrega al final de `proposals`.
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        // Inicializa el presidente de la votación
        chairperson = msg.sender;
        // Inicializa el estado de la votación
        state = VotingState.NotStarted;
    }

    // Le da a `voter` el derecho a votar.
    // Solamente puede ser ejecutado por `chairperson`.
    // No se puede hacer si
    //  * El votante ya puede votar
    //  * La votación ya comenzó
    // Actualiza numVoters
    function giveRightToVote(
        address voter
    ) external onlyChairperson inState(VotingState.NotStarted) {
        Voter storage v = voters[voter];
        require(!v.voted, "The voter already voted.");
        require(!v.canVote, "The voter already voted.");
        v.canVote = true;
        ++numVoters;
    }

    // Quita a `voter` el derecho a votar.
    // Solamente puede ser ejecutado por `chairperson`.
    // No se puede hacer si
    //  * El votante no puede votar
    //  * La votación ya comenzó
    // Actualiza numVoters
    function withdrawRightToVote(
        address voter
    ) external onlyChairperson inState(VotingState.NotStarted) {
        Voter storage v = voters[voter];
        require(v.canVote, "The voter can't vote");
        require(!v.voted, "The voter already voted");
        v.canVote = false;
        --numVoters;
    }

    // Le da a todas las direcciones contenidas en `list` el derecho a votar.
    // Solamente puede ser ejecutado por `chairperson`.
    // No se puede ejecutar si la votación ya comenzó
    // Si el votante ya puede votar, no hace nada.
    // Actualiza numVoters
    function giveAllRightToVote(
        address[] calldata list
    ) external onlyChairperson inState(VotingState.NotStarted) {
        for (uint i = 0; i < list.length; ++i) {
            Voter storage v = voters[list[i]];
            if (!v.canVote) {
                v.canVote = true;
                ++numVoters;
            }
        }
    }

    // Devuelve la cantidad de propuestas
    function numProposals() external view returns (uint) {
        return proposals.length;
    }

    // Habilita el comienzo de la votación
    // Solo puede ser invocada por `chairperson`
    // No puede ser invocada una vez que la votación ha comenzado
    function start() external onlyChairperson inState(VotingState.NotStarted) {
        state = VotingState.Ongoing;
    }

    // Indica si la votación ha comenzado
    // observacion: cuando termina la votación este metodo devulve que nunca empezo la votacion
    function started() external view returns (bool) {
        return state == VotingState.Ongoing;
    }

    // Finaliza la votación
    // Solo puede ser invocada por `chairperson`
    // Solo puede ser invocada una vez que la votación ha comenzado
    // No puede ser invocada una vez que la votación ha finalizado
    function end() external onlyChairperson inState(VotingState.Ongoing) {
        state = VotingState.Ended;
    }

    // Indica si la votación ha finalizado
    function ended() external view returns (bool) {
        return state == VotingState.Ended;
    }

    // Vota por la propuesta `proposals[proposal].name`.
    // Requiere que la votación haya comenzado y no haya terminado
    // Si `proposal` está fuera de rango, lanza
    // una excepción y revierte los cambios.
    // El votante tiene que estar habilitado
    // No se puede votar dos veces
    // No se puede votar si la votación aún no comenzó
    // No se puede votar si la votación ya terminó
    function vote(uint proposal) external inState(VotingState.Ongoing) {
        require(proposal < proposals.length, "Invalid proposal");
        Voter storage sender = voters[msg.sender];
        require(sender.canVote, "The voter no right to vote");
        require(!sender.voted, "the voter already voted");
        sender.voted = true;
        sender.vote = proposal;
        ++proposals[proposal].voteCount;
    }

    /// Calcula la propuestas ganadoras
    /// Devuelve un array con los índices de las propuestas ganadoras.
    // Solo se puede ejecutar si la votación terminó.
    // Si no hay votos, devuelve un array de longitud 0
    // Si hay un empate en el primer puesto, la longitud
    // del array es la cantidad de propuestas que empatan
    function winningProposals()
        public
        view
        inState(VotingState.Ended)
        returns (uint[] memory winningProposal_)
    {
        uint maxVotes = 0;
        uint[] memory tmp = new uint[](proposals.length);
        uint count = 0;

        for (uint i = 0; i < proposals.length; ++i) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                count = 1;
                tmp[0] = i;
            } else if (proposals[i].voteCount == maxVotes && maxVotes > 0) {
                tmp[count] = i;
                ++count;
            }
        }
        // Ajusta el tamaño del array de propuestas ganadoras
        // si no hay votos, el array queda vacío
        winningProposal_ = new uint[](count);
        for (uint i = 0; i < count; ++i) {
            winningProposal_[i] = tmp[i];
        }
    }

    // Devuelve un array con los nombres de las
    // propuestas ganadoras.
    // Solo se puede ejecutar si la votación terminó.
    // Si no hay votos, devuelve un array de longitud 0
    // Si hay un empate en el primer puesto, la longitud
    // del array es la cantidad de propuestas que empatan
    function winners()
        external
        view
        inState(VotingState.Ended)
        returns (bytes32[] memory winners_)
    {
        uint[] memory indices = winningProposals();
        winners_ = new bytes32[](indices.length);
        for (uint i = 0; i < indices.length; ++i) {
            winners_[i] = proposals[indices[i]].name;
        }
    }
}
