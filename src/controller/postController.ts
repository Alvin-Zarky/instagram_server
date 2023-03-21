import asyncHandler from "express-async-handler"
import { RequestHandler } from "express"
import ResponseError from "../utility/customError"
import Post from "../model/Post"
import { PostSchema } from "../types/post"
import User from "../model/User"
import { io } from "../server"

const getAllPostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  const page= Number(req.query.page) || 1
  const limit= Number(req.query.limit) || 1
  const startPage = (page - 1) * limit

  const data= await Post.findAll({ limit, order:[['createdAt', 'DESC']], include: [{ model: User, attributes:['id','name','email','photo'] }] })

  // const data= await Post.findAll({ offset: startPage, limit, order:[['createdAt', 'DESC']], include: [{ model: User, attributes:['id','name','email','photo'] }] })
  if(data.length === 0){
    throw new ResponseError(`Data not found`, 404)
  }

  res.status(200).json({ success:true, data })

})

const getPostByUser: RequestHandler = asyncHandler(async(req, res, next) =>{

  const post= await Post.findAll({ where: { userId: req.user.id }, include: [{ model: User, attributes: ['id','name','email','photo'] }] })
  if(post.length === 0){
    throw new ResponseError(`Post not found`, 404)
  }

  res.status(200).json({ success:true, data: post })

})

const getSinglePostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  const data= await Post.findByPk(req.params.id, { include: [{model: User, attributes: ['id','name','email', 'photo']}] }) as PostSchema
  if(!data){
    throw new ResponseError(`Data not found`, 404)
  }
  // if(data.userId !== req.user.id){
  //   throw new ResponseError(`User cannot access grant the post data`, 401)
  // }

  res.status(200).json({ success:true, data })

})  

const createPostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  const { text, media, likes, comments, tags } = req.body
  if(!text){
    throw new ResponseError("Please input the text", 400)
  }
  if(!media){
    throw new ResponseError("Please insert the media", 400)
  }

  const post= await Post.create({
    userId: req.user.id,
    text,
    media,
    likes,
    comments,
    tags
  })

  const data = { ...post.dataValues, comments: JSON.parse(post.getDataValue('comments')), likes: JSON.parse(post.getDataValue('likes')),  user: { id: req.user.id, name: req.user.name, email: req.user.email, photo: req.user.photo } }
  io.emit('post-data', data)
  
  res.status(201).json({ success:true, data })

})

const updatePostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  const { text, media, likes, comments, tags }= req.body

  const post = await Post.findByPk(req.params.id) as PostSchema

  if(!post){
    throw new ResponseError("Post not found", 404)
  }
  
  post.text= text
  post.media= media
  post.tags= tags
  
  post.likes = [...JSON.parse(JSON.stringify(post.likes)), ...likes]
  post.comments= [...JSON.parse(JSON.stringify(post.comments)), ...comments]
  await post.save()

  io.emit('update-post', post)

  res.status(200).json({ success:true, data: post })

})

const deletePostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  const post= await Post.findByPk(req.params.id) as PostSchema
  if(!post){
    throw new ResponseError(`Post not found`, 404)
  }
  if(post.userId !== req.user.id){
    throw new ResponseError(`User cannot grant access the post`, 401)
  }

  await post.destroy()
  io.emit('delete-post', post)

  res.status(200).json({ success:true, data: post })

})

export {
  getAllPostData,
  getSinglePostData,
  getPostByUser,
  createPostData,
  updatePostData,
  deletePostData,
}