import { RequestHandler, raw } from "express";
import expressAsyncHandler from "express-async-handler";
import ResponseError from "../utility/customError";
import Message from "../model/Message";
import User from "../model/User";
import sequelize from "../config/sequelize";
import { Op, QueryTypes } from "sequelize";
import { UserSchema } from "../types/user";
import { userObjects } from "../helper/userObjectResult";
import { io } from "../server";
import { MessageProperties, ChatUserMessage } from "../types/chat";

const attributes=["id","uid","name","email","photo","isHideLike"]
const checkUserUid = async (uid: string): Promise<UserSchema> => {
  const user = (await User.findOne({
    where: { uid },
    raw: true,
  })) as UserSchema;
  if (!user) {
    throw new ResponseError("User uid not found", 404);
  }

  return user;
};

const postUserMessage: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { text } = req.body;

    if (!text) {
      throw new ResponseError("Please enter the text message", 400);
    }

    const user = await checkUserUid(req.params.uid);

    const values = {
      text,
      uRecieveText: user.id,
      uSendText: req.user.id,
    };
    const message = await Message.create(values);

    const data = {
      ...message.dataValues,
      uid: user.uid,
      text: JSON.parse(message.getDataValue("text")),
    };
    io.emit("message", data);

    res.status(201).json({
      success: true,
      data,
    });
  }
);

const getUserMessage: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const user = (await User.findOne({
      where: { uid: req.params.uid },
      raw: true,
    })) as UserSchema;
    if (!user) {
      throw new ResponseError("User uid not found", 404);
    }

    const message = await Message.findAll({
      where: {
        [Op.or]: [
          { uSendText: req.user.id, uRecieveText: user.id },
          { uSendText: user.id, uRecieveText: req.user.id },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          foreignKey: "uSendText",
          as: "uUser",
          attributes
        },
        {
          model: User,
          foreignKey: "uRecieveText",
          as: "user",
          attributes
        },
      ],
    });

    const data = message.map((val) => {
      return {
        ...val.dataValues,
        text: JSON.parse(val.getDataValue("text")),
      };
    });

    // if (message.length === 0) {
    //   throw new ResponseError("Message not found", 404);
    // }

    res.status(200).json({
      success: true,
      data,
    });
  }
);

const deleteUserMessageText: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const { uid, id } = req.params;

    const user = (await User.findOne({
      where: { uid },
      raw: true,
    })) as UserSchema;

    if (!user) {
      throw new ResponseError("User uid not found", 404);
    }

    // const message = (await Message.findOne({
    //   where: { uRecieveText: user.id, id },
      // include: [
      //   {
      //     model: User,
      //     foreignKey: "uSendText",
      //     as: "uUser",
      //     attributes
      //   },
      //   {
      //     model: User,
      //     foreignKey: "uRecieveText",
      //     as: "user",
      //     attributes
      //   },
      // ],
    // }));
    const userMessage= await Message.findOne({
      where: { uRecieveText: user.id, id },
      include: [
        {
          model: User,
          foreignKey: "uSendText",
          as: "uUser",
          attributes
        },
        {
          model: User,
          foreignKey: "uRecieveText",
          as: "user",
          attributes
        },
      ],
    }) as unknown as ChatUserMessage

    if (!userMessage) {
      throw new ResponseError("Message user not found", 404);
    }

    const value = {
      ...userMessage.dataValues,
      text: JSON.parse(JSON.stringify(userMessage.text))
      // text: JSON.parse(userMessage.getDataValue("text")),
    };
    io.emit("message", value);

    await userMessage.destroy()
    res.status(200).json({
      success: true,
      data: value,
    });
  }
);

const deleteAllUserMessage = expressAsyncHandler(async (req, res, next) => {
  const user = await checkUserUid(req.params.uid);
  const allChat = await Message.findAll({
    where: {
      [Op.or]: [
        { uSendText: req.user.id, uRecieveText: user.id },
        { uSendText: user.id, uRecieveText: req.user.id },
      ],
    },
  });
  // if (allChat.length === 0) {
  //   throw new ResponseError("All Chat has been deleted", 400);
  // }

  io.emit("message", allChat);
  allChat.forEach((val) => val.destroy());

  res.status(200).json({
    success: true,
    data: allChat,
  });
});

const getAllLastestMessage: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    let arr: any[] = [];

    const user = (await User.findAll({
      where: { id: { [Op.not]: req.user.id } },
      raw: true,
      nest: true,
      order: [["createdAt", "desc"]]
    })) as UserSchema[];
    if (user.length === 0) {
      throw new ResponseError("User not found", 404);
    }

    const allChatMessage = (await Message.findAll({
      include: [
        {
          model: User,
          foreignKey: "uSendText",
          as: "uUser",
          attributes
        },
        {
          model: User,
          foreignKey: "uRecieveText",
          as: "user",
          attributes
        },
      ],
      // order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    })) as unknown as MessageProperties[];

    if (allChatMessage.length === 0) {
      throw new ResponseError("All message not found", 404);
    }

    // allChatMessage.forEach((val) =>{
    //   if(val.)
    // })

    // for(let data of allChatMessage){
    //   const message = await Message.findAll({
    //     where:{
    //       [Op.or]:[
    //         { uSendText: req.user.id, uRecieveText: data.id },
    //         { uSendText: data.id, uRecieveText: req.user.id },
    //       ]
    //     },
    //     include: [
    //       { model: User, foreignKey: 'uSendText', as: 'uUser', attributes: ["id", "uid", "name", "email", "photo"] },
    //       { model: User, foreignKey: 'uRecieveText', as: 'user', attributes: ["id", "uid", "name", "email", "photo"] }
    //     ],
    //     order:[["createdAt", "DESC"]]
    //   })
    //   arr.push(message)
    // }
    
    const arrUser:any[] = []
    const arrMessage:any[] = []
    user.forEach((user) => {
      allChatMessage.forEach((message) => {
        // if(message.uSendText === req.user.id || message.uRecieveText === req.user.id){
          if (
          (message.uSendText === req.user.id &&
            message.uRecieveText === user.id) ||
          (message.uSendText === user.id &&
            message.uRecieveText === req.user.id)
        ) {
          if((message.uSendText === req.user.id &&
            message.uRecieveText === user.id)){
            }
            // else{
            //   console.log('other', message)
            // }
          // if((message.uSendText === req.user.id &&
          //   message.uRecieveText === user.id && (message.uSendText === user.id &&
          //   message.uRecieveText === req.user.id))){
          //     console.log(message)
          //   }
          // if(message.uSendText === user.id && message.uRecieveText === req.user.id){
          //   console.log('alone',message)
          // }
        // }  
        }
        
      });
    });

    res.status(200).json({
      success: true,
      data: allChatMessage,
    });
  }
);

export {
  postUserMessage,
  getUserMessage,
  deleteUserMessageText,
  deleteAllUserMessage,
  getAllLastestMessage,
};
