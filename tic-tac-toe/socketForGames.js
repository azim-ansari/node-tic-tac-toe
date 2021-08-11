const socketIO = require("socket.io");
const {
	joinGame,
	playerSymbol,
	joinOppenent,
	playerTurn,
	changeTurn,
	PlayerMoves,
	playerDetails,
	checkValidMove,
	hasResigned,
	winningMove,
	matchDraw,
	makeWinner,
	gameOver,
} = require("../condition/gameCondition");
module.exports = {
	connectSocketToGame: socketToserver => {
		// console.log("Azim");
		const IO = socketIO(socketToserver);
		// console.log("IO:::::", IO);
		IO.sockets.on("connection", socket => {
			console.log(`New connection added`, socket.id);
			//join game for the players
			joinGame(socket);
			// check opponent exist for the game to pair.
			const opponent_connection = joinOppenent(socket);
			// console.log("opponent_connection:::", opponent_connection);
			// If opponent exists start the game or wait for the opponent to join the game.
			if (opponent_connection) {
				//Players symbol
				const player_symbol = playerSymbol(socket); //Player 2
				const opponent_symbol = playerSymbol(opponent_connection); //Player 1
				//Emit the event to start Player 2 game
				socket.emit("StartGame", {
					symbol: player_symbol,
					player: 2,
				});
				//Emit the event to start Player 1 game for opponent connection
				opponent_connection.emit("StartGame", {
					symbol: opponent_symbol,
					player: 1,
				});
			}
			//No opponent has joined the game
			else {
				socket.emit("WaitingForJoining");
			}
			//when user enters any Number in command line then Emit events
			socket.on("message", cmd => {
				//To know whether it is chance of the player who is trying to play
				turn = playerTurn(socket);
				//To check whether the game is not over yet
				if (!gameOver(socket)) {
					//Wrong player move
					if (!turn) socket.emit("GameMove", { ...cmd, turn });
					//Right player move
					else {
						const opponent_socket = joinOppenent(socket);
						const move = cmd.cmd.split("\n");
						//Check whether user is entering a valid key or move
						const { status, msg } = checkValidMove(socket, move[0]);
						//When user enters the valid key or move
						if (!status) {
							//Set the move in players data
							PlayerMoves(socket, move[0]);
							//Chek whether the move played is the winning move
							if (!winningMove(socket)) {
								//Check whether the move played is drawing the match
								if (!matchDraw(socket)) {
									//Show status of game to both the players
									socket.emit("gameStatus", playerDetails(socket));
									opponent_socket.emit("gameStatus", playerDetails(opponent_socket));
									const symbol = playerSymbol(opponent_socket);
									//Display message to both the users letting them know who have the next turn
									opponent_socket.emit("GameMove", { ...cmd, turn, symbol });
									socket.emit("WaitingGame");
									//Change Turn of the player
									changeTurn(socket);
								} else {
									socket.emit("GameStatus", playerDetails(socket));
									opponent_socket.emit("GameStatus", playerDetails(opponent_socket));
									socket.emit("GameDraw");
									opponent_socket.emit("GameDraw");
								}
							} else {
								socket.emit("GameStatus", playerDetails(socket));
								opponent_socket.emit("GameStatus", playerDetails(opponent_socket));
								socket.emit("GameWon", cmd);
								opponent_socket.emit("GameWon", cmd);
							}
						}
						//If user has not played valid move i.e 1-9
						else {
							//Check whether player has entered r key to resign
							if (hasResigned(socket, move[0])) {
								socket.emit("GameLeft");
								opponent_socket.emit("GameOpponentLeft");
							} else {
								socket.emit("GameWrongMove", msg);
							}
						}
					}
				}
				//Game Over
				else {
					socket.emit("GameOvar");
				}
			});
			//When users disconnects
			socket.on("disconnect", () => {
				const opponent_socket = joinOppenent(socket);
				opponent_socket.emit("GameOpponentLeftBetween", () => {
					console.log("Opponent Player has left the game");
				});
				//Make winner to the opponent of player who left
				makeWinner(socket);
			});
		});
	},
};
