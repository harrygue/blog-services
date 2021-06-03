const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const {randomBytes} = require('crypto')
const cors = require('cors')
const axios = require('axios')


app.use(bodyParser.json())
app.use(cors())

const posts = {}

app.get('/posts',(req,res)=>{
    posts && console.log(posts)
    res.send(posts)

})

app.post('/posts/create',async(req,res)=>{
    const id = randomBytes(4).toString('hex')
    const { title } = req.body

    posts[id] = {
        id,title
    }

    // send event to the event-broker
    await axios.post('http://event-bus-srv:4005/events',{
        type:'PostCreated',
        data:{ id,title}
    })

    // receiving an event from the event bus - Post request handler 
    app.post('/events',(req,res) => {
        console.log('POSTS: Received Event',req.body.type)
        res.send({})
    })

    res.status(201).send(posts[id])
})  

app.listen(4000, () => {
    console.log('kubectl deployment test modified !!!!')
    console.log('POSTS Listening on port 4000')
})