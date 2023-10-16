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
exports.getAllUser = exports.editUserProfile = exports.userProfile = exports.userLogOut = exports.userRegister = exports.userLogIn = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../model/User"));
const customError_1 = __importDefault(require("../utility/customError"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateUserToken_1 = __importDefault(require("../helper/generateUserToken"));
const sequelize_1 = require("sequelize");
const userObjectResult_1 = __importDefault(require("../helper/userObjectResult"));
const server_1 = require("../server");
const userRegister = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, email, password, photo } = req.body;
    if (!name) {
        throw new customError_1.default("Please input the name", 401);
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
    const nameExist = yield User_1.default.findOne({
        where: { name: { [sequelize_1.Op.iLike]: name.toLowerCase() } },
    });
    if (nameExist) {
        throw new customError_1.default(`Name was already existed`, 401);
    }
    const emailExist = yield User_1.default.findOne({
        where: { email: { [sequelize_1.Op.iLike]: email.toLowerCase() } },
    });
    if (emailExist) {
        throw new customError_1.default(`Email was already existed`, 401);
    }
    const genSalt = yield bcryptjs_1.default.genSalt(10);
    const hash = yield bcryptjs_1.default.hash(password, genSalt);
    const user = (yield User_1.default.create({
        name,
        email,
        password: hash,
        photo: "https://res.cloudinary.com/dt89p7jda/image/upload/v1675580588/Instagram%20Clone/user_vzvi5b.png",
        role: "user",
        isAdmin: false,
        isActive: true,
        bio: "",
        links: "",
    }));
    const userObjects = (0, userObjectResult_1.default)(user);
    const data = Object.assign(Object.assign({}, userObjects), { token: (0, generateUserToken_1.default)((_a = user.id) === null || _a === void 0 ? void 0 : _a.toString()) });
    server_1.io.emit('user-register', data);
    res.status(201).json({
        success: true,
        data,
    });
}));
exports.userRegister = userRegister;
const userLogIn = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, password } = req.body;
    if (!user) {
        throw new customError_1.default("Please input the name or email", 401);
    }
    if (!password) {
        throw new customError_1.default(`Please input the password`, 401);
    }
    const userNameExist = (yield User_1.default.findOne({
        where: { name: { [sequelize_1.Op.iLike]: user.toLowerCase() } },
    }));
    const userEmailExist = (yield User_1.default.findOne({
        where: { email: { [sequelize_1.Op.iLike]: user.toLowerCase() } },
    }));
    if (!userEmailExist && !userNameExist) {
        throw new customError_1.default(`Username or Email was incorrect`, 401);
    }
    if (userNameExist) {
        if (password &&
            (yield bcryptjs_1.default.compare(password, userNameExist.password))) {
            userNameExist.isActive = true;
            userNameExist.save();
            const userObjects = (0, userObjectResult_1.default)(userNameExist);
            const user = Object.assign(Object.assign({}, userObjects), { token: (0, generateUserToken_1.default)(String(userNameExist.id)) });
            res.status(200).json({ success: true, data: user });
        }
        else {
            throw new customError_1.default(`Password was incorrect`, 401);
        }
    }
    if (userEmailExist) {
        if (password &&
            (yield bcryptjs_1.default.compare(password, userEmailExist.password))) {
            userEmailExist.isActive = true;
            userEmailExist.save();
            const userObjects = (0, userObjectResult_1.default)(userEmailExist);
            const user = Object.assign(Object.assign({}, userObjects), { token: (0, generateUserToken_1.default)(String(userEmailExist.id)) });
            res.status(200).json({ success: true, data: user });
        }
        else {
            throw new customError_1.default(`Password was incorrect`, 401);
        }
    }
}));
exports.userLogIn = userLogIn;
const userLogOut = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield User_1.default.findByPk(req.user.id));
    if (!user) {
        throw new customError_1.default(`User not found`, 404);
    }
    user.isActive = false;
    yield user.save();
    res.status(200).json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            role: user.role,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: ''
        },
    });
}));
exports.userLogOut = userLogOut;
const userProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (!req.user) {
        throw new customError_1.default(`User not found`, 404);
    }
    if (!req.user.id) {
        throw new customError_1.default(`User not authorized`, 401);
    }
    const userObjects = (0, userObjectResult_1.default)(req.user);
    const token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
    res.status(200).json({
        success: true,
        data: Object.assign(Object.assign({}, userObjects), { token }),
    });
}));
exports.userProfile = userProfile;
const editUserProfile = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, currentPassword, password, photo, bio, links } = req.body;
    if (!req.user.id) {
        throw new customError_1.default(`User not authorized`, 401);
    }
    const user = (yield User_1.default.findByPk(req.user.id));
    if (!user) {
        throw new customError_1.default(`User not found`, 404);
    }
    if (currentPassword &&
        !(yield bcryptjs_1.default.compare(currentPassword, user.password))) {
        throw new customError_1.default(`Current Password was incorrect`, 400);
    }
    if (password) {
        if (password.length < 6) {
            throw new customError_1.default(`Password should be atleast 6 characters`, 401);
        }
        const genSalt = yield bcryptjs_1.default.genSalt(10);
        const hash = yield bcryptjs_1.default.hash(password, genSalt);
        user.password = hash;
    }
    const nameExist = yield User_1.default.findOne({ where: { name: { [sequelize_1.Op.iLike]: name === null || name === void 0 ? void 0 : name.toLowerCase() } } });
    if (nameExist) {
        throw new customError_1.default(`Name was already exist`, 400);
    }
    const emailExist = yield User_1.default.findOne({ where: { email: { [sequelize_1.Op.iLike]: email === null || email === void 0 ? void 0 : email.toLowerCase() } } });
    if (emailExist) {
        throw new customError_1.default(`Email was already exist`, 400);
    }
    user.name = name || req.user.name;
    user.email = email || req.user.email;
    user.photo = photo || req.user.photo;
    user.bio = bio;
    user.links = links;
    yield user.save();
    res.status(200).json({
        success: true,
        data: user,
    });
}));
exports.editUserProfile = editUserProfile;
const getAllUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const data= await User.findAll({ order: [['createdAt', 'desc']] })
    const data = yield User_1.default.findAll({ where: { id: { [sequelize_1.Op.not]: req.user.id } }, order: [['createdAt', 'desc']] });
    if (data.length === 0) {
        throw new customError_1.default("Data not found", 404);
    }
    res.status(200).json({ success: true, data });
}));
exports.getAllUser = getAllUser;