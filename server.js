require("dotenv").config();
const express = require("express");
const IP = require("ip");
const app = express();
const server = require("http").createServer(app);
const ticTacToeGame = require("./tic-tac-toe/socketForGames").connectSocketToGame(server);

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`connected to ${IP.address()} : ${port}`));
