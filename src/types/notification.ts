import { PostSchema } from "./post";
import { UserSchema } from "./user";

export interface NotificationSchema{
  id?:number,
  activity?:string,
  userId?:number,
  postId?:number,
  user?: UserSchema,
  post?: PostSchema,
  createdAt?:Date,
  updatedAt?:Date
}