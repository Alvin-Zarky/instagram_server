"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controller/postController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.use(authMiddleware_1.default);
router.get('/myPost', postController_1.getPostByUser);
router.route('/').get(postController_1.getAllPostData).post(postController_1.createPostData);
router.route('/:id').get(postController_1.getSinglePostData).put(postController_1.updatePostData).delete(postController_1.deletePostData);
exports.default = router;
