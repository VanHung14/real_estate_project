const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


class CommentsController {

    // [POST] /api/comments/
    async createComment(req, res, next){
        try{
            let date = new Date()
            date.setHours(date.getHours()+7)
            let comment = await prisma.comments.create({
                data: {
                    user_id: req.user.id,
                    post_id: req.body.post_id,
                    comment: req.body.comment,
                    created_at: date,
                    updated_at: date
                }
            })
            if(comment) {
                res.send(comment)
            }
            else{
                res.status(400).send('Comment failed!')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [PUT] /api/comments/:id
    async updateComment(req, res, next){
        try{
            let date = new Date()
            date.setHours(date.getHours()+7)
            let id = parseInt(req.params.id)
            let comment = await prisma.comments.findFirst({ where: { id: id}})
            if(req.user.id != comment.id){
                res.status(403).send('Not permission!')
            }
            else{
                let update = await prisma.comments.update({
                    where: {
                    id: id
                }, data: {
                    comment: req.body.comment,
                    updated_at: date
                }
                })
                if(update) {
                    res.send(update)
                }
                else{
                    res.status(400).send('Update comment failed!    ')
                }
            }
            
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [GET] /api/comments/
    async getComments(req, res, next) {
        try{
            if(req.user.role_id == 1){
                let perPage = 50
                let page = parseInt(req.query.page) || 1
                let comments = await prisma.comments.findMany({
                    skip: (perPage * page) - perPage,
                    take: perPage,
                })
                if(comments) {
                    res.send(comments)
                }
                else{
                    res.status(400).send('No comments found!')
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

    // [DELETE] /api/comments/:id
    async deleteComment(req, res, next) {
        try{
            let id = parseInt(req.params.id)
            let comment = await prisma.comments.findFirst({ where: { id: id}})
            if(req.user.id != comment.id){
                res.status(403).send('Not permission!')
            }
            else{
                let delCmt = await prisma.comments.delete({ where: { id: id}})
                if(delCmt){
                    res.send(delCmt)
                }
                else {
                    res.status(400).send('Delete comment failed!')
                }
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }
}
module.exports = new CommentsController