"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("../config/sequelize"));
const sequelize_2 = require("sequelize");
const Post = sequelize_1.default.define('post', {
    id: {
        type: sequelize_2.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    text: {
        type: sequelize_2.DataTypes.TEXT("long"),
        // allowNull:false,
    },
    media: {
        type: sequelize_2.DataTypes.ARRAY(sequelize_2.DataTypes.STRING),
        // allowNull:false
    },
    likes: {
        type: sequelize_2.DataTypes.JSON,
        get: function () {
            return JSON.parse(this.getDataValue('likes'));
        },
        set: function (val) {
            return this.setDataValue('likes', JSON.stringify(val));
        }
    },
    comments: {
        type: sequelize_2.DataTypes.JSON,
        get: function () {
            return JSON.parse(this.getDataValue('comments'));
        },
        set: function (val) {
            return this.setDataValue('comments', JSON.stringify(val));
        }
    },
    tags: {
        type: sequelize_2.DataTypes.ARRAY(sequelize_2.DataTypes.STRING)
    }
}, { timestamps: true });
exports.default = Post;
