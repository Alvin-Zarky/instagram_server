import { Sequelize } from "sequelize";
import { config } from "dotenv";

config()
const sequelize= new Sequelize(`${process.env.DATABASE}`, `${process.env.ROOT}`, `${process.env.PASSWORD}`, {
  host: `${process.env.HOST}`,
  dialect: 'postgres',
  logging:false,
  pool:{
    max: 10,
    min:0,
    acquire:30000,
    idle: 10000,
  }
})

export default sequelize