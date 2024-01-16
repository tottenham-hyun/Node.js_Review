const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email : {
        type: String,
        unique: true
    },
    password : {
        type: String,
        minLength: 5
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    }
})

userSchema.methods.comparePassword = function(plainpassword,cb){
    // plain : client, this.password => db에 있는 비번
    if(plainpassword === this.password){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
    return cb({error:'error'})
}

const User = mongoose.model('User',userSchema)
module.exports = {User}