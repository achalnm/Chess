document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessboard');
    const turnIndicator = document.getElementById('turn-indicator');
    const size = 8;
    const pieceEmojis = {
        'wK': '👑', 'bK': '♚',
        'wQ': '♕', 'bQ': '♛',
        'wR': '♖', 'bR': '♜',
        'wB': '♗', 'bB': '♝',
        'wN': '♘', 'bN': '♞',
        'wP': '♙', 'bP': '♟'
    };
    const boardState = Array(size).fill().map(() => Array(size).fill(null));
    let currentTurn = 'w'; // white starts
    let selectedSquare = null;

    function initBoard() {
        board.innerHTML = '';
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', onSquareClick);
                square.addEventListener('mouseover', onSquareHover);
                square.addEventListener('mouseout', onSquareHoverOut);
                board.appendChild(square);
            }
        }
        setInitialPositions();
        updateTurnIndicator();
    }

    function setInitialPositions() {
        const initialPositions = [
            ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
            ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
            ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR']
        ];
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const piece = initialPositions[row][col];
                if (piece) {
                    boardState[row][col] = piece;
                    updateSquare(row, col, piece);
                }
            }
        }
    }

    function updateSquare(row, col, piece) {
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        square.textContent = piece ? pieceEmojis[piece] : '';
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = currentTurn === 'w' ? "White's Turn" : "Black's Turn";
        turnIndicator.style.color = currentTurn === 'w' ? 'white' : 'black';
        turnIndicator.style.backgroundColor = currentTurn === 'w' ? 'black' : 'white';
    }

    function onSquareClick(event) {
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        if (selectedSquare) {
            const fromRow = selectedSquare.row;
            const fromCol = selectedSquare.col;
            if (isValidMove(fromRow, fromCol, row, col)) {
                boardState[row][col] = boardState[fromRow][fromCol];
                boardState[fromRow][fromCol] = null;
                updateSquare(fromRow, fromCol, null);
                updateSquare(row, col, boardState[row][col]);
                currentTurn = currentTurn === 'w' ? 'b' : 'w';
                selectedSquare = null;
                updateTurnIndicator();
                clearHighlights();
                checkGameOver();
            } else {
                clearHighlights();
                highlightInvalidMove(row, col);
            }
        } else {
            if (boardState[row][col] && boardState[row][col][0] === currentTurn) {
                selectedSquare = { row, col };
                highlightValidMoves(row, col);
            }
        }
    }

    function onSquareHover(event) {
        const square = event.currentTarget;
        if (!selectedSquare) {
            square.classList.add('hover');
        }
    }

    function onSquareHoverOut(event) {
        const square = event.currentTarget;
        square.classList.remove('hover');
    }

    function highlightValidMoves(row, col) {
        const piece = boardState[row][col];
        if (piece && piece[1] === 'P') {
            const moves = getPawnValidMoves(row, col);
            moves.forEach(move => {
                const square = document.querySelector(`.square[data-row="${move.row}"][data-col="${move.col}"]`);
                square.classList.add('valid-move');
            });
        }
    }

    function highlightInvalidMove(row, col) {
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('invalid-move');
        setTimeout(() => square.classList.remove('invalid-move'), 1000); // Remove highlight after 1 second
    }

    function clearHighlights() {
        document.querySelectorAll('.valid-move').forEach(square => square.classList.remove('valid-move'));
        document.querySelectorAll('.invalid-move').forEach(square => square.classList.remove('invalid-move'));
    }

    function isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = boardState[fromRow][fromCol];
        const targetPiece = boardState[toRow][toCol];
        const isCapture = targetPiece && targetPiece[0] !== currentTurn;

        // Basic movement rules for pawns
        if (piece && piece[1] === 'P') {
            const direction = piece[0] === 'w' ? 1 : -1;
            const startRow = piece[0] === 'w' ? 1 : 6;

            if (fromCol === toCol) {
                if (fromRow + direction === toRow && !targetPiece) {
                    return true;
                }
                if (fromRow === startRow && fromRow + 2 * direction === toRow && !targetPiece) {
                    return true;
                }
            }
            if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow && targetPiece) {
                return isCapture;
            }
            return false;
        }

        return false;
    }

    function getPawnValidMoves(row, col) {
        const piece = boardState[row][col];
        const moves = [];
        const direction = piece[0] === 'w' ? 1 : -1;
        const startRow = piece[0] === 'w' ? 1 : 6;
        const nextRow = row + direction;

        if (nextRow >= 0 && nextRow < size) {
            // Move forward by 1 square
            if (!boardState[nextRow][col]) {
                moves.push({ row: nextRow, col });
                // Move forward by 2 squares if on start row
                if (row === startRow && !boardState[nextRow][col]) {
                    moves.push({ row: nextRow + direction, col });
                }
            }
            // Captures
            if (col > 0 && boardState[nextRow][col - 1] && boardState[nextRow][col - 1][0] !== piece[0]) {
                moves.push({ row: nextRow, col: col - 1 });
            }
            if (col < size - 1 && boardState[nextRow][col + 1] && boardState[nextRow][col + 1][0] !== piece[0]) {
                moves.push({ row: nextRow, col: col + 1 });
            }
        }

        return moves;
    }

    function checkGameOver() {
        const kings = boardState.flat().filter(piece => piece && piece.includes('K'));
        if (kings.length < 2) {
            alert(`${currentTurn === 'w' ? 'Black' : 'White'} wins!`);
            initBoard(); // Reset board after game over
        }
    }

    function resetGame() {
        initBoard();
        currentTurn = 'w'; // Reset turn to white
        updateTurnIndicator();
    }

    initBoard();
    document.getElementById('reset').addEventListener('click', resetGame);
});
