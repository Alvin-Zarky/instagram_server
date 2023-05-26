import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

const Save= sequelize.define('save', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false,
  },
  savePostUserId:{
    type: DataTypes.INTEGER,
    allowNull:false
  }
}, {timestamps:true})

export default Save