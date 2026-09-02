const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;


// Serve files from public folder
app.use(express.static("public"));


// Store rooms
const rooms = {};


// Generate room ID
function generateRoomId() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}


// Player connects
io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);


    // Create room
    socket.on("createRoom", (playerName) => {

        const roomId = generateRoomId();

        rooms[roomId] = {

            players: [
                {
                    id: socket.id,
                    name: playerName
                }
            ],

            choices: {},

            scores: [0, 0],

            innings: 1,

            battingPlayer: 0,

            target: 0,

            gameStarted: false

        };


        socket.join(roomId);

        socket.roomId = roomId;

        socket.playerIndex = 0;


        socket.emit("roomCreated", {
            roomId: roomId,
            playerIndex: 0
        });


        console.log(
            `${playerName} created room ${roomId}`
        );

    });


    // Join room
    socket.on("joinRoom", ({ roomId, playerName }) => {

        roomId = roomId.toUpperCase();

        const room = rooms[roomId];


        if (!room) {

            socket.emit(
                "errorMessage",
                "Room does not exist!"
            );

            return;
        }


        if (room.players.length >= 2) {

            socket.emit(
                "errorMessage",
                "Room is already full!"
            );

            return;
        }


        room.players.push({
            id: socket.id,
            name: playerName
        });


        socket.join(roomId);

        socket.roomId = roomId;

        socket.playerIndex = 1;


        socket.emit("roomJoined", {
            roomId: roomId,
            playerIndex: 1
        });


        io.to(roomId).emit(
            "playersReady",
            {
                players: room.players
            }
        );


        console.log(
            `${playerName} joined room ${roomId}`
        );

    });


    // Player chooses number
    socket.on("playerChoice", (choice) => {

        const roomId = socket.roomId;

        const room = rooms[roomId];


        if (!room) {
            return;
        }


        const playerIndex = socket.playerIndex;


        room.choices[playerIndex] = Number(choice);


        console.log(
            `Player ${playerIndex} chose ${choice}`
        );


        // Send waiting message
        socket.emit(
            "waitingForPlayer",
            "Waiting for opponent..."
        );


        // Both players have selected
        if (
            room.choices[0] !== undefined &&
            room.choices[1] !== undefined
        ) {

            processBall(roomId);

        }

    });


    // Disconnect
    socket.on("disconnect", () => {

        console.log(
            "Player disconnected:",
            socket.id
        );


        const roomId = socket.roomId;

        if (!roomId) {
            return;
        }


        const room = rooms[roomId];

        if (!room) {
            return;
        }


        io.to(roomId).emit(
            "opponentDisconnected"
        );


        delete rooms[roomId];

    });

});


// Process one ball
function processBall(roomId) {

    const room = rooms[roomId];


    const player1Choice =
        room.choices[0];

    const player2Choice =
        room.choices[1];


    const battingPlayer =
        room.battingPlayer;


    const battingChoice =
        battingPlayer === 0
            ? player1Choice
            : player2Choice;


    const bowlingChoice =
        battingPlayer === 0
            ? player2Choice
            : player1Choice;


    // Check OUT
    if (battingChoice === bowlingChoice) {

        io.to(roomId).emit(
            "ballResult",
            {
                player1Choice,
                player2Choice,
                out: true,
                scores: room.scores
            }
        );


        if (room.innings === 1) {

            // First innings completed
            room.target =
                room.scores[battingPlayer] + 1;


            room.innings = 2;


            room.battingPlayer =
                battingPlayer === 0 ? 1 : 0;


            room.choices = {};


            io.to(roomId).emit(
                "inningsChanged",
                {
                    battingPlayer: room.battingPlayer,
                    target: room.target
                }
            );


        } else {

            // Second innings completed
            finishGame(roomId);
        }


        return;
    }


    // Add runs
    room.scores[battingPlayer] +=
        battingChoice;


    // Clear choices
    room.choices = {};


    io.to(roomId).emit(
        "ballResult",
        {
            player1Choice,
            player2Choice,
            out: false,
            scores: room.scores
        }
    );


    // Check target
    if (
        room.innings === 2 &&
        room.scores[battingPlayer] >= room.target
    ) {

        finishGame(roomId);

    }

}


// Finish game
function finishGame(roomId) {

    const room = rooms[roomId];


    let winner;


    if (
        room.scores[0] >
        room.scores[1]
    ) {

        winner = 0;

    } else if (
        room.scores[1] >
        room.scores[0]
    ) {

        winner = 1;

    } else {

        winner = -1;
    }


    io.to(roomId).emit(
        "gameOver",
        {
            scores: room.scores,
            winner: winner
        }
    );

}


server.listen(PORT, () => {

    console.log(
        `🏏 Hand Cricket server running on port ${PORT}`
    );

});
