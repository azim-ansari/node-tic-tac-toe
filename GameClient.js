require("dotenv").config();
let port = process.env.port || 5000;
const socket = require("socket.io-client")(`http://localhost:${port}`);
const chalk = require("chalk");
const repl = require("repl");
// console.log("socket:::", socket);
let current_player = null;

//when new User Connected
socket.on("connect", () => {
	process.argv[2]
		? console.log(chalk.green.bold(`**********Welcome To Game********** ${process.argv[2]}====`))
		: console.log(chalk.green.bold(`**********Welcome To Game**********`));
	username = process.argv[2];
});

//when new User DisConnected
socket.on("disconnect", () => {
	socket.emit("User disconnected");
});

//WaitingForJoining
socket.on("WaitingForJoining", () => {
	console.log("opponent joining...........");
});

//two players are paired. shwoing message to start the game
socket.on("StartGame", ({ symbol, player }) => {
	symbol === "X"
		? console.log("Game Started. You are Player " + player)
		: console.log("Game Started. You are Player " + player);
	current_player = player;
	console.log(chalk.green("General Description"));
	console.log("The Tic-Tac-Toe board is numbered like this :");
	console.log(chalk.green(" 1  2  3"));
	console.log(chalk.green(" 4  5  6"));
	console.log(chalk.green(" 7  8  9"));
	symbol === "X"
		? console.log(chalk.blue(" Its Your Turn. Please enter your position to move !"))
		: console.log(chalk.blue("Your Opponent Turn. Please wait untill he plays the move !"));
});

//When Game is over.
socket.on("GameOver", () => {
	console.log(chalk.red("Game is over. Restart your game to play again !"));
});

//validation check on players move
socket.on("GameMove", data => {
	const { player, turn, symbol } = data;
	//If the wrong player plays
	if (turn === false) {
		console.log(chalk.red("Not your turn, Let your Opponent Play"));
	}
	//If the right player plays his turn
	else {
		console.log(
			chalk.blue(
				"Player " +
					player +
					" has played his move, Now its your turn to play. Your symbol is " +
					symbol
			)
		);
	}
});

//waiting for oppenent move
socket.on("WaitingGame", () => {
	console.log(chalk.blue("Waiting for opponent to play .........."));
});

//current move status of player in game
socket.on("gameStatus", ({ playerMoves, playerOpponentMoves, symbol, opponentSymbol }) => {
	let str = "";
	playerMoves.map((move, index) => {
		// console.log("move:::", move, "index::::", index);
		const position = index + 1;
		if (move === true) {
			str = str + chalk.bgMagenta(symbol) + " ";
			if (index === 2 || index === 5) str = str + "\n";
		} else if (playerOpponentMoves[index] === true) {
			str = str + chalk.bgCyan(opponentSymbol) + " ";
			if (index === 2 || index === 5) str = str + "\n";
		} else {
			str = str + position + " ";
			if (index === 2 || index === 5) str = str + "\n";
		}
	});

	console.log(chalk.yellow("**************************"));

	console.log(str);

	console.log(chalk.yellow("**************************"));
});

//when players moves wrong move displaying.
socket.on("GameWrongMove", msg => {
	console.log(chalk.red(msg));
});

//Game won message
socket.on("GameWon", ({ player }) => {
	console.log(chalk.green("Player " + player + " has won the Game"));
});

//message when oppenent left the game
socket.on("GameOpponentLeft", () => {
	console.log(chalk.green("You won the Game, Your opponent has resigned the game."));
});

//self left the game result showing
socket.on("GameLeft", () => {
	console.log(chalk.red("You lost the Game, Your have resigned the game."));
});

//when anyone player left during the game move showing message
socket.on("GameOpponentLeftBetween", () => {
	console.log(chalk.green("You won the game. Your opponent has left the game !"));
});

//showing message when Game is draw
socket.on("GameDraw", () => {
	console.log(chalk.green("Match Draw !"));
});

//Whenever users enters something in command line it send to the socket server with message event.
repl.start({
	prompt: "",
	eval: cmd => {
		socket.send({ cmd, player: current_player });
	},
});
