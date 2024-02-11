const express = require('express')
const path = require('path')
const { default: mongoose } = require('mongoose')
const {User} = require('./models/users.model.js')
const passport = require('passport')
const cookieSession = require('cookie-session')
const app = express()

const config = require('config')
const mainRouter = require('./Routes/main.router.js')
const usersRouter = require('./Routes/users.router.js')
const serverConfig = config.get('server')
const port = serverConfig.port

require('./configure/passport')
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/static', express.static(path.join(__dirname,'public')))
app.use(cookieSession({
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
}))
// register regenerate & save after the cookieSession middleware initialization
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})
app.use(passport.initialize())
app.use(passport.session())
app.use('/',mainRouter)
app.use('/auth',usersRouter)

// view engine setup
app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs')

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('mongodb connected')
    })
    .catch((err)=>{
        console.log(err)
    })






app.listen(port,()=>{
    console.log('listen')
})