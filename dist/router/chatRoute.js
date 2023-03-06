"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const chatController_1 = require("../controller/chatController");
const router = express_1.default.Router();
router.use(authMiddleware_1.default);
router.route('/').post(chatController_1.postUserChat).get(chatController_1.getUserChat);
router.route('/:id').put(chatController_1.updateUserChat).delete(chatController_1.deleteUserChat);
exports.default = router;
