const express=require('express');
const http=require('http')
const path=require('path');
const socketio=require('socket.io');
const app=express();
var cors = require('cors')
app.use(cors())
const server=http.createServer(app);
const io=socketio(server).listen(server);
const { v4: uuidv4 }=require('uuid')
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const PORT=5000||process.env.PORT;
dotenv.config();
var rooms=[]
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
//     function newFact(){
//         console.log(rooms["room-"+roomno])
//        setTimeout(newFact,5*1000);
//    }

    
   //Increase roomno 2 clients are present in a room.
   if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 5) roomno=uuidv4();
   socket.join("room-"+roomno);
   socket.roomKey=roomno;
   
   
   function countDown(){

    if(rooms.length===0 || rooms["room-"+roomno].length===0)
    {
        console.log('Room Empty!!')
        return ;
    }

        if(rooms["room-"+roomno].timer===0){
            rooms["room-"+roomno].timer=60;
            rooms["room-"+roomno].round+=1;
            rooms["room-"+roomno].currentFact=Math.random().toString(36).substring(7);
            //extra added
            rooms["room-"+roomno].city=Math.random().toString(36).substring(7);
           
            console.log(rooms["room-"+roomno])
          //  io.sockets.in("room-"+roomno).emit("newFact",rooms["room-"+roomno].currentFact);
          io.sockets.in("room-"+roomno).emit('updates',rooms["room-"+roomno]);
        }
        if(rooms["room-"+roomno].round==4){
            //Declare the winner
        }
        rooms["room-"+roomno].timer-=1;
        
        setTimeout(countDown,1000);
   }
   if(!rooms["room-"+roomno]){
       rooms["room-"+roomno]={
           scores:[],
        //    users:[],
           currentFact:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur velit nisl, finibus vel pulvinar at, cursus id urna.",
           timer:60,
           city:Math.random().toString(36).substring(7),
           round:0
       };
    //    io.sockets.in("room-"+roomno).emit("newFact",rooms["room-"+roomno].currentFact);
    //    //Extra added
    //    io.sockets.in("room-"+roomno).emit('scores',rooms["room-"+roomno].scores);
     
    //    io.sockets.in("room-"+roomno).emit('roomCity',rooms["room-"+roomno].city);
    //    io.sockets.in("room-"+roomno).emit('roomRound',rooms["room-"+roomno].round);
    //    io.sockets.in("room-"+roomno).emit('roomTime',rooms["room-"+roomno].timer);

    io.sockets.in("room-"+roomno).emit('updates',rooms["room-"+roomno]);
       countDown();
       
    //    newFact();
   }
   else{
    io.sockets.in("room-"+roomno).emit('updates',rooms["room-"+roomno]);
    
        // io.sockets.in("room-"+roomno).emit('scores',rooms["room-"+roomno].scores);
        // io.sockets.in("room-"+roomno).emit("newFact",rooms["room-"+roomno].currentFact);
        // //Extra added
        // io.sockets.in("room-"+roomno).emit('roomCity',rooms["room-"+roomno].city);
        // io.sockets.in("room-"+roomno).emit('roomRound',rooms["room-"+roomno].round); 
        // io.sockets.in("room-"+roomno).emit('roomTime',rooms["room-"+roomno].timer);
         }
   
   //Send this event to everyone in the room.
//    rooms["room-"+roomno].user.push(socket.playerName)
   console.log(roomno)
   io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
    
    


    socket.on('setUsername', function(data) {
        console.log('ONe')
        console.log(data);
        socket.playerName=data.username;
        console.log(socket.playerName)
        // io.sockets.to("room-"+roomno).emit('joinMsg', {user: data.username});
        io.sockets.to("room-"+roomno).emit('userSet', {username: data.username});
        rooms["room-"+roomno].scores.push({name:data.username,score:0});
        io.sockets.in("room-"+roomno).emit('scores',rooms["room-"+roomno].scores);
        console.log(rooms)
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

    socket.on('mapclicked',(data)=>{

        console.log(socket.playerName+' Clicked on map',1000);
        
    })

    socket.on('disconnect',(data)=>{
        console.log('Disconnect fired!!')
    
      var x=socket.playerName;
        console.log('YOYOOYOYOYO')
        console.log(socket.playerName)
      const usersInRoom = rooms["room-"+socket.roomKey].scores.filter((item) => item.name !== socket.playerName);
      rooms["room-"+socket.roomKey].scores =usersInRoom;
  
      io.sockets.in("room-"+roomno).emit('scores',rooms["room-"+roomno].scores);



        const v="room-"+socket.roomKey;
        console.log('This is room Key')
        console.log(v)
        if(rooms["room-"+socket.roomKey].scores.length===0)
        {
            console.log('deletion complete!')
            delete rooms["room-"+socket.roomKey];
        }

        socket.disconnect();

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
