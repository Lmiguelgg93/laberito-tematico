$(document).ready(function () {
    let rows = 11; // Nivel de dificultad inicial (Fácil)
    let cols = 11;
    let playerPosition = { x: 1, y: 1 };
    let previousPosition = { x: 1, y: 1 }; // Guardar la posición anterior del jugador
    let timerInterval;
    let secondsElapsed = 0;

    // Función para generar una operación matemática básica
    function generateMathChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1; // Número aleatorio entre 1 y 10
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-', '*'];
        const randomOperation = operations[Math.floor(Math.random() * operations.length)];

        let correctAnswer;
        switch (randomOperation) {
            case '+':
                correctAnswer = num1 + num2;
                break;
            case '-':
                correctAnswer = num1 - num2;
                break;
            case '*':
                correctAnswer = num1 * num2;
                break;
        }

        const userAnswer = prompt(`Resuelve la operación: ${num1} ${randomOperation} ${num2} = ?`);

        return parseInt(userAnswer) === correctAnswer;
    }
    

    // Función para iniciar el temporizador
    function startTimer() {
        clearInterval(timerInterval); // Reiniciar cualquier temporizador anterior
        secondsElapsed = 0;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            const minutes = Math.floor(secondsElapsed / 60);
            const seconds = secondsElapsed % 60;
            $('#timer').text(`Tiempo: ${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }, 1000);
    }

    // Función para generar el laberinto
    function generateMaze() {
        $('#maze-container').empty();
        startTimer(); // Reiniciar el temporizador al generar un nuevo laberinto

        $('#maze-container').css({
            'grid-template-columns': `repeat(${cols}, 1fr)`,
            'grid-template-rows': `repeat(${rows}, 1fr)`
        });

        let maze = [];
        for (let i = 0; i < rows; i++) {
            maze[i] = [];
            for (let j = 0; j < cols; j++) {
                maze[i][j] = 'wall'; // Inicialmente, todas las celdas son paredes
            }
        }

        function createPath(x, y) {
            maze[x][y] = 'path';
            const directions = [
                [0, 1],  // derecha
                [1, 0],  // abajo
                [0, -1], // izquierda
                [-1, 0]  // arriba
            ];
            directions.sort(() => Math.random() - 0.5);

            for (let [dx, dy] of directions) {
                const newX = x + dx * 2;
                const newY = y + dy * 2;
                if (newX > 0 && newX < rows && newY > 0 && newY < cols) {
                    if (maze[newX][newY] === 'wall') {
                        maze[x + dx][y + dy] = 'path';
                        createPath(newX, newY);
                    }
                }
            }
        }

        createPath(1, 1);

        maze[1][1] = 'start';
        maze[rows - 2][cols - 2] = 'end';

        // Colocar algunas trampas aleatoriamente
        for (let i = 0; i < Math.floor((rows * cols) / 10); i++) {
            const trapX = Math.floor(Math.random() * rows);
            const trapY = Math.floor(Math.random() * cols);
            if (maze[trapX][trapY] === 'path') {
                maze[trapX][trapY] = 'trap';
            }
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let cell = $('<div>').addClass('cell');
                if (maze[i][j] === 'start') {
                    cell.addClass('start player active');
                    playerPosition = { x: j, y: i };
                } else if (maze[i][j] === 'end') {
                    cell.addClass('finish');
                } else if (maze[i][j] === 'wall') {
                    cell.addClass('wall');
                } else if (maze[i][j] === 'trap') {
                    cell.addClass('trap');
                } else {
                    cell.addClass('path');
                }
                $('#maze-container').append(cell);
            }
        }
    }

    // Función para mover al jugador
    function movePlayer(dx, dy) {
        previousPosition = { ...playerPosition }; // Guardar la posición anterior
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;
        const newCellIndex = newY * cols + newX;
        const newPosition = $('#maze-container .cell').eq(newCellIndex);

        if (newPosition && !newPosition.hasClass('wall')) {
            $('.active').removeClass('active player');
            newPosition.addClass('active player');
            playerPosition = { x: newX, y: newY };

            if (newPosition.hasClass('trap')) {
                const correct = generateMathChallenge();
                if (!correct) {
                    alert('Respuesta incorrecta. Volviendo a la posición anterior.');
                    movePlayerTo(previousPosition.x, previousPosition.y);
                }
            }

            if (newPosition.hasClass('finish')) {
                clearInterval(timerInterval);
                alert('¡Felicidades! Has llegado a la salida. Aumentando la dificultad...');
                if (rows < 31 && cols < 31) {
                    rows += 10;
                    cols += 10;
                }
                generateMaze();
            }
        }
    }

    function movePlayerTo(x, y) {
        $('.active').removeClass('active player');
        const newCellIndex = y * cols + x;
        $('#maze-container .cell').eq(newCellIndex).addClass('active player');
        playerPosition = { x: x, y: y };
    }

    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: movePlayer(-1, 0); break; // Izquierda
            case 38: movePlayer(0, -1); break; // Arriba
            case 39: movePlayer(1, 0); break;  // Derecha
            case 40: movePlayer(0, 1); break;  // Abajo
        }
        e.preventDefault();
    });

    generateMaze();
    $('#start-game').click(function () { generateMaze(); });
});
