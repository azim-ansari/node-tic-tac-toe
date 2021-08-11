import express from "express";
import IP from "ip";
import Server from "http";
import { connectSocketToGame } from "./tic-tac-toe/socketForGames";

const app = express();
const server = Server.createServer(app);

connectSocketToGame(server);

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`connected to ${IP.address()} : ${port}`));
