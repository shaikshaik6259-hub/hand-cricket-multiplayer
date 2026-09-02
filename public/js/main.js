const socket = io();


// Create room
function createRoom() {

    const name =
        document.getElementById("createName").value.trim();


    if (name === "") {

        alert("Please enter your name!");

        return;
    }


    socket.emit(
        "createRoom",
        name
    );

}


// Join room
function joinRoom() {

    const name =
        document.getElementById("joinName").value.trim();


    const roomId =
        document
            .getElementById("roomId")
            .value
            .trim();


    if (name === "") {

        alert("Please enter your name!");

        return;
    }


    if (roomId === "") {

        alert("Please enter room code!");

        return;
    }


    socket.emit(
        "joinRoom",
        {
            roomId: roomId,
            playerName: name
        }
    );

}


// Room created
socket.on(
    "roomCreated",
    (data) => {

        localStorage.setItem(
            "roomId",
            data.roomId
        );


        localStorage.setItem(
            "playerIndex",
            data.playerIndex
        );


        window.location.href =
            "game.html";

    }
);


// Room joined
socket.on(
    "roomJoined",
    (data) => {

        localStorage.setItem(
            "roomId",
            data.roomId
        );


        localStorage.setItem(
            "playerIndex",
            data.playerIndex
        );


        window.location.href =
            "game.html";

    }
);


// Error
socket.on(
    "errorMessage",
    (message) => {

        document.getElementById(
            "message"
        ).innerText = message;

    }
);
