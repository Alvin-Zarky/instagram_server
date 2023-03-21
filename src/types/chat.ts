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