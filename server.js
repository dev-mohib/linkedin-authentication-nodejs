const express = require('express')
const app = express()
const router = express.Router()
const error_handler = require('./_helpers/error-handler')
const fetch = require('node-fetch')
const config = require('./_helpers/LinkedIn-config.json')
app.use(error_handler)

//CORS 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') //* => You can specify allowed URLs to access
    res.header('Access-Control-Allow-Headers', '*')
    if(req.method === 'OPTIONS') {
        req.header('Access-Control-Allow-Methods' , 'GET, POST')
        return res.status(200).json({})
    }
    next()
})

app.get('/', (req, res) => {
    res.status(200).send({
        status : "Success",
        message : "Welcome This server will listen LinkedIn Authentication services" 
    })
})
app.get('/authUser/:code', authUser)
app.get('/getProfile/:token', getProfile)
// app.get('/getProfile/:code', getProfile)

//Controllers
async function authUser(req, res, next){
    const emailURL = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))"
    const fetchURL = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${req.params.code}&redirect_uri=${config.redirectUrl}&client_id=${config.client_id}&client_secret=${config.client_secret}`

fetch(fetchURL, {
        method: 'post',
    })
    .then(res => res.json())
    .then(json => {
        if(json.access_token)
            {
                fetch(emailURL, {
                    method: 'get',
                    headers : {
                        Authorization : "Bearer " + json.access_token
                    }
                })
                .then(res => res.json())
                .then(email => {
                    console.log(email.elements[0]['handle~'].emailAddress)
                    return res.status(200).send({
                        success : true,
                        emailAddress :email.elements[0]['handle~'].emailAddress
                     })
               })
               .catch(err => res.status(500).send({success : false}))
            }
            else
                return res.status(400).send({success : false})   
    })
}
function getProfile (req, res, next) {
    const fetchURL = ""
    fetch(fetchURL, {
        method: 'get'
    })
    .then(res => res.json())
    .then(json => {
        if(json.access_token)
        {  
            return res.status(200).send("Succefully Authenticated")
        }
        else
        return res.status(400).send(json)   
    })
}

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port,  () => {
    console.log('LinkedIn Started on port ' + port);
});