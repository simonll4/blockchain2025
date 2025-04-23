//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

/// @title Game
contract Game {
    enum Status {
        Created,
        Running,
        Ended
    }

    // Los jugadores están declarados como `address payable`, porque se les debe poder
    // transferir el monto ganado.
    address payable[2] public players;

    // winner es 0 si todavía no hay ganador
    address payable public winner;

    // Representa lo ganado por cada jugador
    uint256[2] winnings;

    Status public status;

    uint256 internal next;

    uint256 public bet;

    event GameCreated(address creator, address game);
    event GameTerminated(address terminatedBy);
    event PlayerJoined(address player);
    event PlayerTurn(address nextPlayer);
    event Winner(address winner);
    event Draw(address creator, address challenger);
    event WinningsTransferred(address winner, uint256 amount);

    modifier onlyPlayers() {
        require(
            msg.sender == players[0] || msg.sender == players[1],
            "only players can invoke this function"
        );
        _;
    }

    modifier onlyCreator() {
        require(
            msg.sender == players[0],
            "only the game creator can invoke this function"
        );
        _;
    }

    modifier inTurn() {
        require(players[next] == msg.sender, "it is the other player's turn");
        _;
    }

    modifier onlyRunning() {
        require(status == Status.Running, "the game is not running");
        _;
    }

    modifier onlyEnded() {
        require(status == Status.Ended, "the game has not ended");
        _;
    }

    modifier onlyNotRunning() {
        require(status != Status.Running, "Cannot kill a running game");
        _;
    }

    modifier isBet() {
        require(msg.value > 0, "a bet is needed");
        _;
    }

    // Para crear un juego es necesario hacer una apuesta
    constructor() payable isBet {
        bet = msg.value;
        players[0] = payable(msg.sender);
        emit GameCreated(msg.sender, address(this));
    }

    // Elección del jugador inicial de manera seudoaleatoria (mala)
    function setInitialPlayer() internal {
        next = uint256(blockhash(block.number - 1)) % 2;
        emit PlayerTurn(players[next]);
    }

    // Cambia el turno al siguiente jugador
    function changeTurn() internal {
        next = (next + 1) % 2;
        emit PlayerTurn(players[next]);
    }

    // Función interna que devuelve el índice correspondiente a la dirección de un jugador.
    // Devuelve 2 si la dirección no corresponde a un jugador.
    function playerIndex(address player) internal view returns (uint256) {
        if (player == players[0]) {
            return 0;
        } else if (player == players[1]) {
            return 1;
        } else {
            return 2;
        }
    }

    // Función para unirse a un juego.
    // Requiere que se haga una apuesta igual a la que hizo el creador del juego.
    // Requiere que todavía no se haya unido nadie.
    function join() public payable virtual isBet {
        require(msg.value == bet, "invalid bet value");
        require(players[1] == address(0), "there already are two players");
        players[1] = payable(msg.sender);
        status = Status.Running;
        emit PlayerJoined(msg.sender);
    }

    // Función interna que transfiere las ganancias a un jugador.
    // Requiere que la dirección corresponda a un jugador.
    // Requiere que el jugador tenga ganancias.
    // Requiere que haya suficientes fondos en el juego.
    function transferWinnings(address payable player) internal {
        uint256 index = playerIndex(player);
        uint256 winnings_ = winnings[index];
        require(winnings_ > 0, "there are no winnings to claim");
        uint256 balance = address(this).balance;
        assert(balance == winnings[0] + winnings[1]);
        winnings[index] = 0;
        player.transfer(winnings_);
        emit WinningsTransferred(player, winnings_);
    }

    // Permite reclamar las ganancias
    // Requiere que el juego haya terminado
    // Sólo puede ser ejecutada por jugadores
    // Requiere que el que la invoca tenga ganancias
    function claimWinnings() public onlyEnded onlyPlayers {
        transferWinnings(payable(msg.sender));
    }

    // Devuelve la dirección del próximo jugador.
    function nextPlayer()
        public
        view
        onlyRunning
        returns (address nextPlayer_)
    {
        nextPlayer_ = players[next];
    }

    // Indica si el emisor puede jugar
    function canPlay() public view onlyRunning returns (bool) {
        return msg.sender == players[next];
    }

    // Termina el contrato
    // Requiere que el juego no esté en curso
    // Requiere que no haya ganancias sin reclamar
    function kill() external onlyCreator onlyNotRunning {
        // Verifica que no haya ganancias sin reclamar
        require(
            winnings[0] == 0 && winnings[1] == 0,
            "Unclaimed winnings exist"
        );

        status = Status.Ended;
        emit GameTerminated(msg.sender);
        selfdestruct(payable(msg.sender));
    }
}
