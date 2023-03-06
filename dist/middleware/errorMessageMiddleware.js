"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const customError_1 = __importDefault(require("../utility/customError"));
(0, dotenv_1.config)();
const errorMiddleware = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.statusCode = err.statusCode;
    error.message = err.message;
    error.stack = err.stack;
    if (err.name === 'SequelizeValidationError') {
        const message = Object.values(error.errors).map((val) => val.message);
        error = new customError_1.default(`${message}`, 400);
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = Object.values(error.errors).map((val) => val.message);
        error = new customError_1.default(`${message}`, 400);
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Interval Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};
exports.default = errorMiddleware;
