import express from "express";
import IP from "ip";
import dotenv from "dotenv";
import http from "http";
import { connectSocketToGame } from "./tic-tac-toe/socketForGames";
const app = express();
const server = http.createServer(app);
connectSocketToGame(server);
dotenv.config();

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`connected to ${IP.address()} : ${port}`));
