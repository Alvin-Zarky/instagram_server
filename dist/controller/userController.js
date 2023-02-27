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
exports.userProfile = exports.userLogOut = exports.userRegister = exports.userLogIn = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../model/User"));
const customError_1 = __importDefault(require("../utility/customError"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateUserToken_1 = __importDefault(require("../helper/generateUserToken"));
const sequelize_1 = require("sequelize");
const userRegister = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, photo } = req.body;
    if (!name) {
        throw new customError_1.default('Please input the name', 401);
    }
    if (!email) {
        throw new customError_1.default("Please input the email", 401);
    }
    if (!validator_1.default.isEmail(email)) {
        throw new customError_1.default("Email invalid", 401);
    }
    if (!password) {
        throw new customError_1.default("Please input the password", 401);
    }
    if (password.length < 6) {
        throw new customError_1.default("Password should be atleast 6 characters", 401);
    }
    const nameExist = yield User_1.default.findOne({ where: { name: { [sequelize_1.Op.iLike]: name.toLowerCase() } } });
    if (nameExist) {
        throw new customError_1.default(`Name was already existed`, 401);
    }
    const emailExist = yield User_1.default.findOne({ where: { email: { [sequelize_1.Op.iLike]: email.toLowerCase() } } });
    if (emailExist) {
        throw new customError_1.default(`Email was already existed`, 401);
    }
    const genSalt = yield bcryptjs_1.default.genSalt(10);
    const hash = yield bcryptjs_1.default.hash(password, genSalt);
    const user = yield User_1.default.create({
        name,
        email,
        password: hash,
        photo,
        role: 'user',
        isAdmin: false,
        isActive: true
    });
    res.status(201).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            role: user.role,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            token: (0, generateUserToken_1.default)(user.id)
        }
    });
}));
exports.userRegister = userRegister;
const userLogIn = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, password } = req.body;
    if (!user) {
        throw new customError_1.default('Please input the name or email', 401);
    }
    if (!password) {
        throw new customError_1.default(`Please input the password`, 401);
    }
    const userNameExist = yield User_1.default.findOne({ where: { name: { [sequelize_1.Op.iLike]: user.toLowerCase() } } });
    const userEmailExist = yield User_1.default.findOne({ where: { email: { [sequelize_1.Op.iLike]: user.toLowerCase() } } });
    if (!userEmailExist && !userNameExist) {
        throw new customError_1.default(`Username or Email was incorrect`, 401);
    }
    if (userNameExist) {
        if (password && (yield bcryptjs_1.default.compare(password, userNameExist.password))) {
            const user = {
                id: userNameExist.id,
                name: userNameExist.name,
                email: userNameExist.email,
                role: userNameExist.role,
                photo: userNameExist.photo,
                isActive: userNameExist.isActive,
                isAdmin: userNameExist.isAdmin,
                token: (0, generateUserToken_1.default)(userNameExist.id)
            };
            res.status(200).json({ success: true, data: user });
        }
        else {
            throw new customError_1.default(`Password was incorrect`, 401);
        }
    }
    if (userEmailExist) {
        if (password && (yield bcryptjs_1.default.compare(password, userEmailExist.password))) {
            const user = {
                id: userEmailExist.id,
                name: userEmailExist.name,
                email: userEmailExist.email,
                role: userEmailExist.role,
                photo: userEmailExist.photo,
                isActive: userEmailExist.isActive,
                isAdmin: userEmailExist.isAdmin,
                token: (0, generateUserToken_1.default)(userEmailExist.id)
            };
            res.status(200).json({ success: true, data: user });
        }
        else {
            throw new customError_1.default(`Password was incorrect`, 401);
        }
    }
}));
exports.userLogIn = userLogIn;
const userLogOut = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ success: true, message: 'user logout' });
}));
exports.userLogOut = userLogOut;
const userProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ success: true, message: 'user profile' });
}));
exports.userProfile = userProfile;
