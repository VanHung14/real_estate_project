const { PrismaClient } = require('@prisma/client')
const config = require('../configs/config');
const jwt = require('jsonwebtoken')
const utils = require('../utils/utils');
const prisma = new PrismaClient()

class PostsController {

    // [POST] /posts/create
    async create (req, res, next) {
        let post = await prisma.posts.create({
            data: {
            title: req.body.title,
            content: req.body.content,
            price: req.body.price,
            phone: req.body.phone,
            status: req.body.status,
            user_id: req.user.id,
            address: {
                create: {
                city: req.body.address.city,
                district: req.body.address.district,
                ward: req.body.address.ward,
                street: req.body.address.street
                }
            }
            }
        })
        if(post) {
            res.send(post)
        }
        else{
            res.status(400).send('Post failed!')
        }
    }
}

module.exports = new PostsController;
