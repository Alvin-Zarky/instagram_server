import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";
import { UserSchema } from "./User";

export interface ChatSchema{
  dataValues: any;
  id?: number,
  message?:string,
  userId?: number,
  user?: UserSchema,
  save(): unknown,
  destroy(): unknown
}

const Chat = sequelize.define('chat',{
  id:{
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false
  },
  message:{
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: "Please insert the message"
      }
    }
  }
}, {timestamps:true})

export default Chat