import jsonwebtoken from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import {config} from "dotenv"
import ResponseError from "../utility/customError"
import User from "../model/User"
import { UserSchema } from "../types/user"
import { Decoded } from "../types/auth"

config()

const authTokenMiddleware = asyncHandler(async (req, res, next) =>{
  
  let token
  try{
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(' ')[1]
      const decoded= jsonwebtoken.verify(token, `${process.env.JWT_SECRET}`) as Decoded
      const user= await User.findByPk(decoded.id) as UserSchema
      req.user= user      
    }

  }catch(err:any){
    throw new ResponseError(`Auth Token Not Authorized`, 401)
  }

  if(!token){
    throw new ResponseError(`No Auth Token`, 401)
  }

  next()
})

export default authTokenMiddleware