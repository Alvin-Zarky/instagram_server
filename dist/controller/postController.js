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
exports.deletePostData = exports.updatePostData = exports.createPostData = exports.getPostByUser = exports.getSinglePostData = exports.getAllPostData = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const customError_1 = __importDefault(require("../utility/customError"));
const Post_1 = __importDefault(require("../model/Post"));
const User_1 = __importDefault(require("../model/User"));
const server_1 = require("../server");
const getAllPostData = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1;
    const startPage = (page - 1) * limit;
    const data = yield Post_1.default.findAll({ limit, order: [['createdAt', 'DESC']], include: [{ model: User_1.default, attributes: ['id', 'name', 'email', 'photo'] }] });
    // const data= await Post.findAll({ offset: startPage, limit, order:[['createdAt', 'DESC']], include: [{ model: User, attributes:['id','name','email','photo'] }] })
    if (data.length === 0) {
        throw new customError_1.default(`Data not found`, 404);
    }
    res.status(200).json({ success: true, data });
}));
exports.getAllPostData = getAllPostData;
const getPostByUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findAll({ where: { userId: req.user.id }, include: [{ model: User_1.default, attributes: ['id', 'name', 'email', 'photo'] }] });
    if (post.length === 0) {
        throw new customError_1.default(`Post not found`, 404);
    }
    res.status(200).json({ success: true, data: post });
}));
exports.getPostByUser = getPostByUser;
const getSinglePostData = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Post_1.default.findByPk(req.params.id, { include: [{ model: User_1.default, attributes: ['id', 'name', 'email', 'photo'] }] });
    if (!data) {
        throw new customError_1.default(`Data not found`, 404);
    }
    // if(data.userId !== req.user.id){
    //   throw new ResponseError(`User cannot access grant the post data`, 401)
    // }
    res.status(200).json({ success: true, data });
}));
exports.getSinglePostData = getSinglePostData;
const createPostData = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, media, likes, comments, tags } = req.body;
    if (!text) {
        throw new customError_1.default("Please input the text", 400);
    }
    if (!media) {
        throw new customError_1.default("Please insert the media", 400);
    }
    const post = yield Post_1.default.create({
        userId: req.user.id,
        text,
        media,
        likes,
        comments,
        tags
    });
    const data = Object.assign(Object.assign({}, post.dataValues), { comments: JSON.parse(post.getDataValue('comments')), likes: JSON.parse(post.getDataValue('likes')), user: { id: req.user.id, name: req.user.name, email: req.user.email, photo: req.user.photo } });
    server_1.io.emit('post-data', data);
    res.status(201).json({ success: true, data });
}));
exports.createPostData = createPostData;
const updatePostData = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, media, likes, comments, tags } = req.body;
    const post = yield Post_1.default.findByPk(req.params.id);
    if (!post) {
        throw new customError_1.default("Post not found", 404);
    }
    post.text = text;
    post.media = media;
    post.tags = tags;
    post.likes = [...JSON.parse(JSON.stringify(post.likes)), ...likes];
    post.comments = [...JSON.parse(JSON.stringify(post.comments)), ...comments];
    yield post.save();
    server_1.io.emit('update-post', post);
    res.status(200).json({ success: true, data: post });
}));
exports.updatePostData = updatePostData;
const deletePostData = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield Post_1.default.findByPk(req.params.id);
    if (!post) {
        throw new customError_1.default(`Post not found`, 404);
    }
    if (post.userId !== req.user.id) {
        throw new customError_1.default(`User cannot grant access the post`, 401);
    }
    yield post.destroy();
    server_1.io.emit('delete-post', post);
    res.status(200).json({ success: true, data: post });
}));
exports.deletePostData = deletePostData;
