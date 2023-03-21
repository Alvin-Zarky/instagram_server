export interface UserSchema{
  id?: number,
  name?:string,
  email?:string,
  password?:string,
  photo?:string,
  role?:string,
  posts?:number,
  follower?:number,
  following?:number,
  bio?:string,
  links?:string,
  isAdmin?:boolean,
  isActive?:boolean,
  createdAt?:Date,
  updatedAt?:Date,
  save(): unknown,
  destroy():unknown
}

export interface User{
  id?:number,
  name?:string,
  email?:string,
  comment?:string
}