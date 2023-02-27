"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("../config/sequelize"));
const sequelize_2 = require("sequelize");
const User = sequelize_1.default.define('user', {
    id: {
        type: sequelize_2.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: sequelize_2.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Please input the name'
            },
        }
    },
    email: {
        type: sequelize_2.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Please input the email'
            },
            isEmail: {
                msg: "Email invalid"
            }
        }
    },
    password: {
        type: sequelize_2.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Please input the password'
            },
        }
    },
    photo: {
        type: sequelize_2.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Please insert the image'
            }
        }
    },
    role: {
        type: sequelize_2.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Please input the user role'
            },
            isIn: {
                args: [['user', 'admin']],
                msg: "Please input the correct user role"
            }
        },
        defaultValue: 'user'
    },
    isAdmin: {
        type: sequelize_2.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isActive: {
        type: sequelize_2.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, { timestamps: true });
exports.default = User;
