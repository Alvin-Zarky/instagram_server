import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

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