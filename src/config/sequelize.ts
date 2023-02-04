import { Sequelize } from "sequelize";
import { config } from "dotenv";

config()
const sequelize= new Sequelize(`${process.env.DATABASE}`, `${process.env.ROOT}`, `${process.env.PASSWORD}`, {
  host: `${process.env.HOST}`,
  dialect: 'postgres'
})

export default sequelize