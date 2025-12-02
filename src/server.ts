import http from 'http';
import { Server } from 'socket.io'
import app from "./app";

const PORT = process.env.PORT||5000;

// Create HTTP Server
const server = http.createServer(app);

// Create Socket.IO Server
export const io = new Server(server, {
    pingTimeout: 600000,
    cors: {
        origin: '*'
    }
})
// Socket.IO Event
io.on('connection', (socket) => {
    console.log('User connected', (socket.id));

    // Join Personal Room
    socket.on('setup', (userId)=>{
        socket.join(userId);
        socket.emit('Connected')
    });
    // Join Chat Room
    socket.on('Join Chat', (userId) => {
        socket.join(userId);
    });
    // New Message Event
    socket.on('New Message', (message)=>{
        const chat = message.chat;
        if(!chat?.users) return ;
        // Send Message to everyone except sender
        chat.users.forEach((user: any) => {
            if(user.toString() === message.sender._id.toString())return;
            socket.in(user.toString()).emit('message recieved', message);
        });
        // Show who is typing
        socket.on('Typing', (chatId) => socket.in(chatId).emit('Typing'))

        socket.on('Disconect', () => {
            console.log('User Disconnected:', socket.id);
        })
    })
})

// Start Server
server.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})