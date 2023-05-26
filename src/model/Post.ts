import sequelize from "../config/sequelize";
import { DataTypes, UUIDV4 } from "sequelize";

const Post= sequelize.define('post', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false,
  },
  postId:{
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  text:{
    type: DataTypes.TEXT,
    // allowNull:false,
  },
  media:{
    type: DataTypes.ARRAY(DataTypes.STRING),
    // allowNull:false
  },
  mediaDetail:{
    type: DataTypes.JSON,
    get:function(){
      return JSON.parse(this.getDataValue('mediaDetail'))
    },
    set:function(val){
      return this.setDataValue('mediaDetail', JSON.stringify(val))  
    },
    defaultValue:[]
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
  saveBy:{
    type: DataTypes.JSON,
    get:function(){
      return JSON.parse(this.getDataValue('saveBy'))
    },
    set:function(val){
      return this.setDataValue('saveBy', JSON.stringify(val))  
    },
    defaultValue:[]
  },
  tags:{
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
}, {timestamps:true})

export default Post