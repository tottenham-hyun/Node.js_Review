const express = require('express')
const { checkAuth,checkNotAuth } = require('../configure/auth')
const mainRouter =  express.Router()

mainRouter.get('/',checkAuth,(req,res,next)=>{
    res.render('index')
})

mainRouter.get('/login',checkNotAuth,(req,res)=>{
    res.render('login')
})

mainRouter.get('/signup',checkNotAuth,(req,res)=>{
    res.render('signup')
})

module.exports = mainRouter