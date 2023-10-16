"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.post('/login', userController_1.userLogIn);
router.post('/register', userController_1.userRegister);
router.get('/logout', authMiddleware_1.default, userController_1.userLogOut);
router.route('/profile').get(authMiddleware_1.default, userController_1.userProfile).put(authMiddleware_1.default, userController_1.editUserProfile);
router.get('/all', authMiddleware_1.default, userController_1.getAllUser);
exports.default = router;