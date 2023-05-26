import { RequestHandler } from "express"
import asyncHandler from "express-async-handler"
import { PostSchema, UserLikePost } from "../types/post"
import Post from "../model/Post"
import ResponseError from "../utility/customError"
import Save from "../model/Save"
import User from "../model/User"
import { SaveValues } from "../types/save"

const savePostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  let query
  const post = await Post.findByPk(req.params.id) as PostSchema
  if(!post){
    throw new ResponseError("Post not found", 404)
  }

  const saveData= await Save.findAll({include: [{ model: User, attributes:['id','name','email','photo','isHideLike'] }]}) as SaveValues[]
  
  const user={
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    photo: req.user.photo
  }

  const save= await Save.findOne({ where: { postId: req.params.id, savePostUserId: req.user.id } }) as SaveValues
  
  if(save){
    query = saveData.filter((val: SaveValues) => val.postId !== +req.params.id)
    post.saveBy = post.saveBy?.filter((val:UserLikePost) => val.id !== req.user.id)
    await Save.destroy({ where: { postId: req.params.id } })

  }else{
    const values={
      savePostUserId: req.user.id,
      postId: req.params.id,
      userId: post.userId,
    }

    const createSave = await Save.create(values)
    query = { ...createSave.dataValues, user }
    post.saveBy= [...JSON.parse(JSON.stringify(post.saveBy)), user] 

  }

  await post.save()
  
  res.status(201).json({ success:true, data: query })
  
})

const getAllSavePostData: RequestHandler = asyncHandler(async(req, res, next) =>{

  const save= await Save.findAll({ where: { savePostUserId: req.user.id }, order: [['createdAt', 'DESC']], include: [ {model:User, attributes:['id','name','email','photo', 'isHideLike']}, {model:Post} ] })
  
  // if(save.length === 0){
  //   throw new ResponseError("Save post not found", 404)
  // }
  res.status(200).json({ success:true, data: save })
  
}) 

export {
  savePostData,
  getAllSavePostData,
}