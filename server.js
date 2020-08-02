const express=require('express');
const http=require('http')
const path=require('path');
const socketio=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketio(server);
const { v4: uuidv4 }=require('uuid')
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const Room=require('./model');
const PORT=5000||process.env.PORT;
dotenv.config();
rooms={}
/**
 * Mongoose connection
 */
// mongoose.connect(process.env.DB_CONNECT,
//     {useNewUrlParser:true,
//     useUnifiedTopology:true},
//     ()=>console.log('Connected to db'))

/**
 * socket.io
 */
var roomno = uuidv4();
io.on('connection', function(socket) {
   
   //Increase roomno 2 clients are present in a room.
   if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 5) roomno=uuidv4();
   socket.join("room-"+roomno);

   //Send this event to everyone in the room.
   console.log(roomno)
   io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
  
    socket.on('setUsername', function(data) {
        console.log(data);
        io.sockets.to("room-"+roomno).emit('userSet', {username: data.username});
    });
    socket.on('msg', function(data) {
        //Send message to everyone
        console.log(data)
        io.sockets.to("room-"+roomno).emit('newmsg', data);
     })
    socket.on('ans',function(data){
        if(data.ans==50){
            io.sockets.to("room-"+roomno).emit('newscore',{
                username:data.username,
                score:50
            });
        }
        else{
            io.sockets.to("room-"+roomno).emit('newscore',{
                username:data.username,
                score:0 
            });
        }

    })

})
// io.on('connection', function(socket) {
//     Room.find().sort({ space:-1 }).limit(1)
//         .exec(function(err,results) {
//             console.log(results);
//     });

//    console.log('A user connected');

//    socket.on('setUsername', function(data) {
//       if(users.indexOf(data) == -1) {
//          users.push(data);
//          socket.emit('userSet', {username: data});
//       } else {
//          socket.emit('userExists', data + ' username is taken! Try some other username.');
//       }
//       console.log(users)
//    })
// });
server.listen(PORT,()=>console.log(`Running on port: ${PORT}`));
