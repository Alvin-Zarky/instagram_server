import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/sequelize";
import User from "./User";

const Message= sequelize.define('message', {
  id:{
    type: DataTypes.INTEGER,
    allowNull:false,
    autoIncrement:true,
    primaryKey:true,
  },
  text:{
    type: DataTypes.JSON,
    get:function(){
      return JSON.parse(this.getDataValue('text'))
    },
    set:function(val){
      return this.setDataValue('text', JSON.stringify(val))
    }
  },
}, {timestamps:true})

export default Message
