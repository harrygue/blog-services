const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

// Syncing events
const events = [];

app.post('/events',(req,res) => {
    const event = req.body
    console.log(event)

    events.push(event)

    // send event to posts
    axios.post('http://posts-clusterip-srv:4000/events',event)
    .catch(err => {
        console.log('SEND TO POSTS: ',err.message)
    })

    // send event to comments
    axios.post('http://comments-clusterip-srv:4001/events',event)
    .catch(err => console.log('SEND TO COMMENTS: ',err.message))
 
    // // send to query
    axios.post('http://query-clusterip-srv:4002/events',event)
    .catch(err => console.log('SEND TO QUERY: ',err.message))
 
    // // send to moderation
    axios.post('http://moderation-clusterip-srv:4003/events',event)
    .catch(err => console.log('SEND TO MODERATION: ',err.message))

    res.send({status:'OK'})
})

// for syncing events:
app.get('/events',(req,res) => {
    res.send(events)
})

app.listen(4005,() => console.log('EVENT-BUS listen to 4005'))