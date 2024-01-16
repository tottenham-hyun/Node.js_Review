const express = require('express')
const path = require('path')
const { default: mongoose } = require('mongoose')
const {User} = require('./models/users.model.js')
const passport = require('passport')
const cookieSession = require('cookie-session')
const { checkAuth, checkNotAuth } = require('./configure/auth.js')
const app = express()

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

app.get('/login',checkNotAuth,(req,res)=>{
    res.render('login')
})

app.get('/signup',checkNotAuth,(req,res)=>{
    res.render('signup')
})

app.post('/signup',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        return res.status(200).json({
            success : true
        })
    }
    catch(err){
        console.error(err)
    }
})

app.post('/login',(req,res,next)=>{
    passport.authenticate('local',(err,user,info)=>{
        
        if(err) return next(err)

        if(!user) return res.json({msg:info})

        req.logIn(user,function(err){
            if(err) return next(err)
            res.redirect('/')
        })
    })(req,res,next)
}) 

app.post('/logout',(req,res,next)=>{
    req.logOut((err)=>{
        if(err) return next(err)
        res.redirect('/login')
    })
})

app.get('/',checkAuth,(req,res)=>{
    res.render('index')
})

app.get('/auth/google', passport.authenticate('google'))
app.get('/auth/google/callback',passport.authenticate('google', {
    successReturnToOrRedirect : '/',
    failureRedirect : '/login'
}))

const config = require('config')
const serverConfig = config.get('server')
const port = serverConfig.port

app.listen(port,()=>{
    console.log('listen')
})