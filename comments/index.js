const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments',(req,res) => {
    commentsByPostId && console.log(commentsByPostId)
    res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments',async(req,res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body
    console.log(content)
    const comments = commentsByPostId[req.params.id] || []
    comments.push({id:commentId,content})
    commentsByPostId[req.params.id] = comments

    // send event to event-broker
    await axios.post('http://localhost:4005/events',{
        type:'CommentCreated',
        data:{
            id:commentId,
            content,
            postId:req.params.id
        }
    })

    // receiving an event from the event bus - Post request handler 
    app.post('/events',(req,res) => {
        console.log('COMMENTS: Received Event',req.body.type)
        console.log(req.body)
        res.send({})
    })

    res.status(201).send(comments)
})

app.listen(4001,()=> console.log('listen on port 4001') )