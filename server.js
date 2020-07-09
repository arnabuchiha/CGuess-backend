const express=require('express');
const http=require('http')
const path=require('path');
const socketio=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketio(server);

const PORT=4000||process.env.PORT;

app.use(express.static(path.join(__dirname,'public')))

// io.on('connection', function(socket) {
//     console.log('A user connected');
//     socket.emit('FromAPI',{data:"asdas"})
//     //Whenever someone disconnects this piece of code executed
//     socket.on('disconnect', function () {
//        console.log('A user disconnected');
//     });
//  });
users = [];
io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('setUsername', function(data) {
      if(users.indexOf(data) == -1) {
         users.push(data);
         socket.emit('userSet', {username: data});
      } else {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      }
      console.log(users)
   })
});
server.listen(PORT,()=>console.log(`Running on port: ${PORT}`));
