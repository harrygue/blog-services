const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const axios = require('axios')

app.use(bodyParser.json())

app.post('/events',async(req,res) => {
    const {type,data} = req.body
    console.log('MODERATION: received from Event-bus: ',req.body)

    // check if comment content includes word 'orange' and send
    // moderated comment back to event bus
    if (type === 'CommentCreated'){
        const status = data.content.includes('orange') ? 'rejected':'approved'
        await axios.post('http://localhost:4005/events',{
            type:'CommentModerated',
            data:{
                id:data.id,
                postId:data.postId,
                status,
                content:data.content
            }
        })
    }
    res.send({})
})

app.listen(4003,() => console.log('MODERATION listen to 4003'))