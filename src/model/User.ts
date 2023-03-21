import sequelize from "../config/sequelize";
import { DataTypes } from "sequelize";

const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false
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
  photo:{
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Please insert the image'
      }
    },
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
  }
}, {timestamps:true})

export default User