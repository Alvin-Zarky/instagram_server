
class ResponseError extends Error{
  
  statusCode: number
  constructor(message: string, statusCode:number){
    super(message)
    this.statusCode= statusCode
  }

  static initialError(){
    return 'error';
  }
  
}

export default ResponseError