"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const sequelize = new sequelize_1.Sequelize(`${process.env.DATABASE}`, `${process.env.ROOT}`, `${process.env.PASSWORD}`, {
    host: `${process.env.HOST}`,
    dialect: 'postgres'
});
exports.default = sequelize;
