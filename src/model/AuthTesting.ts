import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

const AuthTesting = sequelize.define('auth-testing', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false
  },
  name:{
    type: DataTypes.STRING,
    unique:true,
    allowNull:false,
  },
  email:{
    type: DataTypes.STRING,
    unique:true,
    allowNull:false,
    validate:{
      notNull:{
        msg: 'Please input the email'
      },
      isEmail:{
        msg: "Email invalid"
      }
    }
  },
  isVerified:{
    type:DataTypes.BOOLEAN,
    defaultValue:false,
    allowNull:false,
  },
  code:{
    type: DataTypes.STRING,
  },
  codeExpired:{
    type: DataTypes.DATE,
  }
}, {timestamps:true})

export default AuthTesting