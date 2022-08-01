const { PrismaClient } = require('@prisma/client')
const config = require('../configs/config');
const jwt = require('jsonwebtoken')
const utils = require('../utils/utils');
const fs = require('fs')

const prisma = new PrismaClient()

class PostsController {


    // [GET] /api/posts?sort=&direct=&filter=address&city=&district=&ward=
    async getPosts(req, res, next) {
        try{
            if(JSON.stringify(req.query) === JSON.stringify({})){ // get all posts 
                let posts = await prisma.posts.findMany()
                if(posts){
                    for(var i = 0; i< posts.length;++i){
                        let address = await prisma.address.findFirst({where: {id : posts[i].id}})
                        posts[i].address = address
                        let image = await prisma.images.findFirst({where:{ post_id: posts[i].id}})
                            posts[i].first_image_path= image.image_path
                    }
                    res.send(posts)
                }
                else{
                    res.status(404).send('Not found!')
                }
            }
            else { // co sort hoac filter
                let sortKey = req.query.sort || 'price'
                let sortDirect = req.query.direct || 'desc'
                let sort = {}
                sort[sortKey]= sortDirect
                
                let filter = req.query.filter || 'price'
                // console.log(filter)
                let posts = []
                if(filter == 'price'){
                    let min = req.query.min || 0
                    let max = req.query.max || 100
                    posts = await prisma.posts.findMany({ where: { price: {
                        lte: max,
                        gte: min
                    }},
                        orderBy: [sort],
                    })
                }
                else {
                    let address = await prisma.address.findMany({where: {
                        city: {contains: req.query.city},
                        district: {contains: req.query.district},
                        ward: {contains: req.query.ward},
                        street: {contains: req.query.street}
                    }})
                    let idList = []
                    for(var i = 0;i<address.length; ++i){
                        idList.push(address[i].id)
                    }
                    posts = await prisma.posts.findMany({ where: {
                        id : { in : idList}
                    },
                        orderBy: [sort],
                    })
                }
                if(posts){
                    for(var i = 0; i< posts.length;++i){
                        let address = await prisma.address.findFirst({where: {id : posts[i].id}})
                        posts[i].address = address
                        let image = await prisma.images.findFirst({where:{ post_id: posts[i].id}})
                        posts[i].first_image_path= image.image_path
    
                    }
                    res.send(posts)
                }
                else{
                    res.status(404).send('Not found!')
                }
            }
        }
        catch(err){
            res.status(400).send(err)
        }
        
    }

    // [GET]/posts/:id
    async getPostById(req, res, next){
        try{
            let id = parseInt(req.params.id)
            let post = await prisma.posts.findFirst({where: { id: id }})
            if(post){
                post.image_path_list=[]
                let address = await prisma.address.findFirst({where: { id: post.id}})
                post.address= address
                let images = await prisma.images.findMany({where:{ post_id: post.id}})
                for(var i =0;i<images.length;++i){
                    console.log(images[i].image_path)
                    post.image_path_list.push(images[i].image_path)
                }
                res.send(post)
            }
            else{
                res.status(400).send('No post found!')
            }
        }
        catch(err){
            res.status(400).send(err)

        }
       
    }
    
    // [POST] api/posts/
    async create (req, res, next) {
        try{
            let address = await prisma.address.findFirst({ where :{
                city: req.body.city,
                district: req.body.district,
                ward: req.body.ward,
                street: req.body.street
            }})
            if(address) {
                try { // xoa file o trong folder khi ko tao them post
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
                    var array = req.files
                    for(var i =0; i< array.length; ++i){
                        array[i] = {    
                            image_path: array[i].path,
                            post_id: post.id
                        }
                    }
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
        catch(err){
            res.status(400).send(err)
        }
    }

    // [PUT]/api/posts/:id
    async updateNoDeleteOldImage(req, res, next){
        let id = parseInt(req.params.id)
        // console.log(req.body)
        let date = new Date()
        date.setHours(date.getHours()+7)
        let check = await prisma.posts.findFirst({ where: { id: id }})
        // console.log(check.created_at.getTime() == check.updated_at.getTime())
        if (check.created_at.getTime() != check.updated_at.getTime()) { // ktra xem bai viet co ching sua lan nao chua
            res.status(400).send('This post has been changed before.')
        }
        else{
            let post = await prisma.posts.update({
                where: {
                    id: id
                }, 
                data: {
                    title: req.body.title,
                    content: req.body.content,
                    price: parseFloat(req.body.price),
                    phone: req.body.phone,
                    status: req.body.status,
                    updated_at: date,
                    user_id: req.user.id,
                }
            })
            if(post){
                var array = req.files
                for(var i =0; i< array.length; ++i){
                    array[i] = {
                        image_path: array[i].path,
                        post_id: post.id
                    }
                }
                console.log('array path',array)
                let image = await prisma.images.createMany({
                    data : array
                })
                let address = await prisma.address.update({
                    where:{
                        id: post.id
                    }
                    ,data: {
                        city: req.body.city,
                        district: req.body.district,
                        ward: req.body.ward,
                        street: req.body.street
                    }
                })
                res.send(post)
            }
            else{
                res.status(400).send('No post found!')
            }
        }
        
    }


    // [PUT]/posts/:id/delImgs
    async updateDeleteOldImage(req, res, next){
        let id = parseInt(req.params.id)
        let date = new Date()
        date.setHours(date.getHours()+7)
        let check = await prisma.posts.findFirst({ where: { id: id }})
        if (check.created_at != check.updated_at) { // ktra xem bai viet co chinh sua lan nao chua
            // xoa anh moi them vao
            res.status(400).send('This post has been changed before.')
        }
        else{
            let post = await prisma.posts.update({
                where: {
                    id: id
                }, 
                data: {
                    title: req.body.title,
                    content: req.body.content,
                    price: parseFloat(req.body.price),
                    phone: req.body.phone,
                    status: req.body.status,
                    updated_at: date,
                    user_id: req.user.id,
                }
            })
            if(post){
                var array = req.files
                for(var i =0; i< array.length; ++i){
                    array[i] = {
                        image_path: array[i].path,
                        post_id: post.id
                    }
                }
                // console.log('array path',array)
                // delete image in local folder
                let oldImage = await prisma.images.findMany({ where: { post_id: post.id}}) 
                console.log(oldImage)
                try {
                    for(var i =0; i< oldImage.length; ++i){
                        fs.unlinkSync(oldImage[i].image_path)
                    }
                  } catch(err) {
                    console.error(err)
                  }
                res.send(post)
    
                // delete record in DB
                let deleteImg = await prisma.images.deleteMany({ where: { post_id: post.id}})
    
                // create new record
                let image = await prisma.images.createMany({
                    data : array
                })
                // update new address
                let address = await prisma.address.update({
                    where:{
                        id: post.id
                    }
                    ,data: {
                        city: req.body.city,
                        district: req.body.district,
                        ward: req.body.ward,
                        street: req.body.street
                    }
                })
                
            }
            else{
                res.status(400).send('No post found!')
            }
        }
        
        
    }

    // [PUT] /api/:id/
    async updatePost(req, res, next){
        try{
            let id = parseInt(req.params.id)
            let date = new Date()
            date.setHours(date.getHours()+7)
            let check = await prisma.posts.findFirst({ where: { id: id }})
            if (check.created_at.getTime() != check.updated_at.getTime()) { // ktra xem bai viet co chinh sua lan nao chua
            // if(false){
                try { // xoa file o trong folder khi ko tao them post
                    var array = req.files
                    for(var i =0; i< array.length; ++i){
                        fs.unlinkSync(array[i].path)
                    }
                  } catch(err) {
                    console.error(err)
                  }
                res.status(400).send('This post has been changed before.')
            }
            else{
                let post = await prisma.posts.update({
                    where: {
                        id: id
                    }, 
                    data: {
                        title: req.body.title,
                        content: req.body.content,
                        price: parseFloat(req.body.price),
                        phone: req.body.phone,
                        status: req.body.status,
                        updated_at: date,
                        user_id: req.user.id,
                    }
                })
                if(post){
                    // delete image in local folder
                    let delList =[]
                    // console.log(req.body.delList.length)
    
                    if(typeof(req.body.delList)=='string'){
                        delList = new Array(req.body.delList) 
                    }
                    else{
                        delList = req.body.delList
                    }
                    try {
                            for(var i =0; i< delList.length; ++i){
                                fs.unlinkSync(delList[i])
                            }
                          } catch(err) {
                            console.error(err)
                          }
                    // delete record in DB
                    let deleteImg = await prisma.images.deleteMany({ where:{ image_path :{ in : req.body.delList}}})
    
                    var array = req.files
                    for(var i =0; i< array.length; ++i){
                        array[i] = {
                            image_path: array[i].path,
                            post_id: post.id
                        }
                    }
                    let image = await prisma.images.createMany({
                        data : array
                    })
                    let address = await prisma.address.update({
                        where:{
                            id: post.id
                        }
                        ,data: {
                            city: req.body.city,
                            district: req.body.district,
                            ward: req.body.ward,
                            street: req.body.street
                        }
                    })
                    res.send(post)
                }
                else{
                    res.status(400).send('No post found!')
                }
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

}

module.exports = new PostsController;

