"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserChat = exports.updateUserChat = exports.postUserChat = exports.getUserChat = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Chat_1 = __importDefault(require("../model/Chat"));
const customError_1 = __importDefault(require("../utility/customError"));
const User_1 = __importDefault(require("../model/User"));
const server_1 = require("../server");
const getUserChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findAll({ order: [['createdAt', 'desc']], include: [{ model: User_1.default, attributes: ['id', 'name', 'email', 'photo'] }] });
    if (chat.length === 0) {
        throw new customError_1.default(`Message not found`, 404);
    }
    res.status(200).json({ success: true, data: chat });
}));
exports.getUserChat = getUserChat;
const postUserChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    if (!message) {
        throw new customError_1.default(`Please input the message`, 400);
    }
    const values = {
        message,
        userId: req.user.id
    };
    const chat = yield Chat_1.default.create(values);
    const data = Object.assign(Object.assign({}, chat.dataValues), { user: { id: req.user.id, name: req.user.name, email: req.user.email, photo: req.user.photo } });
    server_1.io.emit("message-receiver", data);
    res.status(201).json({ success: true, data });
}));
exports.postUserChat = postUserChat;
const updateUserChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    const chat = yield Chat_1.default.findByPk(req.params.id);
    if (!chat) {
        throw new customError_1.default(`Message not found`, 404);
    }
    if (chat.userId !== req.user.id) {
        throw new customError_1.default(`User cannot access grant the message`, 401);
    }
    chat.message = message;
    yield chat.save();
    res.status(200).json({ success: true, data: chat });
}));
exports.updateUserChat = updateUserChat;
const deleteUserChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findByPk(req.params.id);
    if (!chat) {
        throw new customError_1.default(`Message not found`, 404);
    }
    if (chat.userId !== req.user.id) {
        throw new customError_1.default(`User cannot access grant the message`, 401);
    }
    yield chat.destroy();
    const data = Object.assign(Object.assign({}, chat.dataValues), { user: { id: req.user.id, name: req.user.name, email: req.user.email, photo: req.user.photo } });
    server_1.io.emit('delete-chat', data);
    res.status(200).json({ success: true, data });
}));
exports.deleteUserChat = deleteUserChat;
