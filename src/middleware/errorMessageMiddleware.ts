import { ErrorRequestHandler } from "express"
import {config} from "dotenv"
import ResponseError from "../utility/customError"

config()
const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  
  let error = {...err}
  error.statusCode= err.statusCode
  error.message= err.message
  error.stack= err.stack

  if(err.name === 'SequelizeValidationError'){
    const message= Object.values(error.errors).map((val:any) => val.message)
    error = new ResponseError(`${message}`, 400)
  }
  if(err.name === 'SequelizeUniqueConstraintError'){
    const message= Object.values(error.errors).map((val:any) => val.message)
    error = new ResponseError(`${message}`, 400)
  }

  const statusCode= error.statusCode || 500
  const message = error.message || 'Interval Server Error'
  res.status(statusCode).json({
    success:false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  })

}

export default errorMiddleware