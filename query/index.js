const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

app.use(bodyParser.json())
app.use(cors())

const posts = {}

const handleEvent = (data,type) => {
    if(type === 'PostCreated'){
        const {id,title} = data
        posts[id] = {id,title,comments:[]}
    }
    if(type === 'CommentCreated'){
        const {id,content,postId,status} = data 
        const post = posts[postId]
        post.comments.push({id,content,status})
    }

    // flow: commentCreated => event-bus => moderation => event-bus
    // => commentUpdated => event-bus => query
    if (type === 'CommentUpdated'){
        const {id,postId,content,status} = data
        const post = posts[postId]
        const comment = post.comments.find(comment => comment.id === id)
        comment.status = status
        comment.content = content
    }
}


app.get('/posts',(req,res) => {
    res.send(posts)
})

app.post('/events',(req,res) => {
    const {type,data} = req.body

    handleEvent(data,type)

    console.log(JSON.stringify(posts))
    res.send({})
})

app.listen(4002,async() => {
    console.log('QUERY listen to 4002')
    // sync query service if it comes back online
    const response = await axios.get('http://localhost:4005/events')

    // loop through events to check which ones where missed
    for (let event of response.data){
        console.log('Processing event: ',event.type)
        const {type,data} = event
        handleEvent(data,type)
    }
})