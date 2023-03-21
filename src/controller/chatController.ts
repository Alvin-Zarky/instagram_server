import asyncHandler from "express-async-handler"
import Chat from "../model/Chat"
import { ChatSchema } from "../types/chat"
import { RequestHandler } from "express"
import ResponseError from "../utility/customError"
import User from "../model/User"
import { io } from "../server"

const getUserChat: RequestHandler  = asyncHandler(async(req, res, next) =>{

  const chat= await Chat.findAll({ order: [['createdAt','desc']], include: [{ model: User, attributes: ['id','name','email','photo'] }] })
  if(chat.length === 0){
    throw new ResponseError(`Message not found`, 404)
  }
  res.status(200).json({ success:true, data: chat })

})

const postUserChat: RequestHandler  = asyncHandler(async(req, res, next) =>{

  const { message } = req.body
  if(!message){
    throw new ResponseError(`Please input the message`, 400)
  }

  const values={
    message,
    userId: req.user.id
  }
  const chat= await Chat.create(values)
  
  const data= { ...chat.dataValues, user: { id: req.user.id, name: req.user.name, email: req.user.email, photo: req.user.photo } }
  io.emit("message-receiver", data);

  res.status(201).json({ success:true, data })

})

const updateUserChat: RequestHandler = asyncHandler(async(req, res, next) =>{

  const { message } = req.body
  const chat = await Chat.findByPk(req.params.id) as ChatSchema
  
  if(!chat){
    throw new ResponseError(`Message not found`, 404)
  }
  if(chat.userId !== req.user.id){
    throw new ResponseError(`User cannot access grant the message`, 401)
  }

  chat.message= message
  await chat.save()

  res.status(200).json({ success:true, data: chat })

})

const deleteUserChat: RequestHandler = asyncHandler(async(req, res, next) =>{

  const chat= await Chat.findByPk(req.params.id) as ChatSchema
  if(!chat){
    throw new ResponseError(`Message not found`, 404)
  }
  if(chat.userId !== req.user.id){
    throw new ResponseError(`User cannot access grant the message`, 401)
  }
  await chat.destroy()
  
  const data= { ...chat.dataValues, user: { id: req.user.id, name: req.user.name, email: req.user.email, photo: req.user.photo } }
  io.emit('delete-chat', data)

  res.status(200).json({ success:true, data })

})

export {
  getUserChat,
  postUserChat,
  updateUserChat,
  deleteUserChat
}