const express=require('express')
const cors=require('cors')
const auth=require('./routes/auth')
const dotenv=require('dotenv')
const axios=require('axios')
const coins=require('./routes/coin')

const saveData=require('./utils/cronjob')
const {connectToDatabase}=require('./database/db')


const {createServer}=require('http')
//const {join}=require('node:path')
const {Server, Socket}=require('socket.io')


dotenv.config()
const port=process.env.PORT
const app=express()

const server= createServer(app)
const io = new Server(server)
//const socket = io.connect('http://localhost:5000');

app.use(express.json())
app.use(cors())


app.use('/api/users',auth)
app.use('/api/coin',coins)


io.on('connection',(socket)=>{
console.log('user connected ')
 socket.on('disconnect',()=>{
console.log('user disconnected')
    })
})



saveData()
connectToDatabase()
app.listen((port),console.log(`server is http://localhost:${port}`))