import colors from "colors"
import { Server, Socket } from "socket.io";

const webSocketIo = (io:Server) =>{

  io.on("connection", (socket:Socket) => {
    console.log(
      colors.green.bold.underline(`Connection Successfully ${socket.id}`)
    );
    socket.on("disconnect", () => {
      console.log(colors.red.bold.underline(`Disconnected ${socket.id}`));
    });

    socket.on("message", (data:any) => {
      socket.broadcast.emit("message-receiver", data)
    });

    socket.emit("mine", socket.id)
    
    socket.on("callUser", (data) =>{
      io.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name
      })
    })

    socket.on("answerCall", (data) =>{
      io.to(data.to).emit("callAccept", data.signal)
    })
    
  });

}

export default webSocketIo