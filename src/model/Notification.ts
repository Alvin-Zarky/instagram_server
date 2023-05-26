import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

const Notification = sequelize.define('notification', {
  id:{
    type: DataTypes.INTEGER,
    allowNull:false,
    autoIncrement:true,
    primaryKey:true,
  },
  activity:{
    type: DataTypes.STRING,
    allowNull:false
  }
}, {timestamps:true})

export default Notification