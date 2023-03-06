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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const dotenv_1 = require("dotenv");
const customError_1 = __importDefault(require("../utility/customError"));
const User_1 = __importDefault(require("../model/User"));
(0, dotenv_1.config)();
const authTokenMiddleware = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
            const user = yield User_1.default.findByPk(decoded.id);
            req.user = user;
        }
    }
    catch (err) {
        throw new customError_1.default(`Auth Token Not Authorized`, 401);
    }
    if (!token) {
        throw new customError_1.default(`No Auth Token`, 401);
    }
    next();
}));
exports.default = authTokenMiddleware;
