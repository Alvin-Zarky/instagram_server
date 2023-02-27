"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const generateUserToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, `${process.env.JWT_SECRET}`, { expiresIn: process.env.JWT_EXPIRE_IN });
};
exports.default = generateUserToken;
