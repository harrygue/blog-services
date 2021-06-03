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
    
    // added status for moderation service
    comments.push({id:commentId,content,status:'pending'})
    commentsByPostId[req.params.id] = comments

    // send event to event-broker
    await axios.post('http://event-bus-srv:4005/events',{
        type:'CommentCreated',
        data:{
            id:commentId,
            content,
            postId:req.params.id,
            status:'pending'
        }
    })

    // receiving an event from the event bus - Post request handler 
    app.post('/events',async(req,res) => {
        console.log('COMMENTS: Received Event',req.body.type)
        console.log(req.body)

        const {type,data} = req.body

        // receive moderated comment and update comments array of pertaining post
        if(type === 'CommentModerated'){
            const {postId,id,status,content} = data;
            const comments = commentsByPostId[postId]
            const comment = comments.find(comment => {
                return comment.id === id
            })
            comment.status = status

            await axios.post('http://event-bus-srv:4005/events',{
                type:'CommentUpdated',
                data:{id,status,postId,content}
            })
        }

        res.send({})
    })

    res.status(201).send(comments)
})

app.listen(4001,()=> console.log('COMMENTS listen on port 4001') )