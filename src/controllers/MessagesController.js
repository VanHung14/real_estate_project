const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
class MessagesController {

    // [POST] /api/messages/
    async createMessage(req, res, next) {
        try{
            console.log(req.body, req.user)
            let date = new Date()
            date.setHours(date.getHours()+7)
            let message = await prisma.messages.create({
                data: {
                    sender_id: req.user.id,
                    receive_id: req.body.receive_id,
                    message: req.body.message,
                    created_at: date,
                    updated_at: date
                }
            })
            if(message) {
                res.status(201).send(message)
            }
            else{
                res.status(400).send('message failed!')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [GET] /api/messages/
    // Only works for admin
    async getMessages(req, res, next) {
        try{
            if(req.user.role_id == 1){
                let perPage = 50
                let page = parseInt(req.query.page) || 1
                let messages = await prisma.messages.findMany({
                    skip: (perPage * page) - perPage,
                    take: perPage,
                })
                if(messages){
                    res.send(messages)
                }
                else{
                    res.status(404).send('No messages found!')
                }
            }
            else{
                res.status(403).send('No permission! Only admin can get comments.')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [GET] /api/messages/:id/chat
    async getConversation(req, res, next){
        try {
            let id = parseInt(req.params.id)
            let perPage = 50
            let page = parseInt(req.query.page) || 1
            let conversation = await prisma.messages.findMany({
                skip: (perPage * page) - perPage,
                take: perPage,
                where: 
                {
                    OR: [{
                        sender_id: req.user.id,
                        receive_id: id
                    },
                    {
                        sender_id: id,
                        receive_id: req.user.id
                    }]
                },
                orderBy: [{created_at : 'desc'}],
            })
            if(conversation) {
                res.send(conversation)
            }
            else{
                res.status(404).send('No conversation found!')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }
}

module.exports = new MessagesController