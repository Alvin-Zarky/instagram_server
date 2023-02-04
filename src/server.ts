import express, {Application, Request, Response, NextFunction, urlencoded} from "express"
import {config} from "dotenv"
import morgan from "morgan"
import cors from "cors"
import colors from "colors"
import sequelize from "./config/sequelize"
import User from "./model/User"
import userRoute from "./router/userRoute"

config()
const PORT= process.env.PORT || 8000
const app: Application = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(urlencoded({extended:false}))

app.use('/api/instagram/clone/user', userRoute)

app.use('*', (req: Request, res:Response, next:NextFunction) =>{
  res.status(404).send(`Cloud not be found with this url site~ ${req.originalUrl}`)
})

sequelize.sync({alter:true}).then((url) =>{
  console.log(colors.green.bold.underline.inverse(`Connection Successfully-${url.config.host}-${url.config.database}-${url.config.host}-${url.config.port}`))
}).catch((err:any) =>{
  console.error(colors.red.underline.bold(`Connection Error: ${err.message}`))
})

const server= app.listen(PORT, () =>{
  console.log(colors.bgCyan.inverse.bold(`Server in ${process.env.NODE_ENV} is running on port ${PORT}`))
})

process.on('unhandledRejection', (err:any, promise) =>{
  server.close(() => process.exit(1))
  console.error(colors.bgRed.inverse(`Server handler error ${err.message}`))
})

