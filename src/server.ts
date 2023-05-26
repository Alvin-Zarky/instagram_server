import express, {
  Application,
  Request,
  Response,
  NextFunction,
  urlencoded,
} from "express";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import colors from "colors";
import sequelize from "./config/sequelize";
import userRoute from "./router/userRoute";
import errorMiddleware from "./middleware/errorMessageMiddleware";
import User from "./model/User";
import Post from "./model/Post";
import postRoute from "./router/postRoute";
import Chat from "./model/Chat";
import { Server } from "socket.io";
import webSocketIo from "./config/webSocketIo";
import chatRoute from "./router/chatRoute"
import saveRoute from "./router/saveRoute"
import messageRoute from "./router/messageRoute"
import Save from "./model/Save";
import Message from "./model/Message";
import Notification from "./model/Notification";
import { DataTypes, Sequelize } from "sequelize";
import notificationRoute from "./router/notificationRoute"
import AuthTesting from "./model/AuthTesting";

config();
const PORT = process.env.PORT || 8000;
const app: Application = express();

app.use(morgan("dev"));
// app.use(express.json({limit:'150mb'}));
app.use(express.json({limit: '50mb'}))
app.use(urlencoded({ extended: false }));
app.use(cors());

app.use("/api/instagram/clone/user", userRoute);
app.use("/api/instagram/clone/post", postRoute);
app.use("/api/instagram/clone/chat", chatRoute)
app.use("/api/instagram/clone/message", messageRoute)
app.use("/api/instagram/clone/notification", notificationRoute)

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  res
    .status(404)
    .send(`Cloud not be found with this url site~ ${req.originalUrl}`);
});

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(errorMiddleware);

Post.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
Chat.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

Save.belongsTo(Post, { constraints: true, onDelete: "CASCADE" })
Save.belongsTo(User, { constraints: true, onDelete: "CASCADE" })
Post.belongsToMany(User, { through: { model: Save, unique:false } })

Message.belongsTo(User, { foreignKey: 'uSendText', as:'uUser', constraints:true, onDelete: "CASCADE" });
Message.belongsTo(User, { foreignKey: 'uRecieveText', as: 'user', constraints:true, onDelete: "CASCADE" });

Notification.belongsTo(User, { constraints:true, onDelete: "CASCADE" })
Notification.belongsTo(Post, {constraints:true, onDelete:"CASCADE"})
// User.sync({force:true})
// Post.sync({alter:true})
// Message.sync({alter:true})
// Notification.sync({alter:true, force:true})
// AuthTesting.sync({alter:true})
sequelize
  .sync({ alter: true})
  .then((url) => {
    console.log(
      colors.green.bold.underline.inverse(
        `Connection Successfully-${url.config.host}-${url.config.database}-${url.config.host}-${url.config.port}`
      )
    );
  })
  .catch((err: any) => {
    console.error(
      colors.red.underline.bold(`Connection Error: ${err.message}`)
    );
  });

const server = app.listen(PORT, () => {
  console.log(
    colors.bgCyan.inverse.bold(
      `Server in ${process.env.NODE_ENV} is running on port ${PORT}`
    )
  );
});

const io: Server = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  }
});
webSocketIo(io);

process.on("unhandledRejection", (err: any, promise) => {
  server.close(() => process.exit(1));
  console.error(colors.bgRed.inverse(`Server handler error ${err.message}`));
});

export { io, server };
