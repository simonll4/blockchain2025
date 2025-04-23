// SPDX-License-Identifier: MIT

// Permite realizar una jugada, indicando fila y columna
// Las filas y columnas comienzan en 0
// Sólo puede invocarse si el juego ya comenzó
// Sólo puede invocarla el jugador que tiene el turno
// Si la jugada es inválida, se rechaza con error "invalid move"
// Debe emitir el evento Play(player, row, col) con cada jugada
// Si un jugador gana al jugar, emite el evento Winner(winner)
// Si no se puede jugar más es un empate y emite el evento
// Draw(creator, challenger)

pragma solidity ^0.8.3;

import "./Game.sol";

contract TicTacToe is Game {
    uint8 constant SIZE = 3;

    // tablero de 3x3, donde cada celda es 0 (vacia) , 1 (creador) o 2 (retador)
    uint8[SIZE][SIZE] public board;

    // El número de jugadas realizadas
    uint256 public moves;

    // Evento que se emite al realizar una jugada
    event Play(address player, uint256 row, uint256 col);

    // verifica si las coordendas están dentro del tablero
    modifier validRange(uint row, uint col) {
        require(row < SIZE && col < SIZE, "invalid move");
        _;
    }

    // verifica si la celda está vacía
    modifier isEmpty(uint row, uint col) {
        require(board[row][col] == 0, "invalid move");
        _;
    }

    constructor() payable {}

    function join() public payable override {
        super.join();
        setInitialPlayer();
    }

    function play(
        uint256 row,
        uint256 col
    ) public onlyRunning inTurn validRange(row, col) isEmpty(row, col) {
        uint256 index = playerIndex(msg.sender);
        board[row][col] = uint8(index + 1);
        moves++;

        emit Play(msg.sender, row, col);

        if (_isWinningMove(row, col, uint8(index + 1))) {
            // Si el jugador actual gana, se termina el juego
            status = Status.Ended;
            winner = payable(msg.sender); // registrar el ganador
            winnings[index] = address(this).balance; // el ganador recibe todo el balance
            emit Winner(msg.sender);
            // Transferir ganancias inmediatamente al jugador  ganador
            transferWinnings(payable(msg.sender));
        } else if (moves == 9) {
            // Si se han realizado 9 jugadas y no hay ganador, es un empate
            status = Status.Ended;
            // Dividir el balance y preparar para transferir
            uint256 total = address(this).balance;
            uint256 half = total / 2;
            winnings[0] = half; // creador recibe la parte truncada en caso de que sea impar
            winnings[1] = total - half; // retador recibe wei residual en caso de que sea impar
            emit Draw(players[0], players[1]);
            // Transferir al jugador actual inmediatamente
            transferWinnings(payable(msg.sender));
        } else {
            // Si no hay ganador y no es un empate, se cambia el turno
            changeTurn();
        }
    }

    function _isWinningMove(
        uint256 row,
        uint256 col,
        uint8 playerSymbol // cambiar el nombre a "symbol" para mayor claridad
    ) internal view returns (bool) {
        // Check row
        bool win = true;
        for (uint256 i = 0; i < SIZE; i++) {
            if (board[row][i] != playerSymbol) {
                win = false;
                break;
            }
        }
        if (win) return true;

        // Check column
        win = true;
        for (uint256 i = 0; i < SIZE; i++) {
            if (board[i][col] != playerSymbol) {
                win = false;
                break;
            }
        }
        if (win) return true;

        // Check main diagonal
        if (row == col) {
            win = true;
            for (uint256 i = 0; i < SIZE; i++) {
                if (board[i][i] != playerSymbol) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }

        // Check anti-diagonal
        if (row + col == SIZE - 1) {
            win = true;
            for (uint256 i = 0; i < SIZE; i++) {
                if (board[i][SIZE - 1 - i] != playerSymbol) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
        return false;
    }
}
