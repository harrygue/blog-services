const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())

app.post('/events',(req,res) => {
    const event = req.body
    console.log(event)
    // send event to posts
    axios.post('http://localhost:4000/events',event)
    .catch(err => {
        console.log('SEND TO POSTS: ',err.message)
    })
    // send event to comments
    axios.post('http://localhost:4001/events',event)
    .catch(err => console.log('SEND TO COMMENTS: ',err.message))
    axios.post('http://localhost:4002/events',event)
    .catch(err => console.log('SEND TO QUERY: ',err.message))

    res.send({status:'OK'})
})

app.listen(4005,() => console.log('listen to 4005'))