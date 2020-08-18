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




const { MongoClient } = require("mongodb");

// Replace the uri string with your MongoDB deployment's connection string.
const uri ="mongodb+srv://test123:test123@cguesscluster.xmwhw.mongodb.net/CguessDB?retryWrites=true&w=majority";

const client = new MongoClient(uri,{useNewUrlParser: true, useUnifiedTopology: true});
var dbdata=''



async function run() {
    try {
      await client.connect();
  
      const database = client.db('CguessDB');
      const collection = database.collection('Cities');
  
      // // Query for a movie that has the title 'Back to the Future'
      const query = { name: 'New York' };
       const city = await collection.find().toArray();
       dbdata=city;
  
      console.log(dbdata[5]['name']);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir).then(()=>
  {
    


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
        try
        {

        if(rooms["room-"+roomno]){if(rooms["room-"+roomno].scores.length===0)
        {
            console.log('Room Empty!!')
        }}
            try{
            
            if(rooms["room-"+roomno].timer===0){
                rooms["room-"+roomno].timer=5;
                rooms["room-"+roomno].round+=1;
                if(rooms["room-"+roomno].round==5){
                    io.sockets.in("room-"+roomno).emit('showresults',true);
                    return;
                }

                var randIndex=parseInt(Number(Math.random()*(dbdata.length-1)),10)
                while(rooms["room-"+roomno].factIndex.includes(randIndex))
                {
                    randIndex=parseInt(Number(Math.random()*(dbdata.length-1)),10)
                }
                console.log('INDEX IS'+randIndex)
                console.log(dbdata[randIndex]['name']);
                rooms["room-"+roomno].factIndex.push(randIndex)
                rooms["room-"+roomno].currentFact=dbdata[randIndex]['img'][0]
                //extra added
                rooms["room-"+roomno].city=dbdata[randIndex]['name']

                
               
                console.log(rooms["room-"+roomno])
            //  io.sockets.in("room-"+roomno).emit("newFact",rooms["room-"+roomno].currentFact);
            io.sockets.in("room-"+roomno).emit('updates',rooms["room-"+roomno]);
            }
            
            rooms["room-"+roomno].timer-=1;
        }
        catch(err){
            console.log("ERRRRRRRR")
            console.log(err)
            return;
        }
            setTimeout(countDown,1000);
        }
        catch(err)
        {
            return;
        }
    }
    if(!rooms["room-"+roomno]){
       rooms["room-"+roomno]={
           scores:[],
           markers:[],
        //    users:[],
           currentFact:"Waiting For players to join the room!",
           timer:5,
           city:Math.random().toString(36).substring(7),
           round:0,
           factIndex:[]
        };

        io.sockets.in("room-"+roomno).emit('updates',rooms["room-"+roomno]);
        countDown();
    }
    else{
        io.sockets.in("room-"+roomno).emit('updates',rooms["room-"+roomno]);
    }
   
   //Send this event to everyone in the room.

    io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
    
    

    socket.on('setUsername', function(data) {
        socket.playerName=data.username;
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
        const marks=[...rooms["room-"+roomno].markers]
        if(marks.length===0)
            rooms["room-"+roomno].markers.push(data);
        else{
            var flag=0
            marks.forEach(element => {
                if(element.username===data.username){
                    element.location=data.location;
                    flag=1;
                }
            });
            if(flag===0){
                rooms["room-"+roomno].markers.push(data);
            }
            else{
                rooms["room-"+roomno].markers=marks;
            }
        }
        io.sockets.in("room-"+roomno).emit('markers',rooms["room-"+roomno].markers);
        console.log(socket.playerName+' Clicked on map '+data.location.lat +"  "+data.location.lng);

        
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
  }
);

server.listen(PORT,()=>console.log(`Running on port: ${PORT}`));
