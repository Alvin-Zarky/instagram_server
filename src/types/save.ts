import { User } from "./user"

export interface SaveValues{
  id?:number,
  savePostUserId?:number,
  userId?:number,
  postId?:number,
  createdAt?:Date,
  updatedAt?:Date,
  user?: User,
  save?:() => unknown,
  destroy?:() => unknown
}