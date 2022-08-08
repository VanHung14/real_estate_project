const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


class CommentsController {

    // [POST] /api/comments/
    async createComment(req, res, next){
        try{
            let postId = parseInt(req.body.post_id)
            let date = new Date()
            date.setHours(date.getHours()+7)
            let comment = await prisma.comments.create({
                data: {
                    user_id: req.user.id,
                    post_id: postId,
                    comment: req.body.comment,
                    created_at: date,
                    updated_at: date
                }
            })
            if(comment) {
                res.status(200).send(comment)
            }
            else{
                res.status(400).send('Comment failed!')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [PATCH] /api/comments/:id  
    // Only works with users who own this comment
    async updateComment(req, res, next){
        try{
            let date = new Date()
            date.setHours(date.getHours()+7)
            let id = parseInt(req.params.id)
            let comment = await prisma.comments.findFirst({ where: { id: id}})
            if(comment){
                if(req.user.id == comment.user_id){
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
                        res.status(400).send('Update comment failed!')
                    }
                    
                }
                else{
                    res.status(403).send('Not permission! Only works with users who own this comment')
                }
            }
            else{ 
                res.status(404).send('No comment found!')
            }
            
            
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [GET] /api/comments?page=&postId=       
    // GET all comments (have pagination), only works for admin
    // GET comment by post_id works with any roles
    async getComments(req, res, next) { 
        try{
            let postId = parseInt(req.query.postId)
            let perPage = 50
            let page = parseInt(req.query.page) || 1
            let data = {
                skip: (perPage * page) - perPage,
                take: perPage,
            }
            if(Number.isInteger(postId)){
                data["where"] = { post_id: postId }
            }
            console.log('data', data)
            let comments = await prisma.comments.findMany(data)
            console.log(comments)
            if(Number.isInteger(postId)){
                if(comments) {
                    res.send(comments)
                }
                else{
                    res.status(400).send('No comments found!')
                }
            }
            else{
                if(req.user.role_id == 1 && comments){
                    res.send(comments)
                }
                else{
                    res.status(403).send('No permission! Only admin can get comments.')
                }
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [DELETE] /api/comments/:id
    // Only works with users who own this comment, or admin
    async deleteComment(req, res, next) {
        try{
            let id = parseInt(req.params.id)
            let comment = await prisma.comments.findFirst({ where: { id: id}})
            if(req.user.id == comment.user_id || req.user.role_id == 1 ){
                let delCmt = await prisma.comments.delete({ where: { id: id}})
                if(delCmt){
                    res.send(delCmt)
                }
                else {
                    res.status(400).send('Delete comment failed!')
                }
            }
            else{
                res.status(403).send('Not permission! Only works with users who own this comment, or admin')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }
}
module.exports = new CommentsController