import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import Notification from "../model/Notification";
import { DataTypes, Op } from "sequelize";
import ResponseError from "../utility/customError";
import User from "../model/User";
import Post from "../model/Post";
import { PostSchema } from "../types/post";
import { NotificationSchema } from "../types/notification";

const getAllNotification: RequestHandler = expressAsyncHandler(async(req, res, next) =>{

  const postQuery= await Post.findAll({ where: { userId: req.user.id } }) as PostSchema[]
  if(postQuery.length === 0){
    throw new ResponseError("Post not found", 404)
  }

  const startDate= new Date()
  startDate.setMonth(startDate.getMonth() - 1)
  const endDate= new Date()

  const notificationQuery = await Notification.findAll({
    where:{
      userId: { [Op.not]: req.user.id },
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model:User,
        attributes: ["id","uid","name","email","photo", "isHideLike"]
      },
      {
        model: Post,
      }
    ],
    order: [["createdAt", "DESC"]]
  }) as NotificationSchema[]

  if(notificationQuery.length === 0){
    throw new ResponseError("Notifcation activities not found", 404)
  }
  
  let arr:any[] = []
  
  // notificationQuery.forEach((notification) =>{
  //   postQuery.forEach((post) =>{
  //     if(notification.post?.userId === post.userId){
  //       // const today = new Date(notification.createdAt!)
  //       // const yesterday= new Date(+today - 86400000)

  //       // const monthly= new Date(notification.createdAt!).getMonth()
  //       // const month = new Date().getMonth()

  //       // const oneWeek= 24 * 60 * 60 * 1000 * 7
  //       // const dataToday = new Date(notification.createdAt!).getDate()
  //       // const week= new Date(notification.createdAt!)
  //       // const forToday= new Date().getDate()

  //       // week.setDate(week.getDate() +7)
  //       // const oneWeekTimestamp= week.getTime()

  //       // if(dataToday === forToday){
  //       //   dataObj.today.push(notification)
  //       // }
  //       // else if(yesterday < today){
  //       //   dataObj.thisWeek.push(notification)
  //       // }else{
  //       //   return []
  //       // }
  //       arr.add(notification)

  //       // console.log(oneWeekTimestamp)
  //       // console.log(oneWeek)
  //       // if(dataToday + 7 > oneWeek){
  //       //   dataObj.thisMonth.push(notification)
  //       // }

  //       // if(yesterday + 7 === today){
  //       //   dataObj.thisWeek.push(notification)
  //       // }
  //       // if(yesterday + 30 === today){
  //       //   dataObj.thisMonth.push(notification)
  //       // }
  //       // arr.push(notification)

  //     }else{
  //       // return {
  //       //   today:[]
  //       // }
  //       return []
  //     }
  //   })
  // })
  notificationQuery.forEach((notifcation) =>{
    postQuery.forEach((post) =>{
      if(notifcation.post?.userId === post.userId){
        if(!arr.includes(notifcation)){
          arr.push(notifcation)
        }
      }else{
        return []
      }
    })
  })
  if(arr.length === 0){
    throw new ResponseError("No activities notification", 404)
  }
  
  res.status(200).json({
    success:true,
    data: arr
  })

})

export{
  getAllNotification,
}