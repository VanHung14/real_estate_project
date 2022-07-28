const { PrismaClient } = require('@prisma/client')
const config = require('../configs/config');
const jwt = require('jsonwebtoken')
const utils = require('../utils/utils');
const fs = require('fs')
var multer = require('multer');
const { prependListener } = require('process');


const prisma = new PrismaClient()

class PostsController {


    // [GET] /posts/
    async all (req, res, next) {
        let posts = await prisma.posts.findMany()
        if(posts){
            for(var i = 0; i< posts.length;++i){
                let address = await prisma.address.findFirst({where: {
                    id : posts[i].id
                }})
                posts[i].address = address
            }
            res.send(posts)
        }
        else{
            res.status(404).send('Not found!')
        }
    }

    // [GET] /posts/sort?price=?&views=?&created_at=?
    async sort (req, res, next) {
        let sort = {}
        if(req.query.price == 'asc') {
            sort = { price: 'asc'}
        }
        else if (req.query.price == 'desc') {
            sort = { price: 'desc'}
        }
        else if (req.query.views == 'asc') {
            sort = { views: 'asc'}
        }
        else if (req.query.views == 'desc') {
            sort = { views: 'desc'}
        }
        else if (req.query.created_at == 'asc') {
            sort = { created_at: 'asc'}
        }
        else if (req.query.created_at == 'desc') {
            sort = { created_at: 'desc'}
        }
        let posts = await prisma.posts.findMany({
            orderBy: [sort]
        })
        if(posts){
            for(var i = 0; i< posts.length;++i){
                let address = await prisma.address.findFirst({where: {
                    id : posts[i].id
                }})
                posts[i].address = address
                console.log(posts[i])
            }
            res.send(posts)
        }
        else{
            res.status(404).send('Not found!')
        }
    }

    // [POST] /posts/filter
    async filter (req, res, next){
        let address = await prisma.address.findMany({ where :{
            city: req.query.city,
            district: req.query.district,
            ward: req.query.ward,
            // street: req.query.street,
        }})
        console.log(address)
        let posts=[]
        if(address){
            for(var i = 0; i< address.length;++i){
                let post = await prisma.address.findFirst({where: {
                    id : address[i].id
                }})
                posts[i]=post
                posts[i].address = address[i]
            }
            res.send(posts)
        }
        else{
            res.status(404).send('Not found!')
        }
    }

    // [POST] /posts/create
    async create (req, res, next) {

        let address = await prisma.address.findFirst({ where :{
            city: req.body.city,
            district: req.body.district,
            ward: req.body.ward,
            street: req.body.street
        }})
        if(address) {
            try {
                var array = req.files
                for(var i =0; i< array.length; ++i){
                    fs.unlinkSync(array[i].path)
                }
                
              } catch(err) {
                console.error(err)
              }
            res.status(401).send('Address is already created!')
        }
        else{
            let date = new Date()
            date.setHours(date.getHours()+7)
            let post = await prisma.posts.create({
                data: {
                title: req.body.title,
                content: req.body.content,
                price: parseFloat(req.body.price),
                phone: req.body.phone,
                status: req.body.status,
                created_at: date,
                updated_at: date,
                user_id: req.user.id,
                address: {
                    create: {
                    city: req.body.city,
                    district: req.body.district,
                    ward: req.body.ward,
                    street: req.body.street
                    }
                },
                }
            })

            if(post){
                let findPost = await prisma.posts.findFirst({where: { address: {
                    city: req.body.city,
                    district: req.body.district,
                    ward: req.body.ward,
                    street: req.body.street}}})
                
                var array = req.files
                for(var i =0; i< array.length; ++i){
                    array[i] = {    
                        image_path: array[i].path,
                        post_id: findPost.id
                    }
                }

                console.log('array path',array)
                let image = await prisma.images.createMany({
                    data : array
                })
                res.send(post)
            }
            else{
                res.status(400).send('Post failed!')
            }
        }
    }
}

module.exports = new PostsController;

