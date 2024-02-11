const express = require('express')
const passport = require('passport')
const sendMail = require('../mail/mail')
const usersRouter = express.Router()

usersRouter.post('/login',(req,res,next)=>{
    passport.authenticate('local',(err,user,info)=>{
        
        if(err) return next(err)

        if(!user) return res.json({msg:info})

        req.logIn(user,function(err){
            if(err) return next(err)
            res.redirect('/')
        })
    })(req,res,next)
}) 

usersRouter.post('/signup',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendMail('hwk3988@gmail.com', 'Steve', 'welcome')
        res.redirect('/login')
    }
    catch(err){
        console.error(err)
    }
})

usersRouter.post('/logout',(req,res,next)=>{
    req.logOut((err)=>{
        if(err) return next(err)
        res.redirect('/login')
    })
})

usersRouter.get('/google', passport.authenticate('google'))
usersRouter.get('/google/callback',passport.authenticate('google', {
    successReturnToOrRedirect : '/',
    failureRedirect : '/login'
}))

usersRouter.get('/kakao',passport.authenticate('kakao'))
usersRouter.get('/kakao/callback',passport.authenticate('kakao', {
    successReturnToOrRedirect : '/',
    failureRedirect : '/login'
}))

module.exports = usersRouter