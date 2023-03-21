import { User } from "./user";

export interface PostSchema{
  id?:number,
  userId?:number,
  text?:string,
  media?:string[],
  likes?: User[],
  comments?: User[],
  tags?:string[],
  createdAt?:Date,
  updatedAt?:Date,
  save():unknown,
  destroy():unknown
}