const passport = require('passport')
const { User } = require('../models/users.model')
const LocalStrategy = require('passport-local').Strategy

// req.login(user)
passport.serializeUser((user,done)=>{
    done(null, user.id)
})

// client -> session -> request
passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user =>{
        done(null,user)
    })
})

// 로컬방식
passport.use('local', new LocalStrategy({usernameField:'email', passwordField:'password'},
    (email,password,done)=>{
        User.findOne({email : email.toLocaleLowerCase()})
        .then(user =>{
            if(!user){
                return done(null,false,{msg:`Email ${email} not found`})
            }
            user.comparePassword(password,(err,isMatch)=>{
                if(err) return done(err)

                if(isMatch){
                    return done(null,user)
                }
                return done(null,false,{msg:"Invalid email or password"})
            })
        })
        .catch(err =>{
            if(err) return done(err)
        })
    })
)
