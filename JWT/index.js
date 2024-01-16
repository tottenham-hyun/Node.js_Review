const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 4000;
const jwt = require('jsonwebtoken');
const secretText = 'superSecret'
const refreshToken = 'supersuperSecret'

const posts = [
    {
        username : 'John',
        title : 'Post 1'
    },
    {
        username : 'Han',
        title : 'Post 2'
    }
]

app.use(express.json());
app.use(cookieParser());

let refreshTokens = []
app.post('/login',(req,res)=>{
    const username = req.body.username;
    const user = {name: username}

    // jwt를 이용하여 토큰 생성하기 payload + secretText
    // accessToken은 유효시간 짧게
    // 유효기간 추가
    const accessToken = jwt.sign(user,secretText,{expiresIn:'30s'})

    // refreshToken은 그보다 길게
    const refreshToken = jwt.sign(user,secretText,{expiresIn:'1d'})
    refreshTokens.push(refreshToken)

    // refreshToken은 쿠키에 저장하지만 주로 httpOnly 옵션을 줘서 js를 이용해 조작X (XSS 공격)
    res.cookie('jwt',refreshToken,{
        httpOnly: true,
        maxAge: 24*60*60*1000
    })
    res.send({accessToken: accessToken})
})

app.get('/posts',authMiddleware,(req,res)=>{
    res.json(posts)
})

app.get('/refresh',(req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(403)

    const refreshToken = cookies.jwt;
    if(!refreshTokens.includes(refreshToken)){
        return res.sendStatus(403)
    }
    // token이 유효한 토큰인지 확인
    jwt.verify(refreshToken,refreshSecretText,(err,user)=>{
        if(err) return res.sendStatus(403)
        // accessToken 생성
        const accessToken = jwt.sign({name:user.name},
            secretText,
            {expiresIn: '30s'}
            )
        res.json({accessToken})
    }) 
})

app.listen(PORT,()=>{
    console.log('listening on port' + PORT);
})

function authMiddleware(req,res,next){
    // 토큰을 request headers에서 가져오기
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]
    if(token === null) return res.status(401)

    // 토큰이 유효한 토큰인지 확인
    jwt.verify(token,secretText,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user = user;
        next()
    })
}