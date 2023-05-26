import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import ResponseError from "../utility/customError";
import Post from "../model/Post";
import { Pagination, PostSchema, UserLikePost } from "../types/post";
import User from "../model/User";
import { io } from "../server";
import Save from "../model/Save";
import cloudinary from "../config/cloudinary";
import { config } from "dotenv";
import { Op } from "sequelize";
import { UserSchema } from "../types/user";
import Notification from "../model/Notification";

config();

const getAllPostData: RequestHandler = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const startPage = (page - 1) * limit;
  const endPage = page * limit;
  let pagination: Pagination = {};

  const count = await Post.count();
  const data = await Post.findAll({
    offset: startPage,
    limit,
    order: [["createdAt", "DESC"]],
    include: [{ model: User, attributes: ["id", "name", "email", "photo","isHideLike"] }],
  });

  if (data.length === 0) {
    throw new ResponseError(`Data not found`, 404);
  }

  if (startPage > 0) {
    pagination.prev = {
      page: page - 1,
    };
  }

  if (endPage < count) {
    pagination.next = {
      page: page + 1,
    };
  }

  res.status(200).json({ success: true, pagination, dataCount: count, data });
});

const getPostByUser: RequestHandler = asyncHandler(async (req, res, next) => {
  const post = await Post.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
    include: [{ model: User, attributes: ["id", "name", "email", "photo","isHideLike"] }],
  });
  if (post.length === 0) {
    throw new ResponseError(`Post not found`, 404);
  }

  res.status(200).json({ success: true, data: post });
});

const getSinglePostData: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const data = (await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["id", "name", "email", "photo","isHideLike"] }],
    })) as PostSchema;

    if (!data) {
      throw new ResponseError(`Data not found`, 404);
    }

    res.status(200).json({ success: true, data });
  }
);

const createPostData: RequestHandler = asyncHandler(async (req, res, next) => {
  const { text, media, likes, comments, tags } = req.body;
  if (!media || media.length === 0) {
    throw new ResponseError("Please insert the media", 400);
  }

  const urlImages = [];
  const mediaDetail=[]
  let cloudSource;

  if (media.length > 0) {
    for (let value of media) {
      cloudSource = await cloudinary.v2.uploader.upload(value.url, {
        upload_preset: process.env.UPLOAD_PRESET,
        resource_type: value.type.startsWith("image") ? "image" : "video",
        quality: 'auto'
      });
      urlImages.push(cloudSource.secure_url)
      mediaDetail.push({public_id: cloudSource.public_id, type: value.type})
    }
  }

  const post = await Post.create({
    userId: req.user.id,
    text,
    media: urlImages,
    mediaDetail,
    likes: [],
    comments: [],
    tags: [],
    saveBy: [],
  });

  const data = {
    ...post.dataValues,
    comments: JSON.parse(post.getDataValue("comments")),
    likes: JSON.parse(post.getDataValue("likes")),
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      photo: req.user.photo,
    },
  };
  io.emit("post-data", data);

  res.status(201).json({ success: true, data });
});

const updatePostData: RequestHandler = asyncHandler(async (req, res, next) => {
  const { text, media, likes, comments, tags } = req.body;

  const post = (await Post.findByPk(req.params.id, {include: [{
    model: User,
    attributes:['id','name','email','photo','isHideLike']
  }]})) as PostSchema;

  if (!post) {
    throw new ResponseError("Post not found", 404);
  }

  post.text = text;
  post.media = media;
  post.tags = tags;

  if (likes.length > 0) {
    const userAlreadyLiked = post.likes?.find(
      (val: UserLikePost) => val.id === req.user.id
    );
    if (!userAlreadyLiked) {
      post.likes = [...JSON.parse(JSON.stringify(post.likes)), ...likes];

      const likeNotification = await Notification.create({
        activity: 'liked on your post',
        userId: req.user.id,
        postId: post.id,
      })

      io.emit("notification", likeNotification)
    } else {
      const data = post.likes?.filter(
        (val: UserLikePost) => val.id !== req.user.id
      );
      post.likes = data;
      
      const unlike = await Notification.destroy({ where: { userId: req.user.id, postId: post.id, activity: 'liked on your post' } })
      io.emit("notification", unlike)
    }
  }

  if (comments.length > 0) {
    post.comments = [...JSON.parse(JSON.stringify(post.comments)), ...comments];
    const comment = await Notification.create({
      activity:'commented on your post',
      userId: req.user.id,
      postId: post.id
    })

    io.emit("notification", comment)
  }

  await post.save();

  io.emit("post-data", post);

  res.status(200).json({ success: true, data: post });
});

const deletePostData: RequestHandler = asyncHandler(async (req, res, next) => {
  const post = (await Post.findByPk(req.params.id)) as PostSchema;
  if (!post) {
    throw new ResponseError(`Post not found`, 404);
  }
  if (post.userId !== req.user.id) {
    throw new ResponseError(`User cannot grant access the post`, 401);
  }

  if(post.mediaDetail?.length! > 0){
    for(let data of post.mediaDetail!){
      cloudinary.v2.uploader.destroy(data.public_id, {resource_type: data.type.startsWith("image") ? "image": "video"})
    }
  }

  await post.destroy();

  io.emit("post-data", post);

  res.status(200).json({ success: true, data: post });
});

const getPostByAccount = asyncHandler(async(req, res, next) =>{

  const {name} = req.params
  
  const user= await User.findOne({
    where:{
      name: {
        [Op.iLike]: name.toLowerCase()
      }
    }
  }) as UserSchema
  if(!user){
    throw new ResponseError("User not found", 404)
  }

  const post= await Post.findAll({
    where:{
      userId: user.id
    },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "photo","isHideLike"]
      }
    ]
  })

  if(post.length === 0){
    throw new ResponseError("Post not found", 404)
  }

  res.status(200).json({
    success:true,
    data: post
  })

})

export {
  getAllPostData,
  getSinglePostData,
  getPostByUser,
  createPostData,
  updatePostData,
  deletePostData,
  getPostByAccount
};
