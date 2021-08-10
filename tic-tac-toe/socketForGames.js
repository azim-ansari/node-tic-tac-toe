const socketIO = require("socket.io");
const {
	joinGame,
	playerSymbol,
	joinOppenent,
	playerSocket,
	playerTurn,
	changeTurn,
	setPlayerMoves,
	playerDetails,
	checkValidMove,
	hasResigned,
	winningMove,
	matchDraw,
	makeWinner,
	gameOver,
} = require("../gameCondition.js/gameCondition");
module.exports = {
	connectSocketToGame: serverToServer => {
		// console.log("Azim");
		const IO = socketIO(serverToServer);
		// console.log("IO:::::", IO);
		IO.sockets.on("connection", socket => {
			console.log(`New connection added`, socket.id);
			//join game for the players
			joinGame(socket);
			// check opponent exist fro the game to pair.
			const opponent_connection = joinOppenent(socket);
			// If opponent exists start the game or wait for the opponent to join the game.
			if (!opponent_connection) {
				//Players symbol
				const player_symbol = playerSymbol(socket); //Player 2
				const opponent_symbol = playerSymbol(opponent_connection); //Player 1
				//Emit the event to start Player 2 game
				socket.emit("StartGame", {
					symbol: player_symbol,
					player: 2,
				});
				//Emit the event to start Player 1 game
				opponent_socket.emit("StartGame", {
					symbol: opponent_symbol,
					player: 1,
				});
			}
			//No opponent has joined the game
			else {
				socket.emit("WaitingForJoining");
			}
		});
	},
};
