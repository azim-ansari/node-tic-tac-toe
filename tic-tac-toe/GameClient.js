import chalk from "chalk";
import repl from "repl";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 5000;
const socket = require("socket.io-client")(`http://localhost:${port}`);

let latest_player = null;

//when new User Connected
socket.on("connect", () => {
	process.argv[2]
		? console.log(chalk.green.bold(`**********Welcome To Game********** ${process.argv[2]}===`))
		: console.log(chalk.green.bold(`**********Welcome To Game**********`));
	// console.log("username:::", process.argv[0]);
	let username = process.argv[2];
});

//when new User DisConnected
socket.on("disconnect", () => {
	socket.emit("User disconnected");
});

//WaitingForJoining
socket.on("waitingForJoining", () => {
	console.log(chalk.yellow("Wait !! opponent is joining............."));
});

//two players are paired. shwoing message to start the game
socket.on("startGame", ({ symbol, player }) => {
	symbol === "X"
		? console.log(chalk.yellowBright("Game Started. You are Player " + player))
		: console.log(chalk.yellowBright("Game Started. You are Player " + player));
	latest_player = player;
	console.log(chalk.inverse("................Game Borad............."));
	console.log(chalk.green.bold.inverse("---------------------------------------"));
	console.log(chalk.green.bold.inverse("|                 1  2  3             |"));
	console.log(chalk.green.bold.inverse("|                 4  5  6             |"));
	console.log(chalk.green.bold.inverse("|                 7  8  9             |"));
	console.log(chalk.green.bold.inverse("---------------------------------------"));
	symbol === "X"
		? console.log(chalk.yellow("Press number to move, This is your turn"))
		: console.log(
				chalk.green.inverse("Wait untill Player 1 don't move, This is your opponent turn")
		  );
});

//validation check on players move
socket.on("gameMove", ({ player, turn, symbol }) => {
	// const { player, turn, symbol } = data;
	//If the wrong player plays
	if (turn === false) {
		console.log(chalk.red("Let your Opponent Play, Not your turn, "));
	}
	//If the right player plays his turn
	else {
		console.log(
			chalk.yellow(
				"Now its your turn to play. Player " +
					player +
					" has played his move, Your symbol is " +
					symbol
			)
		);
	}
});

//waiting for oppenent move
socket.on("waitingGame", () => {
	console.log(chalk.yellow("Waiting for opponent to play .........."));
});

//current move status of player in game
socket.on("gameStatus", ({ playerMoves, playerOpponentMoves, symbol, opponentSymbol }) => {
	let str = "";
	playerMoves.map((move, index) => {
		// console.log("move:::", move, "index::::", index);
		const position = index + 1;
		if (move === true) {
			str = str + chalk.blueBright(symbol) + " ";
			if (index === 2 || index === 5) str = str + "\n";
		} else if (playerOpponentMoves[index] === true) {
			str = str + chalk.gray(opponentSymbol) + " ";
			if (index === 2 || index === 5) str = str + "\n";
		} else {
			str = str + position + " ";
			if (index === 2 || index === 5) str = str + "\n";
		}
	});

	console.log(chalk.bold.green("                                            "));
	console.log(chalk.green.bold.inverse(str));
	console.log(chalk.green.bold("                                            "));
});

//when players moves wrong move displaying.
socket.on("gameWrongMove", msg => {
	console.log(chalk.red(msg));
});

//Game won message
socket.on("gameWon", ({ player }) => {
	console.log(chalk.green(`Player ${player}  Winner .`));
});

//message when oppenent left the game
socket.on("gameOpponentLeft", () => {
	console.log(
		chalk.green(`Winner !! you have won the match, Your opponent has resigned the game.`)
	);
});

//self left the game result showing
socket.on("gameLeft", () => {
	console.log(chalk.red(`You lost the Game, Your have resigned the game.`));
});

//when anyone player left during the game move showing message
socket.on("gameOpponentLeftBetween", () => {
	console.log(chalk.green(`You won the game. Your opponent has left the game !`));
});

//showing message when Game is draw
socket.on("gameDraw", () => {
	console.log(chalk.green(`Match Draw !`));
});

//When Game is over.
socket.on("gameOver", () => {
	console.log(chalk.red("Game is over. Restart your game to play again !"));
});
//Whenever users enters something in command line it send to the socket server with message event.
repl.start({
	prompt: "",
	eval: cmd => {
		socket.send({ cmd, player: latest_player });
	},
});
