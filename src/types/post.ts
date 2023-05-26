import { User } from "./user";

export interface PostSchema{
  id?:number,
  userId?:number,
  text?:string,
  media?:string[],
  mediaDetail?: any[],
  likes?: User[],
  comments?: User[],
  tags?:string[],
  createdAt?:Date,
  updatedAt?:Date,
  saveBy?: User[],
  save():unknown,
  destroy():unknown
}

export interface UserLikePost{
  id?:number,
  name?: string,
  email?: string,
  photo?: string
}

export interface Pagination{
  next?: { page: number },
  prev?:{ page:number }
}