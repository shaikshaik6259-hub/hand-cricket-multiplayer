const socket = io();


const roomId =
    localStorage.getItem("roomId");


const playerIndex =
    Number(
        localStorage.getItem("playerIndex")
    );


let myScore = 0;

let opponentScore = 0;

let gameFinished = false;


// Display room
document.getElementById(
    "roomDisplay"
).innerText = roomId;


// Make choice
function makeChoice(number) {

    if (gameFinished) {
        return;
    }


    document.getElementById(
        "myChoice"
    ).innerText =
        "Your choice: " + number;


    socket.emit(
        "playerChoice",
        number
    );


    document.getElementById(
        "status"
    ).innerText =
        "Waiting for opponent...";
}


// Ball result
socket.on(
    "ballResult",
    (data) => {

        const myChoice =
            playerIndex === 0
                ? data.player1Choice
                : data.player2Choice;


        const opponentChoice =
            playerIndex === 0
                ? data.player2Choice
                : data.player1Choice;


        document.getElementById(
            "myChoice"
        ).innerText =
            "Your choice: " + myChoice;


        document.getElementById(
            "opponentChoice"
        ).innerText =
            "Opponent choice: " +
            opponentChoice;


        myScore =
            data.scores[playerIndex];


        opponentScore =
            data.scores[
                playerIndex === 0 ? 1 : 0
            ];


        document.getElementById(
            "myScore"
        ).innerText = myScore;


        document.getElementById(
            "opponentScore"
        ).innerText =
            opponentScore;


        if (data.out) {

            document.getElementById(
                "resultMessage"
            ).innerText =
                "🏏 OUT!";

        } else {

            const runs =
                playerIndex ===
                getBattingPlayer()
                    ? myChoice
                    : opponentChoice;


            document.getElementById(
                "resultMessage"
            ).innerText =
                "+" + runs + " RUNS!";
        }

    }
);


// Current batting player
let battingPlayer = 0;


function getBattingPlayer() {

    return battingPlayer;

}


// Innings changed
socket.on(
    "inningsChanged",
    (data) => {

        battingPlayer =
            data.battingPlayer;


        document.getElementById(
            "target"
        ).innerText =
            "🎯 Target: " + data.target;


        if (
            battingPlayer ===
            playerIndex
        ) {

            document.getElementById(
                "status"
            ).innerText =
                "🏏 Your Batting!";

        } else {

            document.getElementById(
                "status"
            ).innerText =
                "🎯 Your Bowling!";

        }

    }
);


// Game over
socket.on(
    "gameOver",
    (data) => {

        gameFinished = true;


        myScore =
            data.scores[playerIndex];


        opponentScore =
            data.scores[
                playerIndex === 0 ? 1 : 0
            ];


        document.getElementById(
            "myScore"
        ).innerText = myScore;


        document.getElementById(
            "opponentScore"
        ).innerText =
            opponentScore;


        if (
            data.winner ===
            playerIndex
        ) {

            document.getElementById(
                "resultMessage"
            ).innerText =
                "🎉 YOU WIN!";

        } else if (
            data.winner === -1
        ) {

            document.getElementById(
                "resultMessage"
            ).innerText =
                "🤝 DRAW!";

        } else {

            document.getElementById(
                "resultMessage"
            ).innerText =
                "😢 YOU LOST!";

        }


        document.getElementById(
            "status"
        ).innerText =
            "🏆 GAME OVER";

    }
);


// Opponent disconnected
socket.on(
    "opponentDisconnected",
    () => {

        gameFinished = true;


        document.getElementById(
            "status"
        ).innerText =
            "⚠️ Opponent disconnected.";

    }
);
