const passport = require('passport')
const { User } = require('../models/users.model')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
require('dotenv').config()
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
const LocalStrategyConfig = new LocalStrategy({usernameField:'email', passwordField:'password'},
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
passport.use('local',LocalStrategyConfig)

// 구글 전략
const googleClientID = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const googleStrategyConfig = new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile']
},(accessToken, refreshToken, profile, done)=>{
    User.findOne({
        googleId: profile.id
    })
    .then((existingUser)=>{
        if(existingUser){
            return done(null,existingUser)
        }
        else{
            const user = new User()
            user.email = profile.emails[0].value
            user.googleId = profile.id

            user.save().then(()=>{
                done(null,user)
            })
            .catch(err =>{
                console.log(err)
                return done(err)
            })
        }
    })
    .catch((err)=>{
        if(err) return done(err)
    })
})

passport.use('google',googleStrategyConfig)