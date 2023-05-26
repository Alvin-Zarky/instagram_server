export interface UserSchema{
  id?: number,
  uid?:string | number,
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
  resetPasswordToken?:string | null,
  resetPasswordExpired?: Date | number | null,
  photoDetail?: {
    public_id?: string,
    delete_by_token?:string
  },
  isHideLike?:boolean,
  isVerified?:boolean,
  verifiedToken?:string | null, 
  verifiedExpired?:Date | null | number,
  save(): unknown,
  destroy():unknown
}

export interface User{
  id?:number,
  name?:string,
  email?:string,
  comment?:string
}

export interface OptionMailer{
  email?: string,
  subject?: string,
  message?: string,
  html?: string
}

export interface VerifiedValue{
  id?:number,
  name?:string,
  email?:string,
  isVerified?:boolean,
  code?:string | null,
  codeExpired?:Date | null,
  createdAt?:Date,
  updatedAt?:Date,
  save:() => unknown,
  destroy:() => unknown
}