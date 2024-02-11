const express = require('express')
const app = express()
const path = require('path')

const http = require('http')
const {Server} = require('socket.io')
const server = http.createServer(app)
const io = new Server(server)
const port = 4000

io.on('connection',(socket)=>{
    console.log('socket',socket.id)

    socket.on('join',()=>{})
    socket.on('sendMessage',()=>{})
    socket.on('disconnect',()=>{})
})


const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))
console.log(publicDirectoryPath)
server.listen(port, ()=>{
    console.log('server listen')
})