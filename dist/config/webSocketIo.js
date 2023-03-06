"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const webSocketIo = (io) => {
    io.on("connection", (socket) => {
        console.log(colors_1.default.green.bold.underline(`Connection Successfully ${socket.id}`));
        socket.on("disconnect", () => {
            console.log(colors_1.default.red.bold.underline(`Disconnected ${socket.id}`));
        });
        socket.on("message", (data) => {
            socket.broadcast.emit("message-receiver", data);
        });
    });
};
exports.default = webSocketIo;
