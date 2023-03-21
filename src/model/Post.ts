import sequelize from "../config/sequelize";
import { DataTypes } from "sequelize";

const Post= sequelize.define('post', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false,
  },
  text:{
    type: DataTypes.TEXT("long"),
    // allowNull:false,
  },
  media:{
    type: DataTypes.ARRAY(DataTypes.STRING),
    // allowNull:false
  },
  likes:{
    type: DataTypes.JSON,
    get:function(){
      return JSON.parse(this.getDataValue('likes'))
    },
    set:function(val){
      return this.setDataValue('likes', JSON.stringify(val))
    }
  },
  comments:{
    type: DataTypes.JSON,
    get:function(){
      return JSON.parse(this.getDataValue('comments'))
    },
    set:function(val){
      return this.setDataValue('comments', JSON.stringify(val))
    }
  },
  tags:{
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
}, {timestamps:true})

export default Post