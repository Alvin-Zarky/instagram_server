
declare global{
  namespace Express{
    interface Request{
      user: UserSchema
    }
  }
}
export interface Decoded{
  id: string  
}