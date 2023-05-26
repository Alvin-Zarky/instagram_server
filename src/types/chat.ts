import { UserSchema } from "./user";

export interface ChatSchema{
  dataValues: any;
  id?: number,
  message?:string,
  userId?: number,
  user?: UserSchema,
  save(): unknown,
  destroy(): unknown
}

export interface MessageProperties{
  id?:number,
  uid?:string,
  text?:any,
  uSendText?:string,
  uRecieveText?:string,
  createdAt?:Date,
  updatedAt?:Date,
  uUser?:UserProperties,
  user: UserProperties
}

export interface UserProperties{
  id:number,
  uid:string,
  name: string,
  email: string,
  photo:string,
}