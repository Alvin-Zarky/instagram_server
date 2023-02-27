import jsonwebtoken from "jsonwebtoken"
import {config} from "dotenv"

config()
const generateUserToken = (id: string) =>{
  return jsonwebtoken.sign({ id }, `${process.env.JWT_SECRET}`, {expiresIn: process.env.JWT_EXPIRE_IN})
}

export default generateUserToken