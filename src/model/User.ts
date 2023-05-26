import sequelize from "../config/sequelize";
import { DataTypes } from "sequelize";

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false
  },
  uid:{
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4
  },
  name:{
    type: DataTypes.STRING,
    allowNull:false,
    unique:true,
    validate:{
      notNull:{
        msg: 'Please input the name'
      },
    }
  },
  email:{
    type: DataTypes.STRING,
    allowNull:false,
    unique:true,
    validate:{
      notNull:{
        msg: 'Please input the email'
      },
      isEmail:{
        msg: "Email invalid"
      }
    }
  },
  password:{
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Please input the password'
      },
    }
  },
  resetPasswordToken:DataTypes.STRING,
  resetPasswordExpired: DataTypes.DATE,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue:false
  },
  verifiedToken:DataTypes.STRING,
  verifiedExpired: DataTypes.DATE,
  photo:{
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Please insert the image'
      }
    },
  },
  photoDetail:{
    type: DataTypes.JSON,
    get:function(){
      return JSON.parse(this.getDataValue('photoDetail'))
    },
    set:function(value){
      return this.setDataValue('photoDetail', JSON.stringify(value))
    }
  },
  role:{
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Please input the user role'
      },
      isIn: {
        args: [['user','admin']],
        msg: "Please input the correct user role"
      }
    },
    defaultValue: 'user'
  },
  isAdmin:{
    type: DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue: false,
  },
  isActive:{
    type: DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue:true
  },
  bio:{
    type: DataTypes.STRING,
    defaultValue:''
  },
  links:{
    type: DataTypes.STRING,
    defaultValue:''
  },
  posts:{
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull:false
  },
  follower:{
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull:false,
  },
  following:{
    type: DataTypes.INTEGER,
    defaultValue:0,
    allowNull:false,
  },
  isHideLike:{
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull:false
  }
}, {timestamps:true})

export default User