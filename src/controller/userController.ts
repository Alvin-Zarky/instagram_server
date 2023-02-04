import expressAsyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import User from "../model/User";

const userLogIn: RequestHandler = expressAsyncHandler(async(req, res, next) =>{
  res.status(200).json({ success:true, message: 'user login' })
})

const userRegister: RequestHandler = expressAsyncHandler(async(req, res, next) =>{
  res.status(201).json({ success:true, message: 'user register' })
})

const userLogOut: RequestHandler = expressAsyncHandler(async(req, res, next) =>{
  res.status(200).json({ success:true, message: 'user logout' })
})

const userProfile: RequestHandler = expressAsyncHandler(async(req, res, next) =>{
  res.status(200).json({ success:true, message: 'user profile' })
})

export {
  userLogIn,
  userRegister,
  userLogOut,
  userProfile
}